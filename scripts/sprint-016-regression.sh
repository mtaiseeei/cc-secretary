#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
CHECKER="$SCRIPT_DIR/check-distribution-channel.py"

PASS=0
FAIL=0

ok() {
  PASS=$((PASS + 1))
  printf 'PASS %s\n' "$1"
}

ng() {
  FAIL=$((FAIL + 1))
  printf 'FAIL %s\n' "$1"
}

if python3 "$CHECKER" --root "$REPO" --report; then
  ok "current scope, preservation, protected-record, and no-leak checks"
else
  ng "current scope, preservation, protected-record, and no-leak checks"
fi

if python3 "$CHECKER" --self-test; then
  ok "target negative fixture and excluded-audit fixture"
else
  ng "target negative fixture and excluded-audit fixture"
fi

printf 'SPRINT016_PASS=%d SPRINT016_FAIL=%d\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
