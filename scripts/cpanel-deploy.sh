#!/bin/bash
set -euo pipefail

FRONTEND_PUBLIC_PATH="${FRONTEND_PUBLIC_PATH:-/home/cetmedcl/public_html}"
REPO_PATH="${REPO_PATH:-$(pwd)}"
FRONTEND_DIST="${FRONTEND_DIST:-$REPO_PATH/frontend/dist}"
BACKUP_PATH="${CETMED_DEPLOY_BACKUP_PATH:-/home/cetmedcl/.cetmed-deploy-backup}"
LEGACY_CONFIG_PATH="${CETMED_LEGACY_CONFIG_PATH:-/home/cetmedcl/new.cetmed.cl/config.js}"

test -f "$FRONTEND_DIST/index.html"
test -d "$FRONTEND_DIST/assets"
test -d "$FRONTEND_DIST/docs"
test -d "$FRONTEND_DIST/images"
test -f "$FRONTEND_DIST/docs/brochure-cetmed.pdf"

mkdir -p "$FRONTEND_PUBLIC_PATH" "$BACKUP_PATH"

if [ -f "$FRONTEND_PUBLIC_PATH/config.js" ]; then
  cp -f "$FRONTEND_PUBLIC_PATH/config.js" "$BACKUP_PATH/config.js"
elif [ -f "$LEGACY_CONFIG_PATH" ]; then
  cp -f "$LEGACY_CONFIG_PATH" "$BACKUP_PATH/config.js"
fi

find "$FRONTEND_PUBLIC_PATH" -mindepth 1 ! -name config.js -exec rm -rf {} +

cp -f "$FRONTEND_DIST/index.html" "$FRONTEND_PUBLIC_PATH/index.html"
cp -f "$FRONTEND_DIST/.htaccess" "$FRONTEND_PUBLIC_PATH/.htaccess"
cp -f "$FRONTEND_DIST/favicon.png" "$FRONTEND_PUBLIC_PATH/favicon.png"
cp -f "$FRONTEND_DIST/robots.txt" "$FRONTEND_PUBLIC_PATH/robots.txt"
cp -f "$FRONTEND_DIST/config.example.js" "$FRONTEND_PUBLIC_PATH/config.example.js"

mkdir -p "$FRONTEND_PUBLIC_PATH/assets" "$FRONTEND_PUBLIC_PATH/docs" "$FRONTEND_PUBLIC_PATH/images" "$FRONTEND_PUBLIC_PATH/mail"
cp -a "$FRONTEND_DIST/assets/." "$FRONTEND_PUBLIC_PATH/assets/"
cp -a "$FRONTEND_DIST/docs/." "$FRONTEND_PUBLIC_PATH/docs/"
cp -a "$FRONTEND_DIST/images/." "$FRONTEND_PUBLIC_PATH/images/"
cp -a "$FRONTEND_DIST/mail/." "$FRONTEND_PUBLIC_PATH/mail/"

if [ -f "$BACKUP_PATH/config.js" ]; then
  cp -f "$BACKUP_PATH/config.js" "$FRONTEND_PUBLIC_PATH/config.js"
fi

test -f "$FRONTEND_PUBLIC_PATH/index.html"
test -f "$FRONTEND_PUBLIC_PATH/docs/brochure-cetmed.pdf"
ls "$FRONTEND_PUBLIC_PATH/assets"/index-*.js >/dev/null
ls "$FRONTEND_PUBLIC_PATH/assets"/index-*.css >/dev/null

COMMIT="$(git -C "$REPO_PATH" rev-parse --short HEAD 2>/dev/null || echo unknown)"
DEPLOYED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
JS_ASSET="$(basename "$(ls "$FRONTEND_PUBLIC_PATH/assets"/index-*.js | head -n 1)")"
CSS_ASSET="$(basename "$(ls "$FRONTEND_PUBLIC_PATH/assets"/index-*.css | head -n 1)")"

{
  echo "commit=$COMMIT"
  echo "deployed_at=$DEPLOYED_AT"
  echo "js_asset=$JS_ASSET"
  echo "css_asset=$CSS_ASSET"
  echo "brochure=docs/brochure-cetmed.pdf"
} > "$FRONTEND_PUBLIC_PATH/cetmed-deploy.txt"
