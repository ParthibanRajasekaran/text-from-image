/**
 * Sanitize OCR-extracted text to prevent injection attacks
 *
 * Removes:
 * - Null bytes (\0)
 * - Unicode bidirectional override characters (CVE-2021-42574)
 * - Control characters (except tabs, newlines, carriage returns)
 *
 * Preserves:
 * - All Unicode scripts (Arabic, Tamil, CJK, etc.)
 * - Regular whitespace (spaces, newlines, tabs)
 * - Printable ASCII and extended Unicode
 */
export function sanitizeOcrText(raw: string): string {
  return raw
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove Unicode bidirectional override characters (CVE-2021-42574)
    // Range: U+202A-U+202E, U+2066-U+2069
    .replace(/[‪-‮⁦-⁩]/g, '')
    // Remove other control characters (except tab, newline, carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Test: sanitizeOcrText('hello\0world') => 'helloworld'
 * Test: sanitizeOcrText('hello‮world') => 'helloworld' (BDI override removed)
 * Test: sanitizeOcrText('hello\nworld') => 'hello\nworld' (newline preserved)
 */
