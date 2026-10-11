# Security policy

RenderCheck is in developer beta. This policy covers the SDK (`@rendercheck/sdk`) and the site at getrendercheck.com.

## Reporting a vulnerability

Please report it privately, not in a public issue:

1. Use GitHub's "Report a vulnerability" button on the repository's Security tab, or
2. Email the address on the [Security page](https://getrendercheck.com/security#report).

Include the steps to reproduce, the version or commit, and what you expect to happen. You will get an acknowledgement within 7 days. This is a small project, so fix times depend on severity and are not guaranteed.

## Scope

In scope: the SDK, the site's code and its response headers, and anything that would cause an image to leave the machine that holds it.

Out of scope: social engineering, denial of service, findings that need a modified browser, and third-party services (Vercel, GitHub, npm).

## What this project does not claim

No security certification (for example SOC 2 or ISO 27001) and no third-party penetration test. What is in place, and how to check it, is listed at https://getrendercheck.com/security and in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Supported versions

Only the latest published release of the SDK and the current `main` branch receive fixes.
