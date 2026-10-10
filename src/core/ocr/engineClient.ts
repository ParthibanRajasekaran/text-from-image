/**
 * Promise-based client for the persistent OCR worker (engine.worker.ts).
 *
 *   const engine = new OCREngineClient();
 *   await engine.init();                         // loads the engine once
 *   const { result, network } = await engine.recognize(file, { offline: true });
 *   engine.terminate();
 */

import type { NetworkAudit } from '../privacy/networkProof';
import type { EngineRequest, EngineResponse, OCRImageInput, OCRResult } from './types';

export interface WorkerLike {
  postMessage(message: EngineRequest): void;
  addEventListener(type: 'message', listener: (e: MessageEvent<EngineResponse>) => void): void;
  addEventListener(type: 'error', listener: (e: ErrorEvent) => void): void;
  terminate(): void;
}

export interface RecognizeOptions {
  /** Refuse network calls inside the worker for this run. The engine must already be INIT-ed. */
  offline?: boolean;
  onProgress?: (status: string, progress: number) => void;
}

export interface RecognizeOutcome {
  result: OCRResult;
  network: NetworkAudit;
}

type Pending = {
  resolve: (r: EngineResponse) => void;
  reject: (e: Error) => void;
  onProgress?: RecognizeOptions['onProgress'];
};

export const createDefaultWorker = (): WorkerLike =>
  new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike;

export class OCREngineClient {
  private worker: WorkerLike | null = null;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private ready = false;

  constructor(private readonly makeWorker: () => WorkerLike = createDefaultWorker) {}

  /** True once INIT has completed, so a RECOGNIZE needs no network. */
  get isReady(): boolean {
    return this.ready;
  }

  private ensureWorker(): WorkerLike {
    if (this.worker) return this.worker;
    const w = this.makeWorker();
    w.addEventListener('message', (e) => {
      const msg = e.data;
      const p = this.pending.get(msg.id);
      if (!p) return;
      if (msg.action === 'PROGRESS') {
        p.onProgress?.(msg.status, msg.progress);
        return;
      }
      this.pending.delete(msg.id);
      if ('error' in msg) p.reject(new Error(msg.error));
      else p.resolve(msg);
    });
    w.addEventListener('error', (e) => {
      const err = new Error(e.message || 'OCR worker crashed');
      this.pending.forEach((p) => p.reject(err));
      this.pending.clear();
      this.ready = false;
      this.worker = null;
    });
    this.worker = w;
    return w;
  }

  private send<T extends EngineResponse>(
    build: (id: number) => EngineRequest,
    onProgress?: Pending['onProgress']
  ): Promise<T> {
    const worker = this.ensureWorker();
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as Pending['resolve'], reject, onProgress });
      worker.postMessage(build(id));
    });
  }

  async init(lang = 'eng', onProgress?: RecognizeOptions['onProgress']): Promise<void> {
    await this.send((id) => ({ id, action: 'INIT', lang }), onProgress);
    this.ready = true;
  }

  async recognize(image: OCRImageInput, options: RecognizeOptions = {}): Promise<RecognizeOutcome> {
    const res = await this.send<Extract<EngineResponse, { action: 'RECOGNIZE'; ok: true }>>(
      (id) => ({ id, action: 'RECOGNIZE', image, offline: options.offline }),
      options.onProgress
    );
    this.ready = true;
    return { result: res.result, network: res.network };
  }

  /** Free the engine and stop the worker. The client can be used again afterwards. */
  async terminate(): Promise<void> {
    const w = this.worker;
    if (!w) return;
    try {
      await this.send((id) => ({ id, action: 'TERMINATE' }));
    } catch {
      /* the worker is going away regardless */
    }
    w.terminate();
    this.worker = null;
    this.ready = false;
    this.pending.clear();
  }
}
