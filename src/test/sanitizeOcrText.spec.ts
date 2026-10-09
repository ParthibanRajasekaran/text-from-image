import { describe, it, expect } from 'vitest';
import { sanitizeOcrText } from '../../utils/sanitizeOcrText';

describe('sanitizeOcrText', () => {
  it('removes null bytes', () => {
    expect(sanitizeOcrText('hello\0world')).toBe('helloworld');
    expect(sanitizeOcrText('\0\0\0')).toBe('');
  });

  it('removes Unicode bidirectional override characters (CVE-2021-42574)', () => {
    // U+202E RIGHT-TO-LEFT OVERRIDE
    expect(sanitizeOcrText('hello‮world')).toBe('helloworld');
    // U+202D LEFT-TO-RIGHT OVERRIDE
    expect(sanitizeOcrText('hello‭world')).toBe('helloworld');
    // U+2068 FIRST STRONG ISOLATE
    expect(sanitizeOcrText('hello⁨world')).toBe('helloworld');
  });

  it('removes other control characters', () => {
    // SOH (Start of Heading)
    expect(sanitizeOcrText('hello\x01world')).toBe('helloworld');
    // BEL (Bell)
    expect(sanitizeOcrText('hello\x07world')).toBe('helloworld');
    // VT (Vertical Tab) - NOT preserved
    expect(sanitizeOcrText('hello\x0Bworld')).toBe('helloworld');
  });

  it('preserves regular whitespace', () => {
    // Space
    expect(sanitizeOcrText('hello world')).toBe('hello world');
    // Tab
    expect(sanitizeOcrText('hello\tworld')).toBe('hello\tworld');
    // Newline
    expect(sanitizeOcrText('hello\nworld')).toBe('hello\nworld');
    // Carriage return
    expect(sanitizeOcrText('hello\rworld')).toBe('hello\rworld');
  });

  it('preserves Unicode scripts (Arabic, Tamil, CJK)', () => {
    // Arabic
    expect(sanitizeOcrText('مرحبا')).toBe('مرحبا');
    // Tamil
    expect(sanitizeOcrText('வணக்கம்')).toBe('வணக்கம்');
    // Chinese
    expect(sanitizeOcrText('你好')).toBe('你好');
    // Emoji (should be preserved)
    expect(sanitizeOcrText('hello 👋 world')).toBe('hello 👋 world');
  });

  it('preserves regular ASCII and extended Unicode', () => {
    const mixed = 'Hello 123!@# Ñoño مرحبا';
    expect(sanitizeOcrText(mixed)).toBe(mixed);
  });

  it('handles empty strings and all-whitespace strings', () => {
    expect(sanitizeOcrText('')).toBe('');
    expect(sanitizeOcrText('   ')).toBe('   ');
    expect(sanitizeOcrText('\n\n\n')).toBe('\n\n\n');
  });
});
