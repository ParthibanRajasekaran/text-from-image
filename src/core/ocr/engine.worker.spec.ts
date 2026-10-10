import { describe, expect, it, vi } from 'vitest';
import {
  createEngineController,
  toOCRResult,
  type Recognizer,
  type RecognizerFactory,
} from './engine.worker';
import type { EngineResponse } from './types';

const box = (text: string, x0: number, confidence = 90) => ({
  text,
  confidence,
  bbox: { x0, y0: 10, x1: x0 + 40, y1: 30 },
});

function fakeData() {
  return {
    text: 'Total: $14.00\n',
    words: [box('Total:', 0), box('$14.00', 50, 96), box(' ', 100)],
    lines: [box('Total: $14.00', 0)],
  };
}

function setup(factory?: RecognizerFactory) {
  const out: EngineResponse[] = [];
  const recognize = vi.fn(async () => ({ data: fakeData() }));
  const terminate = vi.fn(async () => undefined);
  const recognizer: Recognizer = { recognize, terminate };
  const make = vi.fn<RecognizerFactory>(factory ?? (async () => recognizer));
  let t = 1000;
  const c = createEngineController((r) => out.push(r), make, () => (t += 120));
  return { c, out, make, recognize, terminate };
}

const image = new Uint8Array([1, 2, 3]);

describe('toOCRResult', () => {
  it('copies words and lines into plain data and drops blank words', () => {
    const r = toOCRResult(fakeData(), 42);
    expect(r.words.map((w) => w.text)).toEqual(['Total:', '$14.00']);
    expect(r.words[1]).toEqual({
      text: '$14.00',
      confidence: 96,
      bbox: { x0: 50, y0: 10, x1: 90, y1: 30 },
    });
    expect(r.lines).toHaveLength(1);
    expect(r.metrics).toEqual({ durationMs: 42 });
  });

  it('falls back to blocks when words/lines are missing', () => {
    const line = { ...box('Hi there', 0), words: [box('Hi', 0), box('there', 50)] };
    const r = toOCRResult({ text: 'Hi there', blocks: [{ paragraphs: [{ lines: [line] }] }] }, 1);
    expect(r.words.map((w) => w.text)).toEqual(['Hi', 'there']);
    expect(r.lines.map((l) => l.text)).toEqual(['Hi there']);
  });

  it('includes memoryBytes only when known', () => {
    expect(toOCRResult(fakeData(), 1, 1234).metrics).toEqual({ durationMs: 1, memoryBytes: 1234 });
  });
});

describe('createEngineController', () => {
  it('INIT loads the engine once and replies ok', async () => {
    const { c, out, make } = setup();
    await c.handle({ id: 1, action: 'INIT' });
    await c.handle({ id: 2, action: 'INIT' });
    expect(make).toHaveBeenCalledTimes(1);
    expect(make.mock.calls[0][0]).toBe('eng');
    expect(out).toEqual([
      { id: 1, action: 'INIT', ok: true },
      { id: 2, action: 'INIT', ok: true },
    ]);
  });

  it('RECOGNIZE returns an OCRResult with timing, and keeps the engine for the next image', async () => {
    const { c, out, make, recognize } = setup();
    await c.handle({ id: 1, action: 'INIT' });
    await c.handle({ id: 2, action: 'RECOGNIZE', image });
    await c.handle({ id: 3, action: 'RECOGNIZE', image });
    expect(make).toHaveBeenCalledTimes(1);
    expect(recognize).toHaveBeenCalledTimes(2);
    const res = out.find((r) => r.id === 2);
    expect(res).toMatchObject({ action: 'RECOGNIZE', ok: true });
    if (res?.action !== 'RECOGNIZE' || !res.ok) throw new Error('unexpected');
    expect(res.result.text).toContain('14.00');
    expect(res.result.metrics.durationMs).toBe(120);
    expect(res.result.words).toHaveLength(2);
  });

  it('RECOGNIZE reports what the worker requested, and restores fetch afterwards', async () => {
    const before = globalThis.fetch;
    const { c, out } = setup(async () => ({
      recognize: async () => {
        await globalThis.fetch('data:text/plain,hi').catch(() => undefined);
        return { data: fakeData() };
      },
      terminate: async () => undefined,
    }));
    await c.handle({ id: 1, action: 'RECOGNIZE', image });
    const res = out[0];
    if (res.action !== 'RECOGNIZE' || !res.ok) throw new Error('unexpected');
    expect(res.network.requests.map((r) => r.method)).toContain('GET');
    expect(globalThis.fetch).toBe(before);
  });

  it('offline: true makes the worker refuse network calls during the run', async () => {
    let error = '';
    const { c, out } = setup(async () => ({
      recognize: async () => {
        await globalThis.fetch('https://example.test/x').catch((e: Error) => (error = e.message));
        return { data: fakeData() };
      },
      terminate: async () => undefined,
    }));
    await c.handle({ id: 1, action: 'RECOGNIZE', image, offline: true });
    expect(error).toMatch(/offline mode/);
    expect(out[0]).toMatchObject({ ok: true });
  });

  it('RECOGNIZE initialises by itself if INIT was skipped', async () => {
    const { c, out, make } = setup();
    await c.handle({ id: 1, action: 'RECOGNIZE', image });
    expect(make).toHaveBeenCalledTimes(1);
    expect(out[0]).toMatchObject({ id: 1, action: 'RECOGNIZE', ok: true });
  });

  it('TERMINATE frees the engine, and a later RECOGNIZE starts a new one', async () => {
    const { c, out, make, terminate } = setup();
    await c.handle({ id: 1, action: 'INIT' });
    await c.handle({ id: 2, action: 'TERMINATE' });
    expect(terminate).toHaveBeenCalledTimes(1);
    expect(out[1]).toEqual({ id: 2, action: 'TERMINATE', ok: true });
    await c.handle({ id: 3, action: 'RECOGNIZE', image });
    expect(make).toHaveBeenCalledTimes(2);
  });

  it('TERMINATE with nothing running is fine', async () => {
    const { c, out } = setup();
    await c.handle({ id: 1, action: 'TERMINATE' });
    expect(out).toEqual([{ id: 1, action: 'TERMINATE', ok: true }]);
  });

  it('reports errors with the request id instead of throwing, and recovers', async () => {
    let n = 0;
    const good: Recognizer = {
      recognize: async () => ({ data: fakeData() }),
      terminate: async () => undefined,
    };
    const { c, out } = setup(async () => {
      if (n++ === 0) throw new Error('wasm failed to load');
      return good;
    });
    await c.handle({ id: 1, action: 'INIT' });
    expect(out[0]).toEqual({ id: 1, action: 'INIT', ok: false, error: 'wasm failed to load' });
    await c.handle({ id: 2, action: 'RECOGNIZE', image });
    expect(out[1]).toMatchObject({ id: 2, ok: true });
  });

  it('answers an unknown action with an error', async () => {
    const { c, out } = setup();
    await c.handle({ id: 9, action: 'NOPE' } as never);
    expect(out[0]).toMatchObject({ id: 9, ok: false });
  });

  it('forwards progress from the engine with the id of the running request', async () => {
    const { c, out } = setup(async (_lang, onProgress) => ({
      recognize: async () => {
        onProgress('recognizing text', 0.5);
        return { data: fakeData() };
      },
      terminate: async () => undefined,
    }));
    await c.handle({ id: 7, action: 'RECOGNIZE', image });
    expect(out[0]).toEqual({ id: 7, action: 'PROGRESS', ok: true, status: 'recognizing text', progress: 0.5 });
    expect(out[1]).toMatchObject({ id: 7, action: 'RECOGNIZE', ok: true });
  });

  it('handles requests one at a time, in order', async () => {
    const order: string[] = [];
    const { c } = setup(async () => ({
      recognize: async () => {
        order.push('start');
        await new Promise((r) => setTimeout(r, 10));
        order.push('end');
        return { data: fakeData() };
      },
      terminate: async () => undefined,
    }));
    await Promise.all([
      c.handle({ id: 1, action: 'RECOGNIZE', image }),
      c.handle({ id: 2, action: 'RECOGNIZE', image }),
    ]);
    expect(order).toEqual(['start', 'end', 'start', 'end']);
  });
});
