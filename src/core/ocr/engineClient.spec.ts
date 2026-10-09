import { describe, expect, it } from 'vitest';
import { OCREngineClient, type WorkerLike } from './engineClient';
import type { EngineRequest, EngineResponse } from './types';

function fakeWorker(reply: (req: EngineRequest, emit: (r: EngineResponse) => void) => void) {
  let onMessage: (e: MessageEvent<EngineResponse>) => void = () => undefined;
  let onError: (e: ErrorEvent) => void = () => undefined;
  const sent: EngineRequest[] = [];
  let terminated = false;
  const w: WorkerLike = {
    postMessage(req) {
      sent.push(req);
      queueMicrotask(() => reply(req, (r) => onMessage({ data: r } as MessageEvent<EngineResponse>)));
    },
    addEventListener(type: 'message' | 'error', l: never) {
      if (type === 'message') onMessage = l;
      else onError = l;
    },
    terminate() {
      terminated = true;
    },
  };
  return { w, sent, fail: (m: string) => onError({ message: m } as ErrorEvent), isTerminated: () => terminated };
}

const result = { text: 'x', words: [], lines: [], metrics: { durationMs: 1 } };
const network = { totalOutboundBytes: 0, requests: [], verifiedZeroUpload: true };

describe('OCREngineClient', () => {
  it('init, recognize (with progress and offline flag) and terminate', async () => {
    const f = fakeWorker((req, emit) => {
      if (req.action === 'RECOGNIZE') {
        emit({ id: req.id, action: 'PROGRESS', ok: true, status: 'recognizing text', progress: 0.4 });
        emit({ id: req.id, action: 'RECOGNIZE', ok: true, result, network });
      } else emit({ id: req.id, action: req.action, ok: true });
    });
    const client = new OCREngineClient(() => f.w);
    expect(client.isReady).toBe(false);
    await client.init();
    expect(client.isReady).toBe(true);
    const progress: number[] = [];
    const out = await client.recognize(new Uint8Array(1), { offline: true, onProgress: (_s, p) => progress.push(p) });
    expect(out).toEqual({ result, network });
    expect(progress).toEqual([0.4]);
    expect(f.sent.map((r) => r.action)).toEqual(['INIT', 'RECOGNIZE']);
    expect(f.sent[1]).toMatchObject({ offline: true });
    await client.terminate();
    expect(f.isTerminated()).toBe(true);
    expect(client.isReady).toBe(false);
  });

  it('rejects with the worker error message', async () => {
    const f = fakeWorker((req, emit) => emit({ id: req.id, action: req.action, ok: false, error: 'boom' }));
    const client = new OCREngineClient(() => f.w);
    await expect(client.recognize(new Uint8Array(1))).rejects.toThrow('boom');
  });

  it('rejects pending calls if the worker crashes, and starts a new worker afterwards', async () => {
    let n = 0;
    const workers: ReturnType<typeof fakeWorker>[] = [];
    const client = new OCREngineClient(() => {
      const f = fakeWorker((req, emit) => {
        if (n++ === 0) return; // first worker never answers
        emit({ id: req.id, action: 'INIT', ok: true });
      });
      workers.push(f);
      return f.w;
    });
    const p = client.init();
    await Promise.resolve();
    workers[0].fail('out of memory');
    await expect(p).rejects.toThrow('out of memory');
    await client.init();
    expect(workers).toHaveLength(2);
  });
});
