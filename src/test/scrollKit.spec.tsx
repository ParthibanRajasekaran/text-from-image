import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyButton } from '../../components/home/ScrollKit';

describe('CopyButton', () => {
  it('writes to the clipboard and confirms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton text="npm i -D x" />);
    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy());
    expect(writeText).toHaveBeenCalledWith('npm i -D x');
  });

  it('stays quiet when the clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    render(<CopyButton text="x" />);
    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByRole('button', { name: /copy code/i })).toBeTruthy();
  });
});
