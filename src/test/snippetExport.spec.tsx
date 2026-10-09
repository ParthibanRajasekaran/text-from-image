import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SnippetExport, buildPlaywrightSnippet, quoteTs } from '../../components/SnippetExport';

describe('buildPlaywrightSnippet', () => {
  it('produces the documented assertion', () => {
    expect(
      buildPlaywrightSnippet({
        expectedText: 'Total: $14.00',
        region: { x: 120, y: 340, width: 200, height: 40 },
      })
    ).toBe(
      [
        "await expect(page).toShowText('Total: $14.00', {",
        '  region: { x: 120, y: 340, width: 200, height: 40 },',
        '  minConfidence: 85,',
        '  minContrastRatio: 4.5,',
        '});',
      ].join('\n')
    );
  });

  it('rounds coordinates and honours thresholds', () => {
    const s = buildPlaywrightSnippet({
      expectedText: 'x',
      region: { x: 1.4, y: 2.6, width: 10.5, height: 3.2 },
      minConfidence: 90,
      minContrastRatio: 3,
    });
    expect(s).toContain('region: { x: 1, y: 3, width: 11, height: 3 }');
    expect(s).toContain('minConfidence: 90');
    expect(s).toContain('minContrastRatio: 3');
  });

  it('escapes quotes, backslashes and newlines so the snippet stays valid TypeScript', () => {
    expect(quoteTs("It's a \\ test\nline")).toBe("'It\\'s a \\\\ test\\nline'");
    const code = buildPlaywrightSnippet({ expectedText: "Don't", region: { x: 0, y: 0, width: 1, height: 1 } });
    // Evaluates back to the original string.
    const literal = /toShowText\((.*?), \{/.exec(code)![1];
    expect(new Function(`return ${literal}`)()).toBe("Don't");
  });
});

describe('<SnippetExport />', () => {
  it('renders the snippet with a copy button', () => {
    render(<SnippetExport expectedText="Pay now" region={{ x: 1, y: 2, width: 3, height: 4 }} />);
    expect(screen.getByTestId('snippet-export').textContent).toContain("toShowText('Pay now'");
    expect(screen.getByRole('button', { name: /copy code/i })).toBeTruthy();
  });
});
