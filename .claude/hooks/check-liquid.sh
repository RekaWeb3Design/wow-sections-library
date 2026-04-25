#!/usr/bin/env bash
# PostToolUse hook — runs `shopify theme check` after any Write/Edit on a .liquid file.

set -u

input="$(cat)"

file_path="$(printf '%s' "$input" | python -c "
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
print(data.get('tool_input', {}).get('file_path', ''))
" 2>/dev/null)"

case "$file_path" in
  *.liquid)
    echo ""
    echo "=== shopify theme check (triggered by edit to $file_path) ==="
    if command -v shopify >/dev/null 2>&1; then
      shopify theme check --path . || true
    else
      echo "shopify CLI not found on PATH — skipping theme check." >&2
    fi
    echo "=== end theme check ==="

    echo ""
    echo "📱 Running mobile-first check..."
    if command -v node >/dev/null 2>&1; then
      node scripts/validate/mobile-check.js || true
    else
      echo "node not found on PATH — skipping mobile-check." >&2
    fi
    echo "📱 Manual check reminder: open preview on mobile at 375px viewport width"
    ;;
esac

exit 0
