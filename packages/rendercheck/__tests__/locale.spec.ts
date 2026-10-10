import { describe, expect, it } from 'vitest';
import { expectedCurrency, expectedDate, explainCurrency, explainDate, isRtl, ocrLangFor, visibleText } from '../src/core/locale';
import { normalizeText } from '../src/core/text';

describe('expectedCurrency', () => {
  it('follows each locale', () => {
    expect(expectedCurrency(1234.5, { currency: 'GBP', locale: 'en-GB' })).toBe('£1,234.50');
    expect(expectedCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' })).toBe('1.234,50 €');
    expect(expectedCurrency(1234.5, { currency: 'EUR', locale: 'fr-FR' })).toBe('1 234,50 €');
    expect(expectedCurrency(1234, { currency: 'JPY', locale: 'ja-JP' })).toMatch(/1,234$/);
  });
  it('never contains a non-breaking space or a bidi mark', () => {
    for (const locale of ['fr-FR', 'de-CH', 'ar-EG', 'he-IL']) {
      expect(expectedCurrency(1234.5, { currency: 'EUR', locale })).not.toMatch(/[\u00a0\u202f\u200e\u200f\u061c]/);
    }
  });
  it('honours display and fractionDigits', () => {
    expect(expectedCurrency(5, { currency: 'GBP', locale: 'en-GB', display: 'code', fractionDigits: 0 })).toMatch(/GBP.?5/);
  });
  it('uses Arabic-Indic digits for ar-EG, so ASCII digits do not pass', () => {
    expect(expectedCurrency(14, { currency: 'EGP', locale: 'ar-EG' })).toMatch(/[٠-٩]/);
  });
});

describe('expectedDate', () => {
  it('uses the locale order', () => {
    expect(expectedDate('2026-03-04', { locale: 'en-GB' })).toBe('04/03/2026');
    expect(expectedDate('2026-03-04', { locale: 'en-US' })).toBe('03/04/2026');
    expect(expectedDate('2026-03-04', { locale: 'de-DE' })).toBe('04.03.2026');
  });
  it('is stable across machine time zones', () => {
    expect(expectedDate('2026-12-31', { locale: 'en-GB' })).toBe('31/12/2026');
  });
  it('takes Intl options', () => {
    expect(expectedDate('2026-03-04', { locale: 'en-GB', format: { day: 'numeric', month: 'long', year: 'numeric' } })).toBe('4 March 2026');
  });
  it('rejects a bad date', () => {
    expect(() => expectedDate('nope', { locale: 'en-GB' })).toThrow(/not a date/);
  });
});

describe('explain', () => {
  it('names the wrong currency', () => {
    expect(explainCurrency('Total: $14.00', 14, { currency: 'GBP', locale: 'en-US' })).toMatch(/shows USD.*not GBP/);
  });
  it('names the wrong locale format', () => {
    expect(explainCurrency('Total: €1,234.50', 1234.5, { currency: 'EUR', locale: 'de-DE' })).toMatch(/formatted for en-US.*de-DE should show 1\.234,50 €/);
  });
  it('names a swapped day and month', () => {
    expect(explainDate('Due 04/03/2026', '2026-04-03', { locale: 'en-GB' })).toMatch(/formatted for en-US \(04\/03\/2026\).*en-GB should show 03\/04\/2026/);
  });
  it('says nothing when it cannot tell', () => {
    expect(explainCurrency('Total: banana', 14, { currency: 'GBP', locale: 'en-GB' })).toBeUndefined();
  });
});

describe('right to left and scripts', () => {
  it('ignores direction marks and non-breaking spaces when comparing', () => {
    expect(normalizeText('\u200f١٢٫٥٠\u00a0ج.م.\u200f')).toBe(normalizeText('١٢٫٥٠ ج.م.'));
    expect(visibleText('a\u202fb')).toBe('a b');
  });
  it('knows which locales are RTL', () => {
    expect(isRtl('ar-EG')).toBe(true);
    expect(isRtl('he-IL')).toBe(true);
    expect(isRtl('en-GB')).toBe(false);
  });
  it('maps locales to Tesseract languages', () => {
    expect(ocrLangFor('ar-EG')).toBe('ara');
    expect(ocrLangFor('de-DE')).toBe('deu');
    expect(ocrLangFor('en-GB')).toBe('eng');
  });
});
