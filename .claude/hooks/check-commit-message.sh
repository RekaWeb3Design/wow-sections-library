#!/usr/bin/env bash
# PreToolUse hook — blocks `git commit` whose message does not start with
# feat:, fix:, docs:, refactor:, or chore:. Non-commit Bash calls pass through untouched.

set -u

input="$(cat)"

command_str="$(printf '%s' "$input" | python -c "
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
print(data.get('tool_input', {}).get('command', ''))
" 2>/dev/null)"

# Only inspect git commit invocations.
case "$command_str" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

# Extract the commit message. Supports -m "msg", -m 'msg', -m \"\$(cat <<'EOF' ... EOF)\".
# Strategy: find the first line beginning with an allowed prefix anywhere in the command.
# If any such prefix appears on its own (after a quote, newline, or start of -m), allow.
if printf '%s' "$command_str" | grep -qE '(^|[[:space:]"'\''<]|[$][(])\s*(feat|fix|docs|refactor|chore):' ; then
  exit 0
fi

cat >&2 <<'MSG'
Commit message does not start with an allowed prefix.

Required: commit messages must start with one of: feat:, fix:, docs:, refactor:, chore:
(See CLAUDE.md → Hard rules → Commits.)

Rewrite the message and try again. Examples:
  feat: liquid-lab-hero-basic — add hero section with image + CTA
  fix: liquid-lab-hero-basic — correct CSS scoping on mobile
  docs: update SKILL.md with new schema convention
  refactor: restructure sections by tier and category
  chore: bump dev dependencies
MSG

exit 2
