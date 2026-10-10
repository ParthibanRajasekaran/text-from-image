/**
 * Locale rule packs: what a price or a date should look like for a locale, and a hint for why a
 * screen that shows the wrong one is wrong. Built on Intl, so there is no data to ship or maintain,
 * and nothing here touches the network.
 *
 *   expectedCurrency(1234.5, { currency: 'EUR', locale: 'de-DE' })  // '1.234,50 €'
 *   expectedDate('2026-03-04', { locale: 'en-GB' })                  // '04/03/2026'
 */

/** Direction and spacing marks that are invisible on screen and that OCR never reads. */
const INVISIBLE = /[\u200e\u200f\u061c\u202a-\u202e\u2066-\u2069]/g;
const SPACES = /[\u00a0\u2007\u2009\u202f]/g;

/** The text as a user sees it: no bidi marks, and every kind of non-breaking space is a plain space. */
export function visibleText(s: string): string {
  return s.replace(INVISIBLE, '').replace(SPACES, ' ');
}

export interface CurrencyRule {
  currency: string;
  locale: string;
  /** 'symbol' (default, "£"), 'code' ("GBP") or 'name' ("British pounds"). */
  display?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  /** Digits after the decimal separator. Default: the currency's own (2 for GBP, 0 for JPY). */
  fractionDigits?: number;
}

export interface DateRule {
  locale: string;
  /** Default 'UTC', so the same date renders the same on every CI machine. */
  timeZone?: string;
  /** Intl.DateTimeFormat options. Default: numeric day, month and year. */
  format?: Intl.DateTimeFormatOptions;
}

export function expectedCurrency(amount: number, rule: CurrencyRule): string {
  const fd = rule.fractionDigits;
  return visibleText(
    new Intl.NumberFormat(rule.locale, {
      style: 'currency',
      currency: rule.currency,
      currencyDisplay: rule.display ?? 'symbol',
      ...(fd === undefined ? {} : { minimumFractionDigits: fd, maximumFractionDigits: fd }),
    }).format(amount)
  );
}

const DEFAULT_DATE: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

export function expectedDate(date: Date | string | number, rule: DateRule): string {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00Z`) : new Date(date);
  if (Number.isNaN(d.getTime())) throw new Error(`RenderCheck: not a date: ${String(date)}`);
  return visibleText(new Intl.DateTimeFormat(rule.locale, { timeZone: 'UTC', ...(rule.format ?? DEFAULT_DATE), ...(rule.timeZone ? { timeZone: rule.timeZone } : {}) }).format(d));
}

/** Locales whose number, currency and date conventions differ enough to be worth naming in a hint. */
export const COMMON_LOCALES = ['en-US', 'en-GB', 'en-IN', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'pt-BR', 'nl-NL', 'ja-JP', 'zh-CN', 'ar-EG', 'he-IL'] as const;
export const COMMON_CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'INR', 'CAD', 'AUD', 'CHF', 'CNY', 'BRL'] as const;

const has = (read: string, candidate: string) => visibleText(read).includes(candidate);

/**
 * Why does the screen not show the expected price? Returns a one-line hint, or undefined when the
 * text does not look like any of the same price in another currency or another locale's format.
 */
export function explainCurrency(read: string, amount: number, rule: CurrencyRule): string | undefined {
  const want = expectedCurrency(amount, rule);
  for (const currency of COMMON_CURRENCIES) {
    if (currency === rule.currency) continue;
    const other = expectedCurrency(amount, { ...rule, currency });
    if (other !== want && has(read, other)) return `The screen shows ${currency} (${other}), not ${rule.currency} (${want}).`;
  }
  for (const locale of COMMON_LOCALES) {
    if (locale === rule.locale) continue;
    const other = expectedCurrency(amount, { ...rule, locale });
    if (other !== want && has(read, other)) return `The amount is formatted for ${locale} (${other}), but ${rule.locale} should show ${want}.`;
  }
  return undefined;
}

/** The same question for a date: is it another locale's order or separators? */
export function explainDate(read: string, date: Date | string | number, rule: DateRule): string | undefined {
  const want = expectedDate(date, rule);
  for (const locale of COMMON_LOCALES) {
    if (locale === rule.locale) continue;
    const other = expectedDate(date, { ...rule, locale });
    if (other !== want && has(read, other)) return `The date is formatted for ${locale} (${other}), but ${rule.locale} should show ${want}.`;
  }
  return undefined;
}

/**
 * Tesseract language code for a locale, for pages whose script English data cannot read.
 * Supply the data with `langPath`: only English ships with the package.
 */
export function ocrLangFor(locale: string): string {
  const lang = locale.toLowerCase().split('-')[0];
  const map: Record<string, string> = { ar: 'ara', he: 'heb', fa: 'fas', ur: 'urd', ja: 'jpn', ko: 'kor', zh: 'chi_sim', ru: 'rus', uk: 'ukr', el: 'ell', hi: 'hin', th: 'tha', de: 'deu', fr: 'fra', es: 'spa', it: 'ita', pt: 'por', nl: 'nld', pl: 'pol', tr: 'tur', sv: 'swe' };
  return map[lang] ?? 'eng';
}

/** Scripts written right to left. */
export function isRtl(locale: string): boolean {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & { getTextInfo?: () => { direction: string }; textInfo?: { direction: string } };
    const dir = l.getTextInfo?.().direction ?? l.textInfo?.direction;
    if (dir) return dir === 'rtl';
  } catch {
    /* fall through */
  }
  return ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'ug', 'dv'].includes(locale.toLowerCase().split('-')[0]);
}
