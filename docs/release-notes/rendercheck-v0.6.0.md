# rendercheck v0.6.0

Package: `@rendercheck/sdk`. Released 2026-10-11. Published from GitHub Actions with npm trusted publishing, so it carries a provenance attestation that links the package to its source commit.

This release adds a command line and an MCP server, so a person, a script or an AI coding agent can check what is actually visible in a screenshot, not just what is in the DOM. The Playwright and Cypress APIs are unchanged.

## Added

- **Command line.** `rendercheck verify <image> --expect "Total: $14.00"` exits 0 on pass, 1 when the assertion fails and 2 on an error such as an unreadable image. `--json` prints a stable result: `pass`, `failure` (`NOT_FOUND`, `LOW_CONFIDENCE` or `INSUFFICIENT_CONTRAST`), `read`, `confidence` and the position of the text. `rendercheck read <image>` prints the text a user would see.
- **MCP server.** `npx -y @rendercheck/sdk mcp` starts a stdio Model Context Protocol server with two tools, `verify_text` and `read_text`. It is listed in the MCP Registry as `io.github.ParthibanRajasekaran/rendercheck`.
- **`rendercheck init`.** Writes a short instruction block and the MCP server entry for Claude Code, `AGENTS.md` readers such as Codex, Cursor and GitHub Copilot. It is safe to run again, supports `--dry-run` and `--agents`, only edits its own marked block and never overwrites JSON it cannot parse.
- **Local usage log.** The CLI and MCP server append one line per run to `~/.rendercheck/usage.jsonl` on your own machine (time, tool, pass or fail, duration). It never records screenshot text and nothing is sent anywhere. `rendercheck stats` prints it; set `RENDERCHECK_NO_USAGE_LOG=1` to turn it off.

## Install

```
npm install --save-dev @rendercheck/sdk
```

MCP client configuration:

```json
{
  "mcpServers": {
    "rendercheck": { "command": "npx", "args": ["-y", "@rendercheck/sdk", "mcp"] }
  }
}
```

## Notes

- Everything runs locally and offline. The SDK makes no network requests.
- Run the MCP server from a folder other than the SDK's own source folder: `npx` resolves the package name to the local source there.
- This is a developer beta. The OCR engine reads English by default, and the repository's `benchmarks/` folder lists cases where it is wrong.
