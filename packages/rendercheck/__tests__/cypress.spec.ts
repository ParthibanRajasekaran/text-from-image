import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { registerRenderCheck, verifyTask, TASK_NAME } from '../src/cypress/plugin';
import { shutdown } from '../src/core';

afterAll(() => shutdown());

describe('cypress plugin (Node side)', () => {
  it('registers the task and an after:run cleanup', () => {
    const on = vi.fn();
    registerRenderCheck(on as never);
    const task = on.mock.calls.find((c) => c[0] === 'task')![1] as Record<string, unknown>;
    expect(Object.keys(task)).toEqual([TASK_NAME]);
    expect(on.mock.calls.some((c) => c[0] === 'after:run')).toBe(true);
  });

  it('verifies a base64 screenshot and returns JSON-safe data', async () => {
    const png = fs.readFileSync(path.join(__dirname, 'fixtures', 'total-eur.png'));
    const out = await verifyTask({ imageBase64: png.toString('base64'), expected: 'Total: $14.00' });
    expect(out.pass).toBe(false);
    expect(out.message).toContain('but OCR read "[Total: €14.00]"');
    expect(() => JSON.stringify(out)).not.toThrow();
    expect(out.ocr).toEqual({ text: expect.any(String), words: 2 });
  }, 60_000);
});

describe('cypress command (browser side)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('registers cy.matchText as an optional-subject command when imported in Cypress', async () => {
    const add = vi.fn();
    (globalThis as Record<string, unknown>).Cypress = { Commands: { add } };
    try {
      await import('../src/cypress/index');
      expect(add.mock.calls.map((c) => c[0])).toEqual(['matchText', 'matchCurrency', 'matchDate']);
      for (const call of add.mock.calls) {
        expect(call[1]).toEqual({ prevSubject: ['optional', 'element'] });
        expect(typeof call[2]).toBe('function');
      }
    } finally {
      delete (globalThis as Record<string, unknown>).Cypress;
    }
  });

  it('does nothing outside Cypress', async () => {
    await expect(import('../src/cypress/index')).resolves.toBeDefined();
  });
});
