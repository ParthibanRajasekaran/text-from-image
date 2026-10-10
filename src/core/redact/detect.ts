/**
 * Find text in an OCR result that should not be shared: emails, card numbers, IBANs, national IDs,
 * phone numbers, IP addresses and API keys. Pure: it works on the words OCR returned and nothing else.
 *
 * It is a heuristic. OCR can misread characters and the patterns cannot know every format, so the
 * page always shows what was found and lets the person add boxes by hand. A miss is the risk to
 * design for, not a false alarm.
 */
import type { OCRResult, OCRWord } from '../ocr/types';

export type RedactKind = 'email' | 'card' | 'iban' | 'id' | 'phone' | 'ip' | 'secret';

export const KIND_LABEL: Record<RedactKind, string> = {
  email: 'Email addresses',
  card: 'Card numbers',
  iban: 'Bank account (IBAN)',
  id: 'National IDs (US SSN, UK NI)',
  phone: 'Phone numbers',
  ip: 'IP addresses',
  secret: 'API keys and tokens',
};

export const KINDS = Object.keys(KIND_LABEL) as RedactKind[];

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Finding {
  id: string;
  kind: RedactKind;
  text: string;
  box: Box;
}

export function luhn(digits: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (n < 0 || n > 9) return false;
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return digits.length > 0 && sum % 10 === 0;
}

export function ibanValid(raw: string): boolean {
  const s = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const moved = s.slice(4) + s.slice(0, 4);
  let rem = 0;
  for (const ch of moved) {
    const v = ch >= 'A' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of v) rem = (rem * 10 + (d.charCodeAt(0) - 48)) % 97;
  }
  return rem === 1;
}

interface Span {
  kind: RedactKind;
  start: number;
  end: number;
}

const SECRET =
  /\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,}|eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,})/g;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const CARD = /\b\d(?:[ -]?\d){12,18}\b/g;
const IBAN = /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){2,7}(?: ?[A-Z0-9]{1,3})?\b/g;
const SSN = /\b\d{3}-\d{2}-\d{4}\b/g;
const NI = /\b[A-CEGHJ-PR-TW-Z]{2} ?\d{2} ?\d{2} ?\d{2} ?[A-D]\b/g;
const IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const PHONE = /(?<![\w.])(?:\+|00)?\(?\d[\d ()-]{7,18}\d(?![\w])/g;

function* matches(re: RegExp, text: string) {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[0].length === 0) re.lastIndex++;
    else yield { start: m.index, end: m.index + m[0].length, text: m[0] };
  }
}

/** The longest run of digit groups inside a card-like match that passes the Luhn check. */
function cardSpan(match: { start: number; end: number; text: string }): { start: number; end: number } | null {
  const groups = [...match.text.matchAll(/\d+/g)].map((g) => ({ s: g.index!, e: g.index! + g[0].length, d: g[0] }));
  for (let len = groups.length; len >= 1; len--) {
    for (let i = 0; i + len <= groups.length; i++) {
      const digits = groups.slice(i, i + len).map((g) => g.d).join('');
      if (digits.length >= 13 && digits.length <= 19 && luhn(digits) && !/^(\d)\1+$/.test(digits)) {
        return { start: match.start + groups[i].s, end: match.start + groups[i + len - 1].e };
      }
    }
  }
  return null;
}

/** Spans of sensitive text in one line, most specific kinds first; later spans that overlap are dropped. */
export function findSpans(text: string, kinds: ReadonlySet<RedactKind> = new Set(KINDS)): Span[] {
  const found: Span[] = [];
  const add = (kind: RedactKind, start: number, end: number) => {
    if (!kinds.has(kind)) return;
    if (found.some((f) => start < f.end && end > f.start)) return;
    found.push({ kind, start, end });
  };

  for (const m of matches(SECRET, text)) add('secret', m.start, m.end);
  for (const m of matches(BEARER, text)) add('secret', m.start, m.end);
  for (const m of matches(EMAIL, text)) add('email', m.start, m.end);
  for (const m of matches(IBAN, text)) if (ibanValid(m.text)) add('iban', m.start, m.end);
  for (const m of matches(CARD, text)) {
    const s = cardSpan(m);
    if (s) add('card', s.start, s.end);
  }
  for (const m of matches(SSN, text)) add('id', m.start, m.end);
  for (const m of matches(NI, text)) add('id', m.start, m.end);
  for (const m of matches(IPV4, text)) add('ip', m.start, m.end);
  for (const m of matches(PHONE, text)) {
    const digits = m.text.replace(/\D/g, '');
    const structured = /^(\+|00)|[()]|[ -]/.test(m.text);
    if (digits.length >= 9 && digits.length <= 15 && structured) add('phone', m.start, m.end);
  }
  return found.sort((a, b) => a.start - b.start);
}

const center = (w: OCRWord) => ({ x: (w.bbox.x0 + w.bbox.x1) / 2, y: (w.bbox.y0 + w.bbox.y1) / 2 });

/** Words grouped into the lines OCR found, in reading order. Words outside every line form their own line. */
function wordLines(result: OCRResult): OCRWord[][] {
  const words = result.words.filter((w) => w.text);
  if (!result.lines.length) return words.length ? [[...words].sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0)] : [];
  const buckets = result.lines.map(() => [] as OCRWord[]);
  const loose: OCRWord[] = [];
  for (const w of words) {
    const c = center(w);
    const i = result.lines.findIndex((l) => c.x >= l.bbox.x0 && c.x <= l.bbox.x1 && c.y >= l.bbox.y0 && c.y <= l.bbox.y1);
    (i >= 0 ? buckets[i] : loose).push(w);
  }
  const out = buckets.filter((b) => b.length).map((b) => b.sort((a, c) => a.bbox.x0 - c.bbox.x0));
  if (loose.length) out.push(loose.sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0));
  return out;
}

/** Every sensitive span OCR can see, with the pixel box that covers the words it touches. */
export function detect(result: OCRResult, kinds: ReadonlySet<RedactKind> = new Set(KINDS)): Finding[] {
  const out: Finding[] = [];
  wordLines(result).forEach((line, li) => {
    let text = '';
    const offsets = line.map((w) => {
      if (text) text += ' ';
      const start = text.length;
      text += w.text;
      return { start, end: text.length };
    });
    for (const span of findSpans(text, kinds)) {
      const hit = line.filter((_, i) => offsets[i].start < span.end && offsets[i].end > span.start);
      if (!hit.length) continue;
      const x0 = Math.min(...hit.map((w) => w.bbox.x0));
      const y0 = Math.min(...hit.map((w) => w.bbox.y0));
      const x1 = Math.max(...hit.map((w) => w.bbox.x1));
      const y1 = Math.max(...hit.map((w) => w.bbox.y1));
      out.push({
        id: `f${li}-${span.start}`,
        kind: span.kind,
        text: text.slice(span.start, span.end),
        box: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
      });
    }
  });
  return out;
}
