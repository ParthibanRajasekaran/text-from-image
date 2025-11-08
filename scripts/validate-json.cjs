const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv();

function validateSchema(schemaPath, dataPath) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    console.error(`Validation errors for ${dataPath}:`, validate.errors);
    process.exit(1);
  }
}

// Validate OCR schema against goldens
const schemaFile = path.resolve(__dirname, '../specs/schemas/ocr-result.schema.json');
const goldensDir = path.resolve(__dirname, '../specs/ai/evals/goldens');
fs.readdirSync(goldensDir).forEach(file => {
  if (file.endsWith('.json')) {
    validateSchema(schemaFile, path.join(goldensDir, file));
  }
});

// Validate tokens
const tokensFile = path.resolve(__dirname, '../specs/ux/tokens.json');
try {
  JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
} catch (e) {
  console.error('Invalid tokens.json:', e.message);
  process.exit(1);
}
console.log('All JSON schemas and tokens are valid.');
