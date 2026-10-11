#!/usr/bin/env bash
# Create GitHub Releases for the rendercheck tags from docs/release-notes/.
#
# Default is a dry run: it prints what would be created and writes nothing.
# Pass --apply to create the releases. A tag that already has a release is
# skipped. A release is created only if its tag exists on the remote.
#
# Usage: scripts/create-github-releases.sh [--dry-run] [--apply] [--repo OWNER/NAME]
set -euo pipefail

APPLY=0
REPO="ParthibanRajasekaran/text-from-image"
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) APPLY=0 ;;
    --apply) APPLY=1 ;;
    --repo) REPO="${2:?--repo needs OWNER/NAME}"; shift ;;
    -h|--help) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v gh >/dev/null 2>&1 || { echo "The GitHub CLI (gh) is required." >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh is not authenticated. Run: gh auth login" >&2; exit 1; }

# Oldest first, so the newest release is created last and becomes "latest".
VERSIONS="0.4.0 0.4.1 0.5.1 0.6.0"
for v in $VERSIONS; do
  tag="rendercheck-v$v"
  notes="$ROOT/docs/release-notes/rendercheck-v$v.md"
  [ -f "$notes" ] || { echo "skip  $tag (no notes file)"; continue; }
  if ! gh api "repos/$REPO/git/ref/tags/$tag" >/dev/null 2>&1; then
    echo "skip  $tag (tag not found on $REPO)"; continue
  fi
  if gh release view "$tag" --repo "$REPO" >/dev/null 2>&1; then
    echo "skip  $tag (release exists)"; continue
  fi
  if [ "$APPLY" -eq 1 ]; then
    latest=false; [ "$v" = "0.6.0" ] && latest=true
    gh release create "$tag" --repo "$REPO" --verify-tag --title "rendercheck v$v" \
      --notes-file "$notes" --latest="$latest"
    echo "made  $tag"
  else
    echo "would create  $tag from docs/release-notes/rendercheck-v$v.md"
  fi
done
[ "$APPLY" -eq 1 ] || echo "Dry run. Re-run with --apply to create the releases."
