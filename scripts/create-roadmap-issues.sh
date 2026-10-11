#!/usr/bin/env bash
# Create the GitHub issues drafted in docs/roadmap-issues.md.
#
# Default is a dry run: it prints what would be created and runs nothing that
# writes. Pass --apply to really create labels and issues. An issue is skipped
# when one with the exact same title already exists (open or closed).
#
# Usage: scripts/create-roadmap-issues.sh [--dry-run] [--apply] [--repo OWNER/NAME]
set -euo pipefail

APPLY=0
REPO=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) APPLY=0 ;;
    --apply) APPLY=1 ;;
    --repo) REPO="${2:?--repo needs OWNER/NAME}"; shift ;;
    -h|--help) sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/docs/roadmap-issues.md"
[ -f "$SRC" ] || { echo "Missing $SRC" >&2; exit 1; }

GH_REPO_ARGS=()
[ -n "$REPO" ] && GH_REPO_ARGS=(--repo "$REPO")

if ! command -v gh >/dev/null 2>&1; then
  echo "The GitHub CLI (gh) is required." >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Split the draft file into $WORK/NN.title, NN.labels (comma separated), NN.body
awk -v dir="$WORK" '
  function flush() { if (out != "") close(out); out = "" }
  /^## [0-9]+\. / {
    flush(); n++
    title = $0; sub(/^## [0-9]+\. /, "", title)
    base = sprintf("%s/%02d", dir, n)
    print title > (base ".title"); close(base ".title")
    inbody = 0; next
  }
  n > 0 && /^\*\*Labels:\*\*/ {
    l = $0; sub(/^\*\*Labels:\*\* */, "", l); gsub(/`/, "", l); gsub(/, */, ",", l)
    print l > (base ".labels"); close(base ".labels"); next
  }
  n > 0 && /^\*\*Body:\*\*/ { inbody = 1; out = base ".body"; printf "" > out; next }
  n > 0 && /^---$/ { flush(); inbody = 0; next }
  n > 0 && inbody { print > out }
' "$SRC"

count=0
for t in "$WORK"/*.title; do
  [ -e "$t" ] || break
  count=$((count + 1))
  base="${t%.title}"
  title="$(cat "$t")"
  labels="$(cat "$base.labels")"
  [ -s "$base.body" ] || { echo "No body parsed for: $title" >&2; exit 1; }

  echo "== $title"
  echo "   labels: $labels"

  # Idempotence: exact title match among all issues (any state).
  existing="$(gh issue list "${GH_REPO_ARGS[@]}" --state all --search "\"$title\" in:title" \
    --json title --jq '.[].title' || true)"
  if printf '%s\n' "$existing" | grep -Fxq -- "$title"; then
    echo "   skip: an issue with this exact title already exists"
    continue
  fi

  if [ "$APPLY" -ne 1 ]; then
    echo "   [dry-run] would create each label with: gh label create <label> --force"
    echo "   [dry-run] would run: gh issue create --title \"$title\" --body-file <draft body> --label \"$labels\""
    continue
  fi

  IFS=',' read -r -a label_list <<<"$labels"
  for lb in "${label_list[@]}"; do
    gh label create "${GH_REPO_ARGS[@]}" "$lb" --force >/dev/null
  done
  gh issue create "${GH_REPO_ARGS[@]}" --title "$title" --body-file "$base.body" --label "$labels"
done

[ "$count" -gt 0 ] || { echo "No drafts found in $SRC" >&2; exit 1; }
if [ "$APPLY" -ne 1 ]; then
  echo
  echo "Dry run only. Nothing was created. Re-run with --apply to create the issues."
fi
