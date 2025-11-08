# 📚 Documentation

Additional documentation for the Extract Text From Image project.

## 📖 Essential Guides

### [GUARDRAILS.md](./GUARDRAILS.md) 🛡️ **NEW**
**Environment variable guardrails** - Prevent production drift!
- Build-time validation (fails if critical vars missing)
- CI/CD checks in GitHub Actions
- Pre-deploy and post-deploy verification
- Clear error messages and fix instructions

### [NO_DRIFT.md](./NO_DRIFT.md) 🔥
**Production drift prevention system** - Read this first!
- Environment variable management
- Deploy and verify workflows
- Troubleshooting production issues
- One-command verification

### [FEATURE_FLAGS_ANALYSIS.md](./FEATURE_FLAGS_ANALYSIS.md)
Complete analysis of all feature flags and environment variables:
- All 8 feature flags documented
- 100+ usage locations mapped
- Root cause analysis of drift issues
- Refactoring recommendations

### [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
Summary of drift prevention implementation:
- What was built and why
- Before/after comparison
- Success criteria verification

### [ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md)
Comprehensive error handling system:
- 13 error types and their meanings
- Testing error scenarios
- Recovery strategies
- User-friendly error messages

### [DEPLOYMENT.md](./DEPLOYMENT.md)
Complete deployment guide (archived from root):
- One-time setup instructions
- GitHub Actions configuration
- Environment variable setup
- Troubleshooting deployment issues

---

## 📂 Quick Links

**Main Documentation:** [../README.md](../README.md)  
**Environment Template:** [../.env.example](../.env.example)  
**License:** [../LICENSE](../LICENSE)  
**Source Code:** [GitHub Repository](https://github.com/ParthibanRajasekaran/text-from-image)

## 🚀 Quick Start

```bash
# Setup environment
cp ../.env.example ../.env.local
# Edit .env.local and set VITE_UX_V2=1

# Deploy to production
npm run deploy:prod

# Verify deployment
npm run verify:full

# Compare environments
npm run env:diff
```

See **NO_DRIFT.md** for complete workflows.
