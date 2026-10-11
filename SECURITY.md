# Security policy

RenderCheck is in developer beta. This policy covers the SDK (`@rendercheck/sdk`) and the site at getrendercheck.com.

## Reporting a vulnerability

Please report it privately, not in a public issue:

1. Email the address on the [Security page](https://getrendercheck.com/security#report), or
2. Use GitHub's "Report a vulnerability" button on the repository's Security tab, if private vulnerability reporting is enabled there. It is a repository setting and may be off; if the button is missing, use email.

Include the steps to reproduce, the version or commit, and what you expect to happen. You will get an acknowledgement within 7 days. This is a small project, so fix times depend on severity and are not guaranteed.

## Scope

In scope: the SDK, the site's code and its response headers, and anything that would cause an image to leave the machine that holds it.

Out of scope: social engineering, denial of service, findings that need a modified browser, and third-party services (Vercel, GitHub, npm).

## What this project does not claim

This is a single-maintainer project in developer beta. It has no security certification (for example SOC 2 or ISO 27001) and no third-party penetration test. `npm audit` reports advisories in build and development tooling; none were reported for the site's production dependencies when last checked (11 October 2026). What is in place, and how to check it, is listed at https://getrendercheck.com/security and in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Data handling in the SDK

The SDK, `rendercheck` command line and MCP server make no network requests (see `packages/rendercheck/__tests__/offline.spec.ts`). The command line and MCP server append a local usage log (time, tool, pass or fail, failure type, duration; no image or text) to `~/.rendercheck/usage.jsonl`. It is never sent anywhere. Set `RENDERCHECK_NO_USAGE_LOG=1` to disable it. `rendercheck init` writes agent configuration files into the current project; `--dry-run` shows them first.

## Supported versions

Only the latest published release of the SDK and the current `main` branch receive fixes.
