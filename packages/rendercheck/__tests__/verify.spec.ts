import { describe, it, expect, vi, afterEach } from 'vitest';
import { verify } from '../src/verify';

global.fetch = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
});

describe('verify()', () => {
  it('throws if expectedText is empty', async () => {
    const mockBuffer = Buffer.from('test');
    await expect(
      verify({
        imageBuffer: mockBuffer,
        expectedText: '',
        apiKey: 'ftfi_live_test.signature',
      })
    ).rejects.toThrow('expectedText is required and cannot be empty');
  });

  it('throws if neither imagePath nor imageBuffer is provided', async () => {
    await expect(
      verify({
        expectedText: 'hello',
        apiKey: 'ftfi_live_test.signature',
      })
    ).rejects.toThrow('Either imagePath or imageBuffer is required');
  });

  it('throws if apiKey is not provided', async () => {
    const mockBuffer = Buffer.from('test');
    await expect(
      verify({
        imageBuffer: mockBuffer,
        expectedText: 'hello',
      })
    ).rejects.toThrow('Local OCR mode is not yet supported');
  });

  it('returns pass when all expected words are found', async () => {
    const mockBuffer = Buffer.from('test');
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        text: 'Payment confirmed',
      }),
    });

    const result = await verify({
      imageBuffer: mockBuffer,
      expectedText: 'Payment confirmed',
      apiKey: 'ftfi_live_test.signature',
    });

    expect(result.outcome).toBe('pass');
    expect(result.foundWords).toContain('payment');
    expect(result.foundWords).toContain('confirmed');
    expect(result.missingWords).toHaveLength(0);
    expect(result.confidence).toBe(1);
    expect(result.message).toContain('All');
  });

  it('returns fail when no expected words are found', async () => {
    const mockBuffer = Buffer.from('test');
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        text: 'Error occurred',
      }),
    });

    const result = await verify({
      imageBuffer: mockBuffer,
      expectedText: 'Payment confirmed',
      apiKey: 'ftfi_live_test.signature',
    });

    expect(result.outcome).toBe('fail');
    expect(result.foundWords).toHaveLength(0);
    expect(result.missingWords).toHaveLength(2);
    expect(result.confidence).toBe(0);
  });

  it('returns partial when some expected words are found', async () => {
    const mockBuffer = Buffer.from('test');
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        text: 'Payment processed successfully',
      }),
    });

    const result = await verify({
      imageBuffer: mockBuffer,
      expectedText: 'Payment confirmed',
      apiKey: 'ftfi_live_test.signature',
    });

    expect(result.outcome).toBe('partial');
    expect(result.foundWords).toContain('payment');
    expect(result.missingWords).toContain('confirmed');
    expect(result.confidence).toBe(0.5);
  });

  it('handles case-insensitive matching', async () => {
    const mockBuffer = Buffer.from('test');
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        text: 'PAYMENT CONFIRMED',
      }),
    });

    const result = await verify({
      imageBuffer: mockBuffer,
      expectedText: 'payment confirmed',
      apiKey: 'ftfi_live_test.signature',
    });

    expect(result.outcome).toBe('pass');
  });

  it('throws on OCR API error', async () => {
    const mockBuffer = Buffer.from('test');
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Invalid API key' }),
    });

    await expect(
      verify({
        imageBuffer: mockBuffer,
        expectedText: 'payment',
        apiKey: 'invalid_key',
      })
    ).rejects.toThrow('OCR API error');
  });
});
