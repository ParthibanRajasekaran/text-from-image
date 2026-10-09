/**
 * Zero-bytes network monitor.
 *
 * Wraps a piece of work (an OCR run) and records every network request the page, or the worker
 * it is called from, starts while it is active. It answers one question: did anything leave
 * the browser?
 *
 * What it watches
 *  - fetch, XMLHttpRequest and navigator.sendBeacon, by patching them for the length of the
 *    session (restored by stop()). These give the HTTP method and the size of the request
 *    body, so uploads are measured, not guessed.
 *  - A PerformanceObserver on `resource` and `navigation` entries. This catches requests
 *    nothing above can see: <img>/<script>/<link> loads, iframe navigations, `new Image().src`
 *    pixels. Resource Timing does not expose the method or the request body, so these are
 *    recorded as GET with size 0 (a GET has no body). They still count against
 *    "zero upload" if the destination is another origin, since a URL can carry data.
 *
 * What it cannot see (be honest about this in any UI that shows the result)
 *  - Requests made by *other* workers. Each worker has its own globals; run a session inside
 *    the worker you want covered and merge the audits (mergeAudits). The Tesseract.js worker
 *    that the engine spawns is vendored code and is not instrumented. The Content-Security-Policy
 *    (`connect-src 'self'`, see vercel.json) is what stops it reaching another origin, and
 *    e2e/smoke.spec.ts checks the real traffic from outside the page.
 *
 * Offline mode
 *  With `offline: true`, fetch, XHR and sendBeacon calls are refused (and still recorded) for
 *  the length of the session. Combined with a warmed-up engine (INIT already done), an OCR
 *  run succeeding under it shows the work needs no network. It does not make the browser
 *  offline; that is what the Playwright test does (context.setOffline).
 *
 * "verifiedZeroUpload" is true only when ALL of these hold: every request is a GET or HEAD,
 * none has a body, none went to another origin, no beacon was sent, and no body of unknown
 * size (a stream) was sent.
 */

export interface NetworkRequestRecord {
  url: string;
  method: string;
  /** Size of the request body in bytes (0 for a request without one). */
  size: number;
}

export interface NetworkAudit {
  totalOutboundBytes: number;
  requests: NetworkRequestRecord[];
  verifiedZeroUpload: boolean;
}

export interface NetworkProofOptions {
  /** Refuse fetch / XHR / sendBeacon while the session is active. */
  offline?: boolean;
  /** Global to instrument. Defaults to globalThis (a window, or a worker's self). */
  scope?: ProofScope;
}

export interface NetworkProof {
  /** Current audit. Same object identity until something changes (safe for useSyncExternalStore). */
  getAudit(): NetworkAudit;
  subscribe(listener: () => void): () => void;
  /** Flush, restore the patched APIs, and return the final audit. Safe to call twice. */
  stop(): NetworkAudit;
}

// --- Minimal structural types so a test (or a worker) can supply its own globals. ---------
interface PerfEntry {
  name: string;
  entryType: string;
  initiatorType?: string;
}
interface ObserverLike {
  observe(o: { entryTypes: string[] }): void;
  takeRecords(): PerfEntry[];
  disconnect(): void;
}
type FetchInit = { method?: string; body?: unknown };
export interface ProofScope {
  fetch?: (input: unknown, init?: FetchInit) => Promise<unknown>;
  XMLHttpRequest?: { prototype: { open: (...a: unknown[]) => unknown; send: (...a: unknown[]) => unknown } };
  navigator?: { sendBeacon?: (url: string, data?: unknown) => boolean };
  PerformanceObserver?: new (cb: (list: { getEntries(): PerfEntry[] }) => void) => ObserverLike;
  location?: { href: string; origin: string };
  Request?: new (...a: never[]) => unknown;
  FormData?: new (...a: never[]) => unknown;
  URLSearchParams?: new (...a: never[]) => unknown;
  TextEncoder?: new () => { encode(s: string): { byteLength: number } };
}

interface RawRecord extends NetworkRequestRecord {
  kind: 'fetch' | 'xhr' | 'beacon' | 'resource' | 'navigation';
  /** Body present but its size can't be known (a stream). */
  unknownBody?: boolean;
}

const SAFE_METHODS = new Set(['GET', 'HEAD']);

/** Bytes of a request body, or null when it can't be known. */
export function bodySize(body: unknown, scope: ProofScope = globalThis as ProofScope): number | null {
  if (body === undefined || body === null) return 0;
  if (typeof body === 'string') {
    return scope.TextEncoder ? new scope.TextEncoder().encode(body).byteLength : body.length;
  }
  const b = body as { size?: unknown; byteLength?: unknown; entries?: () => Iterable<[string, unknown]> };
  // URLSearchParams has a `size` too (its entry count), so test it before the generic `size`.
  if (scope.URLSearchParams && body instanceof scope.URLSearchParams) return bodySize(String(body), scope);
  if (typeof b.size === 'number') return b.size; // Blob, File
  if (typeof b.byteLength === 'number') return b.byteLength; // ArrayBuffer, typed arrays, DataView
  if (scope.FormData && body instanceof scope.FormData && b.entries) {
    let total = 0;
    for (const [key, value] of b.entries()) {
      const v = bodySize(value, scope);
      if (v === null) return null;
      total += (bodySize(key, scope) ?? 0) + v;
    }
    return total;
  }
  return null; // ReadableStream, or something we don't know how to measure
}

function absolute(url: unknown, scope: ProofScope): string {
  const raw = typeof url === 'string' ? url : String((url as { url?: string } | null)?.url ?? url);
  try {
    return new URL(raw, scope.location?.href).href;
  } catch {
    return raw;
  }
}

function isCrossOrigin(url: string, scope: ProofScope): boolean {
  try {
    const u = new URL(url);
    if (u.protocol === 'blob:' || u.protocol === 'data:') return false;
    return !!scope.location && u.origin !== scope.location.origin;
  } catch {
    return false;
  }
}

function computeAudit(records: readonly RawRecord[], scope: ProofScope): NetworkAudit {
  const requests = records.map(({ url, method, size }) => ({ url, method, size }));
  return {
    totalOutboundBytes: requests.reduce((sum, r) => sum + r.size, 0),
    requests,
    verifiedZeroUpload: records.every(
      (r) =>
        SAFE_METHODS.has(r.method) &&
        r.size === 0 &&
        !r.unknownBody &&
        r.kind !== 'beacon' &&
        !isCrossOrigin(r.url, scope)
    ),
  };
}

export const emptyAudit = (): NetworkAudit => ({ totalOutboundBytes: 0, requests: [], verifiedZeroUpload: true });

/**
 * Combine audits from several scopes (page + worker). Zero-upload holds only if it held
 * in every one of them.
 */
export function mergeAudits(...audits: Array<NetworkAudit | undefined>): NetworkAudit {
  const present = audits.filter((a): a is NetworkAudit => !!a);
  return {
    totalOutboundBytes: present.reduce((s, a) => s + a.totalOutboundBytes, 0),
    requests: present.flatMap((a) => a.requests),
    verifiedZeroUpload: present.every((a) => a.verifiedZeroUpload),
  };
}

function blocked(what: string): Error {
  const e = new Error(`Network blocked (offline mode): ${what}`);
  e.name = 'NetworkError';
  return e;
}

export function startNetworkProof(options: NetworkProofOptions = {}): NetworkProof {
  const scope: ProofScope = options.scope ?? (globalThis as unknown as ProofScope);
  const offline = options.offline === true;

  const records: RawRecord[] = [];
  const listeners = new Set<() => void>();
  let snapshot = emptyAudit();
  let active = true;

  const publish = () => {
    snapshot = computeAudit(records, scope);
    listeners.forEach((l) => l());
  };
  const add = (r: RawRecord) => {
    if (!active) return;
    records.push(r);
    publish();
  };
  const restore: Array<() => void> = [];

  // --- fetch ------------------------------------------------------------------------------
  const originalFetch = scope.fetch;
  if (typeof originalFetch === 'function') {
    const wrapped = function (this: unknown, input: unknown, init?: FetchInit) {
      const call = () => originalFetch.call(scope, input, init);
      if (!active) return call();
      const isRequest = !!scope.Request && input instanceof scope.Request;
      const req = input as { url: string; method: string; body?: unknown; clone(): { blob(): Promise<{ size: number }> } };
      const method = String(init?.method ?? (isRequest ? req.method : 'GET')).toUpperCase();
      const url = absolute(isRequest ? req.url : input, scope);

      const size = bodySize(init?.body, scope);
      const record: RawRecord = { url, method, size: size ?? 0, kind: 'fetch', unknownBody: size === null };
      add(record);
      if (isRequest && init?.body === undefined && req.body) {
        // The body lives on the Request object: measure a clone of it.
        req
          .clone()
          .blob()
          .then((b) => {
            record.size = b.size;
            publish();
          })
          .catch(() => {
            record.unknownBody = true;
            publish();
          });
      }
      return offline ? Promise.reject(blocked(`fetch ${url}`)) : call();
    };
    scope.fetch = wrapped;
    restore.push(() => {
      if (scope.fetch === wrapped) scope.fetch = originalFetch;
    });
  }

  // --- XMLHttpRequest ---------------------------------------------------------------------
  const xhrProto = scope.XMLHttpRequest?.prototype;
  if (xhrProto) {
    const originalOpen = xhrProto.open;
    const originalSend = xhrProto.send;
    const pending = new WeakMap<object, { method: string; url: string }>();
    const open = function (this: object, method: unknown, url: unknown, ...rest: unknown[]) {
      if (active) pending.set(this, { method: String(method).toUpperCase(), url: absolute(url, scope) });
      return originalOpen.call(this, method, url, ...rest);
    };
    const send = function (this: object, body?: unknown) {
      const info = pending.get(this);
      if (active && info) {
        const size = bodySize(body, scope);
        add({ ...info, size: size ?? 0, kind: 'xhr', unknownBody: size === null });
        if (offline) throw blocked(`XMLHttpRequest ${info.url}`);
      }
      return originalSend.call(this, body);
    };
    xhrProto.open = open;
    xhrProto.send = send;
    restore.push(() => {
      if (xhrProto.open === open) xhrProto.open = originalOpen;
      if (xhrProto.send === send) xhrProto.send = originalSend;
    });
  }

  // --- sendBeacon (not available inside workers) -------------------------------------------
  const nav = scope.navigator;
  const originalBeacon = nav?.sendBeacon;
  if (nav && typeof originalBeacon === 'function') {
    const beacon = function (url: string, data?: unknown) {
      if (!active) return originalBeacon.call(nav, url, data);
      const size = bodySize(data, scope);
      add({ url: absolute(url, scope), method: 'POST', size: size ?? 0, kind: 'beacon', unknownBody: size === null });
      return offline ? false : originalBeacon.call(nav, url, data);
    };
    nav.sendBeacon = beacon;
    restore.push(() => {
      if (nav.sendBeacon === beacon) nav.sendBeacon = originalBeacon;
    });
  }

  // --- PerformanceObserver ----------------------------------------------------------------
  const seen = (entries: PerfEntry[]) => {
    for (const e of entries) {
      // fetch / XHR / beacon are already recorded, with their real method and body size.
      if (e.initiatorType && ['fetch', 'xmlhttprequest', 'beacon'].includes(e.initiatorType)) continue;
      if (/^(blob|data):/.test(e.name)) continue;
      add({
        url: absolute(e.name, scope),
        method: 'GET',
        size: 0,
        kind: e.entryType === 'navigation' ? 'navigation' : 'resource',
      });
    }
  };
  let observer: ObserverLike | null = null;
  if (scope.PerformanceObserver) {
    try {
      observer = new scope.PerformanceObserver((list) => seen(list.getEntries()));
      observer.observe({ entryTypes: ['resource', 'navigation'] });
    } catch {
      observer = null; // entry types not supported here: the patches still work
    }
  }

  let stopped = false;
  return {
    getAudit: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    stop() {
      if (!stopped) {
        stopped = true;
        if (observer) {
          seen(observer.takeRecords());
          observer.disconnect();
        }
        active = false;
        restore.reverse().forEach((fn) => fn());
        publish();
      }
      return snapshot;
    },
  };
}
