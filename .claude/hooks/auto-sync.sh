#!/usr/bin/env bash
# PostToolUse hook — runs `npm run sync` after any Write/Edit on a
# .liquid file located under sections/. Copies to ../dawn-dev/sections/
# and pushes to the Shopify dev store. Non-sections edits pass through.

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

# Normalize backslashes so Windows-style paths match the glob.
normalized="$(printf '%s' "$file_path" | tr '\\' '/')"

case "$normalized" in
  */sections/*.liquid)
    echo ""
    echo "=== npm run sync (triggered by edit to $file_path) ==="
    if command -v npm >/dev/null 2>&1; then
      npm run --silent sync || true
    else
      echo "npm not found on PATH — skipping sync." >&2
    fi
    echo "=== end sync ==="
    ;;
esac

exit 0
