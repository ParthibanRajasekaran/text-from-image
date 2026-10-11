/**
 * RenderCheck MCP server (stdio). Gives an AI agent the one thing it cannot do itself:
 * check what a user would actually see on screen, from a screenshot, locally and offline.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadImage, runRead, runVerify } from '../cli/run';
import { logUsage } from '../cli/usage';

const image = {
  image_path: z.string().optional().describe('Path to a PNG or JPEG screenshot on this machine'),
  image_base64: z.string().optional().describe('Base64 PNG or JPEG, if there is no file path'),
};
const region = z
  .object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() })
  .optional()
  .describe('Only read this part of the screenshot (pixels from the top-left corner)');

const text = (value: unknown, isError = false) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  ...(isError ? { isError: true } : {}),
});

export function createServer(version: string): McpServer {
  const server = new McpServer({ name: 'rendercheck', version });

  server.registerTool(
    'verify_text',
    {
      title: 'Verify text is visible on screen',
      description:
        'Check from a screenshot that expected text is really visible to a user (not just in the DOM). Runs local OCR, offline. Returns pass/fail, what was read, confidence and, on failure, the reason (NOT_FOUND, LOW_CONFIDENCE, INSUFFICIENT_CONTRAST) and where on the screenshot. Use it after changing UI to confirm the change rendered.',
      inputSchema: {
        ...image,
        expected: z.string().describe('The text a user should be able to read'),
        ignore_case: z.boolean().optional(),
        exact: z.boolean().optional().describe('Require the region text to equal the expected text'),
        min_confidence: z.number().min(0).max(100).optional().describe('OCR confidence, default 80'),
        min_contrast_ratio: z.number().min(1).max(21).optional().describe('WCAG contrast ratio, e.g. 4.5'),
        region,
      },
    },
    async (a) => {
      const t0 = Date.now();
      try {
        const r = await runVerify(loadImage({ path: a.image_path, base64: a.image_base64 }), a.expected, {
          ignoreCase: a.ignore_case,
          exact: a.exact,
          minConfidence: a.min_confidence,
          minContrastRatio: a.min_contrast_ratio,
          region: a.region,
        });
        logUsage({ surface: 'mcp', tool: 'verify_text', pass: r.pass, failure: r.failure, ms: Date.now() - t0 });
        return text(r);
      } catch (e) {
        logUsage({ surface: 'mcp', tool: 'verify_text', failure: 'ERROR', ms: Date.now() - t0 });
        return text({ error: (e as Error).message }, true);
      }
    }
  );

  server.registerTool(
    'read_text',
    {
      title: 'Read the text visible in a screenshot',
      description:
        'OCR a screenshot locally and return the text a user would see, line by line with confidence and position. Use it to see what actually rendered when you do not know what to expect.',
      inputSchema: { ...image, region },
    },
    async (a) => {
      const t0 = Date.now();
      try {
        const r = await runRead(loadImage({ path: a.image_path, base64: a.image_base64 }), { region: a.region });
        logUsage({ surface: 'mcp', tool: 'read_text', ms: Date.now() - t0 });
        return text(r);
      } catch (e) {
        logUsage({ surface: 'mcp', tool: 'read_text', failure: 'ERROR', ms: Date.now() - t0 });
        return text({ error: (e as Error).message }, true);
      }
    }
  );

  return server;
}

export async function startStdio(version: string): Promise<void> {
  const server = createServer(version);
  await server.connect(new StdioServerTransport());
}
