# AI UI Verification Dataset

**50 real-world examples of UI verification failures where code-level tests pass but user-visible text is wrong.**

## What This Is

This dataset documents common failure patterns when AI generates UI code:
- DOM is correct ✓
- Logic is correct ✓
- Tests pass ✓
- **But users see wrong text** ✗

## Why It Matters

AI coding tools accelerate development, but they miss a class of bugs that manual testing would catch. This dataset helps:
- **Teams** understand the gap and build better tests
- **Researchers** study AI-generated code quality
- **Tool builders** implement OCR-based verification
- **The field** advance beyond code-level testing

## Dataset Structure

50 examples across 5 failure categories (10 per category):

### 1. Wrong Currency (10 examples)
- Symbol mismatch ($USD vs £GBP)
- Decimal separators (1,299.99 vs 1.299,99)
- Currency codes (CAD vs USD)

### 2. Missing/Broken Confirmations (10 examples)
- Payment confirmation missing
- Order number not displayed
- Booking details incomplete
- Form submission success absent

### 3. Truncated Text (10 examples)
- Error messages cut off
- Tooltips clipped
- Labels incomplete
- Overflow hidden

### 4. Localisation Mismatch (10 examples)
- Date formats (MM/DD/YYYY vs DD/MM/YYYY)
- Time formats (14:35 vs 2:35 PM)
- Address layouts
- Day/month names not translated

### 5. Invisible/Zero-Contrast Text (10 examples)
- White text on white background
- Disabled state text invisible
- Placeholder text visible as value
- Low-contrast text

## File Format

### `examples.json`

```json
{
  "id": "currency-mismatch-001",
  "category": "wrong-currency",
  "description": "Checkout page shows USD instead of GBP",
  "expectedText": "Total: £99.99",
  "actualText": "Total: $99.99",
  "failureMode": "rendered-output",
  "testPattern": "expect(text).toContain('£99.99')",
  "lesson": "Currency symbols default to USD without explicit locale handling",
  "difficulty": "easy"
}
```

## How to Use

### View Examples
```bash
cat examples.json | jq '.[] | select(.category == "wrong-currency")'
```

### Generate Screenshots (Canvas-based)
```bash
node generate-screenshots.mjs
# Outputs: screenshots/[id].png
```

### Use in Tests
```typescript
import examples from './examples.json'

for (const example of examples) {
  test(`catches: ${example.description}`, async () => {
    const result = await verify({
      imagePath: `./screenshots/${example.id}.png`,
      expectedText: example.expectedText,
    })
    
    expect(result.outcome).toBe('fail')  // Should detect the error
    expect(result.missingWords).toContain(example.expectedText.split(' ')[0])
  })
}
```

## Citation

If you use this dataset in research or tools, cite as:

```bibtex
@dataset{freetextfromimage_ai_ui_dataset_2026,
  title={AI UI Verification Dataset: 50 Real-World Rendering Failures},
  author={Rajasekaran, Parthiban},
  year={2026},
  url={https://github.com/ParthibanRajasekaran/text-from-image/tree/main/dataset/ai-ui-verification}
}
```

## Contributing

To add examples:

1. Create entry in `examples.json` following schema
2. Add canvas generation to `generate-screenshots.mjs`
3. Run generator to create screenshot
4. Submit PR

## License

MIT — Dataset is free to use, cite, fork, and distribute.

## Related Resources

- [RenderCheck npm package](https://www.npmjs.com/package/@rendercheck/sdk)
- [FreeTextFromImage Documentation](https://getrendercheck.com)
- [Verification Debt Score Assessment](https://getrendercheck.com/verify-debt-score)
- [AI UI Verification in CI](https://getrendercheck.com/workflows/ocr-in-ci)
