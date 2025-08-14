#!/usr/bin/env bash
set -euo pipefail
echo "🔒 Secret guard scanning..."

# Block common secret files
BLOCKLIST_REGEX='(^|/)\.env(\..*)?$|(^|/)\.env\..*$|(^|/)\.npmrc$|(^|/)firebase\.json$|(^|/)google-services\.json$|(^|/)GoogleService-Info\.plist$'
if git ls-files -z | tr '\0' '\n' | grep -Eiq "$BLOCKLIST_REGEX"; then
  echo "::error::Secret-like files detected (.env, npmrc, etc). Commit them to .gitignore or remove before mirroring."
  exit 1
fi

# Lightweight grep for obvious API keys
if git grep -nE 'AIza[0-9A-Za-z\-_]{35}|sk-[A-Za-z0-9]{20,}|supabase\.(co|io).*key|Bearer [A-Za-z0-9_\-]{20,}' -- ':!**/*.png' ':!**/*.jpg' ':!**/*.svg' ':!**/*.ico' ; then
  echo "::warning::Potential secrets found in code. Review the lines above."
fi

echo "✅ Secret guard passed"
