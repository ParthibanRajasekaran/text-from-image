import React from 'react';
import { axisValues, type Answers } from '../src/core/debt/model';

export interface RadarGeometry {
  size: number;
  cx: number;
  cy: number;
  radius: number;
}

/** Point on axis `i` of `n`, at `fraction` (0 to 1) of the radius. Axis 0 points straight up. */
export function radarPoint(g: RadarGeometry, i: number, n: number, fraction: number): [number, number] {
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
  return [g.cx + Math.cos(angle) * g.radius * fraction, g.cy + Math.sin(angle) * g.radius * fraction];
}

/** Polygon points for the answered axes; unanswered axes sit at the centre. */
export function radarPolygon(answers: Answers, g: RadarGeometry): string {
  const values = axisValues(answers);
  return values
    .map((v, i) => radarPoint(g, i, values.length, v.value ?? 0).map((n) => n.toFixed(1)).join(','))
    .join(' ');
}

interface DebtRadarProps {
  answers: Answers;
  className?: string;
}

const SIZE = 360;
const GEO: RadarGeometry = { size: SIZE, cx: SIZE / 2, cy: SIZE / 2, radius: 112 };

/**
 * The verification debt radar. One axis per question; the further a point sits from the centre, the more
 * debt that answer carries. It grows as the person answers, so the shape is the live result.
 */
export function DebtRadar({ answers, className }: DebtRadarProps) {
  const values = axisValues(answers);
  const n = values.length;
  const answered = values.filter((v) => v.value !== null).length;
  const summary = values
    .map((v) => `${v.label} ${v.value === null ? 'not answered' : `${Math.round(v.value * 100)}%`}`)
    .join(', ');

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Verification debt radar, ${answered} of ${n} answered. ${summary}.`}
        className="w-full h-auto text-muted-foreground"
        data-testid="debt-radar"
      >
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon
            key={r}
            points={values.map((_, i) => radarPoint(GEO, i, n, r).join(',')).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.3}
          />
        ))}
        {values.map((v, i) => {
          const [x, y] = radarPoint(GEO, i, n, 1);
          const [lx, ly] = radarPoint(GEO, i, n, 1.2);
          const anchor = lx < GEO.cx - 4 ? 'end' : lx > GEO.cx + 4 ? 'start' : 'middle';
          return (
            <g key={v.id}>
              <line x1={GEO.cx} y1={GEO.cy} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.3} />
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={11}
                fill="currentColor"
                opacity={v.value === null ? 0.7 : 1}
              >
                {v.label}
              </text>
            </g>
          );
        })}
        <polygon
          points={radarPolygon(answers, GEO)}
          className="text-accent"
          fill="currentColor"
          fillOpacity={0.25}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
          data-testid="debt-radar-shape"
        />
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
