/**
 * The weekly "spot the bug" challenges. Each one is a screenshot with known, documented bugs, so a
 * guess can be graded for real. The answers ship with the page: grading runs in the visitor's browser,
 * which keeps the site's "nothing leaves your device" promise, and makes this practice, not a contest.
 */

export type BugKind =
  | 'date-order'
  | 'currency-symbol'
  | 'currency-mix'
  | 'math'
  | 'truncation'
  | 'missing-text'
  | 'contrast';

export const BUG_LABEL: Record<BugKind, string> = {
  'date-order': 'Date written in the wrong order for the locale',
  'currency-symbol': 'Wrong currency symbol for the region',
  'currency-mix': 'Two currencies on one document',
  math: 'The numbers do not add up',
  truncation: 'Text is cut off',
  'missing-text': 'Text is missing',
  contrast: 'Text is hard to read (low contrast)',
};

export const BUG_KINDS = Object.keys(BUG_LABEL) as BugKind[];

export interface Bug {
  kind: BugKind;
  /** What is on screen. */
  shows: string;
  /** Why it is a bug. */
  why: string;
  /** Text that would fix it. Any one of these counts. Absent when the fix is not something to type. */
  fix?: string[];
  /** The RenderCheck assertion that would catch it. */
  catch: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  teaches: string;
  imageUrl: string;
  /** What a screen reader hears: a plain transcription of the image, with no hint of what is wrong. */
  imageAlt: string;
  /** The brief the player sees. */
  brief: string;
  hint?: string;
  bugs: Bug[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'us-invoice-eur',
    title: 'The invoice for a US customer',
    difficulty: 'easy',
    teaches: 'Currency symbol against the customer’s region',
    imageUrl: '/challenges/eur-invoice.png',
    imageAlt: 'Invoice number 1042. Region: United States. Subtotal €1,234.56. Total €1,234.56.',
    brief: 'This invoice was generated for a customer in the United States. Find what is wrong, then rewrite it as it should read.',
    bugs: [
      {
        kind: 'currency-symbol',
        shows: '€1,234.56',
        why: 'The region is the United States, so amounts should be in dollars. The format (comma for thousands) is already the US one, which hints the symbol was picked from the wrong setting.',
        fix: ['$1,234.56'],
        catch: "await expect(page).toShowCurrency(1234.56, { currency: 'USD', locale: 'en-US' });",
      },
    ],
  },
  {
    id: 'swiss-receipt-de',
    title: 'A Swiss receipt in German',
    difficulty: 'hard',
    teaches: 'Locale date order, one currency per document, and sums',
    imageUrl: '/challenges/swiss-receipt.png',
    imageAlt:
      'Migros Zürich receipt. Datum: 06/15/2026 19:45. Zwischensumme CHF 83.19. MwSt 7.7% EUR 6.81. Gesamtbetrag CHF 89.50.',
    brief: 'A receipt from a Swiss store, shown in German (de-CH). There is more than one problem. Find them all, then rewrite the wrong parts as they should read.',
    hint: 'Read the receipt as a Swiss customer would, then add it up with a calculator.',
    bugs: [
      {
        kind: 'date-order',
        shows: 'Datum: 06/15/2026 19:45',
        why: 'de-CH writes the day first, with dots: 15.06.2026. The page shows the US order, month first. 15 cannot be a month, so it is clearly wrong.',
        fix: ['15.06.2026'],
        catch: "await expect(page).toShowDate('2026-06-15', { locale: 'de-CH' });",
      },
      {
        kind: 'currency-mix',
        shows: 'MwSt 7.7% EUR 6.81',
        why: 'The rest of the receipt is in Swiss francs. A VAT line in euros means two currencies on one receipt.',
        fix: ['CHF 6.81', 'CHF 6.31'],
        catch: "await expect(page).toShowCurrency(6.81, { currency: 'CHF', locale: 'de-CH' });",
      },
      {
        kind: 'math',
        shows: 'CHF 83.19 + 6.81 ≠ CHF 89.50',
        why: '83.19 + 6.81 is 90.00, but the total says 89.50. One of the three numbers is wrong. A test that only checks each string exists would pass.',
        fix: ['CHF 90.00', 'CHF 6.31'],
        catch: "await expect(page.locator('#total')).toShowText('CHF 90.00');",
      },
    ],
  },
  {
    id: 'rtl-truncation',
    title: 'The Arabic welcome card',
    difficulty: 'hard',
    teaches: 'Right-to-left text and clipped boxes',
    imageUrl: '/challenges/rtl-truncation.png',
    imageAlt: 'A card with a heading in Arabic, and below it a dashed box containing an Arabic sentence that ends in the middle of a word.',
    brief: 'A shop card in Arabic. The product team says it "looks fine". Decide what, if anything, is wrong.',
    hint: 'The sentence is “Welcome to the store”. Read it from the right and check that the last word is complete.',
    bugs: [
      {
        kind: 'truncation',
        shows: 'مرحبا بك في المت',
        why: 'The box is sized for left-to-right text and clips the end of the sentence, so the last word is cut off. The DOM still holds the full phrase, so a DOM-only test passes.',
        catch: "await expect(page).toShowText('مرحبا بك في المتجر', { langPath: 'tessdata' }); // needs the ara language file",
      },
    ],
  },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** A Monday. Weeks are counted from here, in UTC, so everyone sees the same challenge. */
const EPOCH = Date.UTC(2026, 0, 5);

export function weekIndex(date: Date): number {
  return Math.floor((date.getTime() - EPOCH) / WEEK_MS);
}

export function challengeForDate(date: Date, list: Challenge[] = CHALLENGES): Challenge {
  const n = list.length;
  return list[((weekIndex(date) % n) + n) % n];
}

/** The Monday (UTC) that starts the week containing `date`. */
export function weekStart(date: Date): Date {
  return new Date(EPOCH + weekIndex(date) * WEEK_MS);
}
