/**
 * Local usage log. Written to the user's own machine only, never sent anywhere, so RenderCheck
 * stays offline. `rendercheck stats` reads it back. Disable with RENDERCHECK_NO_USAGE_LOG=1.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type Surface = 'cli' | 'mcp';
export interface UsageEvent {
  t: string;
  surface: Surface;
  tool: string;
  pass?: boolean;
  failure?: string;
  ms: number;
}

export const usageFile = () => process.env.RENDERCHECK_USAGE_FILE || path.join(os.homedir(), '.rendercheck', 'usage.jsonl');

export function logUsage(e: Omit<UsageEvent, 't'>): void {
  if (process.env.RENDERCHECK_NO_USAGE_LOG === '1') return;
  try {
    const f = usageFile();
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.appendFileSync(f, JSON.stringify({ t: new Date().toISOString(), ...e }) + '\n');
  } catch {
    /* never let logging break an assertion */
  }
}

export function readUsage(): UsageEvent[] {
  try {
    return fs
      .readFileSync(usageFile(), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l) as UsageEvent);
  } catch {
    return [];
  }
}

export function summarize(events: UsageEvent[]) {
  const by = (k: (e: UsageEvent) => string) =>
    events.reduce<Record<string, number>>((acc, e) => ((acc[k(e)] = (acc[k(e)] ?? 0) + 1), acc), {});
  return {
    total: events.length,
    bySurface: by((e) => e.surface),
    byTool: by((e) => e.tool),
    failures: by((e) => e.failure ?? 'none'),
    passed: events.filter((e) => e.pass === true).length,
    failed: events.filter((e) => e.pass === false).length,
    first: events[0]?.t,
    last: events[events.length - 1]?.t,
  };
}
