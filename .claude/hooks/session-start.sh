#!/bin/bash
# Prépare une session Claude Code cloud : dépendances npm + Chromium headless pour `npm run test:ci`.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund

# Karma lance ChromeHeadless en root : Chromium refuse sans --no-sandbox, d'où ce lanceur
CHROME_WRAPPER="$HOME/.local/bin/chrome-nosandbox"
mkdir -p "$(dirname "$CHROME_WRAPPER")"
cat > "$CHROME_WRAPPER" <<'SH'
#!/bin/sh
exec /opt/pw-browsers/chromium --no-sandbox "$@"
SH
chmod +x "$CHROME_WRAPPER"
echo "export CHROME_BIN=$CHROME_WRAPPER" >> "${CLAUDE_ENV_FILE:-/dev/null}"
