#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/yasashii-harness-online.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT
REPO="mtaiseeei/yasashii-harness"

if ! command -v gh >/dev/null 2>&1; then
  printf 'ONLINE=UNVERIFIED gh command is unavailable\n' >&2
  exit 1
fi

fetch_json() {
  local endpoint="$1"
  local output="$2"
  gh api "$endpoint" > "$output" 2>/dev/null
}

fetch_raw() {
  local path="$1"
  local output="$2"
  gh api -H 'Accept: application/vnd.github.raw+json' "repos/$REPO/contents/$path" > "$output" 2>/dev/null
}

if ! fetch_json "repos/$REPO" "$WORK/repo.json" ||
   ! fetch_raw '.claude-plugin/marketplace.json' "$WORK/claude-marketplace.json" ||
   ! fetch_raw 'plugins/harness/.claude-plugin/plugin.json' "$WORK/claude-plugin.json" ||
   ! fetch_raw '.agents/plugins/marketplace.json' "$WORK/codex-marketplace.json" ||
   ! fetch_raw 'plugins/harness/.codex-plugin/plugin.json' "$WORK/codex-plugin.json" ||
   ! fetch_raw 'gentle-overlay/metadata-overrides.json' "$WORK/metadata-overrides.json"; then
  printf 'ONLINE=UNVERIFIED GitHub API request failed or a required file returned 404\n' >&2
  exit 1
fi

if python3 "$SCRIPT_DIR/check-yasashii-harness-reference.py" \
  --repo-json "$WORK/repo.json" \
  --claude-marketplace "$WORK/claude-marketplace.json" \
  --claude-plugin "$WORK/claude-plugin.json" \
  --codex-marketplace "$WORK/codex-marketplace.json" \
  --codex-plugin "$WORK/codex-plugin.json" \
  --metadata-overrides "$WORK/metadata-overrides.json"; then
  printf 'ONLINE=PASS repo=%s\n' "$REPO"
  exit 0
fi

printf 'ONLINE=FAIL remote metadata mismatch\n' >&2
exit 1
