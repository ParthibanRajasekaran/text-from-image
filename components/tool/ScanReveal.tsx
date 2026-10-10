import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { OCRLine, OCRWord } from '../../src/core/ocr/types';

const LOW_CONFIDENCE = 60;
const BOX = '#38BDF8';
const WARN = '#F59E0B';

interface ScanRevealProps {
  imageUrl: string;
  width: number;
  height: number;
  words: OCRWord[];
  lines: OCRLine[];
  /** Index into `lines` shared by the image and the text list, so hovering one lights up the other. */
  activeLine: number | null;
  onActiveLine: (index: number | null) => void;
}

const inside = (w: OCRWord, l: OCRLine) => {
  const cx = (w.bbox.x0 + w.bbox.x1) / 2;
  const cy = (w.bbox.y0 + w.bbox.y1) / 2;
  return cx >= l.bbox.x0 && cx <= l.bbox.x1 && cy >= l.bbox.y0 && cy <= l.bbox.y1;
};

/**
 * The result of a read: the image with every detected word outlined, revealed top to bottom by a scan
 * line, and the recognised lines listed beside it. Hover or focus a line to outline it on the image
 * (and hover a box to select its line). With reduced motion the boxes appear at once.
 */
export function ScanReveal({ imageUrl, width, height, words, lines, activeLine, onActiveLine }: ScanRevealProps) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(!!reduce);

  useEffect(() => {
    if (reduce) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    // Two frames so the hidden state is painted before the transition starts.
    let a = 0;
    let b = 0;
    a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setRevealed(true));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [imageUrl, reduce]);

  const transition = reduce ? 'none' : '1.1s cubic-bezier(0.22, 1, 0.36, 1)';
  const active = activeLine !== null ? lines[activeLine] : null;
  const lineOf = (w: OCRWord) => lines.findIndex((l) => inside(w, l));

  return (
    <div data-testid="scan-reveal" className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-black"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <img src={imageUrl} alt="Your image, with detected text outlined" className="block h-full w-full select-none" draggable={false} />
        <div
          className="absolute inset-0"
          style={{ clipPath: revealed ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)', transition: `clip-path ${transition}` }}
        >
          <svg
            data-testid="scan-overlay"
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`${words.length} detected words outlined`}
          >
            {words.map((w, i) => {
              const low = w.confidence < LOW_CONFIDENCE;
              const color = low ? WARN : BOX;
              return (
                <rect
                  key={i}
                  data-testid="scan-box"
                  data-low-confidence={low || undefined}
                  x={w.bbox.x0}
                  y={w.bbox.y0}
                  width={Math.max(1, w.bbox.x1 - w.bbox.x0)}
                  height={Math.max(1, w.bbox.y1 - w.bbox.y0)}
                  rx={2}
                  fill={color}
                  fillOpacity={0.14}
                  stroke={color}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => onActiveLine(lineOf(w) >= 0 ? lineOf(w) : null)}
                  onMouseLeave={() => onActiveLine(null)}
                >
                  <title>{`${w.text} (confidence ${Math.round(w.confidence)}%)`}</title>
                </rect>
              );
            })}
            {active && (
              <rect
                data-testid="scan-selection"
                x={active.bbox.x0 - 4}
                y={active.bbox.y0 - 4}
                width={active.bbox.x1 - active.bbox.x0 + 8}
                height={active.bbox.y1 - active.bbox.y0 + 8}
                rx={4}
                fill="none"
                stroke="#ffffff"
                strokeWidth={2}
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            )}
          </svg>
        </div>
        <div
          data-testid="scan-line"
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 h-0.5"
          style={{
            top: revealed ? '100%' : '0%',
            opacity: revealed ? 0 : 1,
            transition: `top ${transition}, opacity ${transition}`,
            background: `linear-gradient(90deg, transparent, ${BOX} 20%, ${BOX} 80%, transparent)`,
            boxShadow: '0 0 18px 4px rgba(56,189,248,.55)',
          }}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lines read</h3>
        <ol data-testid="scan-lines" className="max-h-96 space-y-1 overflow-auto rounded-xl border border-border bg-surface/40 p-2">
          {lines.map((l, i) => (
            <li key={i}>
              <button
                type="button"
                data-active={activeLine === i || undefined}
                onMouseEnter={() => onActiveLine(i)}
                onMouseLeave={() => onActiveLine(null)}
                onFocus={() => onActiveLine(i)}
                onBlur={() => onActiveLine(null)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[active]:bg-primary/10"
              >
                {l.text.trim() || '(blank)'}
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">
          Amber outlines are words the engine was less than {LOW_CONFIDENCE}% sure about. Check them before relying on the text.
        </p>
      </div>
    </div>
  );
}
