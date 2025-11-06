#!/bin/bash

# Production Readiness Validation Script
# This script performs comprehensive checks before deployment

echo "🔍 Starting Production Readiness Validation..."
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Function to print test results
print_test() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Check Node.js version
echo "1. Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ $NODE_VERSION -ge 18 ]; then
    print_test "Node.js version >= 18" 0
else
    print_test "Node.js version >= 18 (current: $NODE_VERSION)" 1
fi
echo ""

# 2. Check dependencies installed
echo "2. Checking dependencies..."
if [ -d "node_modules" ]; then
    print_test "Dependencies installed" 0
else
    print_test "Dependencies installed" 1
    echo "  Run: npm install"
fi
echo ""

# 3. TypeScript compilation
echo "3. Running TypeScript compilation check..."
./node_modules/.bin/tsc --noEmit 2>&1
if [ $? -eq 0 ]; then
    print_test "TypeScript compilation" 0
else
    print_test "TypeScript compilation" 1
fi
echo ""

# 4. Check for npm vulnerabilities
echo "4. Checking for security vulnerabilities..."
AUDIT_OUTPUT=$(npm audit --json 2>&1)
VULNERABILITIES=$(echo $AUDIT_OUTPUT | grep -o '"vulnerabilities":{[^}]*}' | grep -o '[0-9]\+' | head -1)
if [ -z "$VULNERABILITIES" ] || [ "$VULNERABILITIES" -eq 0 ]; then
    print_test "No npm vulnerabilities" 0
else
    print_test "No npm vulnerabilities (found: $VULNERABILITIES)" 1
fi
echo ""

# 5. Check required files exist
echo "5. Checking required files..."
REQUIRED_FILES=(
    "App.tsx"
    "index.tsx"
    "index.html"
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "services/hybridService.ts"
    "services/tesseractService.ts"
    "services/transformersService.ts"
    "utils/errorHandling.ts"
    "utils/imagePreprocessing.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_test "File exists: $file" 0
    else
        print_test "File exists: $file" 1
    fi
done
echo ""

# 6. Check production build
echo "6. Testing production build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ] && [ -d "dist" ]; then
    print_test "Production build successful" 0
    
    # Check dist contents
    if [ -f "dist/index.html" ]; then
        print_test "Build output contains index.html" 0
    else
        print_test "Build output contains index.html" 1
    fi
else
    print_test "Production build successful" 1
fi
echo ""

# 7. Check file size limits consistency
echo "7. Checking configuration consistency..."
FILEINPUT_LIMIT=$(grep -o 'MAX_FILE_SIZE_BYTES = [0-9]* \* 1024 \* 1024' components/FileInput.tsx | grep -o '[0-9]*' | head -1)
TESSERACT_LIMIT=$(grep -o 'PROCESSING_MAX_SIZE_BYTES = [0-9]* \* 1024 \* 1024' services/tesseractService.ts | grep -o '[0-9]*' | head -1)
TRANSFORMERS_LIMIT=$(grep -o 'PROCESSING_MAX_SIZE_BYTES = [0-9]* \* 1024 \* 1024' services/transformersService.ts | grep -o '[0-9]*' | head -1)

if [ "$FILEINPUT_LIMIT" = "$TESSERACT_LIMIT" ] && [ "$FILEINPUT_LIMIT" = "$TRANSFORMERS_LIMIT" ]; then
    print_test "File size limits consistent ($FILEINPUT_LIMIT MB)" 0
else
    print_test "File size limits consistent" 1
    echo "  FileInput: ${FILEINPUT_LIMIT}MB, Tesseract: ${TESSERACT_LIMIT}MB, Transformers: ${TRANSFORMERS_LIMIT}MB"
fi
echo ""

# 8. Check error handling implementation
echo "8. Verifying error handling..."
ERROR_CODES=(
    "FILE_TOO_LARGE"
    "FILE_INVALID_TYPE"
    "FILE_CORRUPTED"
    "OCR_NO_TEXT_FOUND"
    "OCR_PROCESSING_FAILED"
    "OCR_TIMEOUT"
    "NETWORK_ERROR"
    "OUT_OF_MEMORY"
)

MISSING_CODES=0
for code in "${ERROR_CODES[@]}"; do
    if grep -q "$code" utils/errorHandling.ts; then
        : # Code exists, do nothing
    else
        ((MISSING_CODES++))
    fi
done

if [ $MISSING_CODES -eq 0 ]; then
    print_test "All error codes implemented" 0
else
    print_test "All error codes implemented" 1
    echo "  Missing $MISSING_CODES error codes"
fi
echo ""

# 9. Check documentation
echo "9. Checking documentation..."
DOC_FILES=(
    "README.md"
    "LICENSE"
    "PRODUCTION_AUDIT.md"
    "DEPLOYMENT_CHECKLIST.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_test "Documentation: $file" 0
    else
        print_test "Documentation: $file" 1
    fi
done
echo ""

# 10. Check git status
echo "10. Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ $UNCOMMITTED -eq 0 ]; then
        print_test "No uncommitted changes" 0
    else
        print_warning "Uncommitted changes detected ($UNCOMMITTED files)"
    fi
else
    print_warning "Not a git repository"
fi
echo ""

# Summary
echo "=============================================="
echo "📊 Validation Summary"
echo "=============================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - READY FOR PRODUCTION!${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED - PLEASE FIX ISSUES BEFORE DEPLOYMENT${NC}"
    exit 1
fi
