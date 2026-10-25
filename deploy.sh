#!/usr/bin/env bash
# Celotechan site: install this release on the VPS.
#
#   sudo ./deploy.sh [BASE]        BASE defaults to /var/www/celotech
#
# What it does:
#   1. checks every file against SHA256SUMS (stops if the upload got corrupted)
#   2. copies the site to BASE/releases/<time>/
#   3. points BASE/current at it in one atomic step (no half-updated site)
#   4. tests and reloads nginx
#   5. keeps the 5 newest releases, so you can roll back:
#        sudo ln -sfn BASE/releases/<older> BASE/current && sudo systemctl reload nginx
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
BASE="${1:-/var/www/celotech}"
STAMP="$(date +%Y%m%d-%H%M%S)"
REL="$BASE/releases/$STAMP"

if [ "$(id -u)" -ne 0 ]; then echo "Run with sudo." >&2; exit 1; fi
test -f "$HERE/site/index.html" || { echo "site/index.html not found next to deploy.sh" >&2; exit 1; }

echo "1/4 checking files"
( cd "$HERE/site" && sha256sum --quiet -c ../SHA256SUMS )

echo "2/4 copying to $REL"
mkdir -p "$REL"
cp -a "$HERE/site/." "$REL/"
chown -R root:root "$REL"
find "$REL" -type d -exec chmod 755 {} +
find "$REL" -type f -exec chmod 644 {} +

echo "3/4 switching $BASE/current"
ln -sfn "$REL" "$BASE/current.new"
mv -Tf "$BASE/current.new" "$BASE/current"

echo "4/4 reloading the web server"
if command -v nginx >/dev/null 2>&1; then
  nginx -t
  systemctl reload nginx
else
  echo "    nginx not found: point your web server's root at $BASE/current and reload it yourself"
fi

# keep the 5 newest releases
ls -1dt "$BASE"/releases/*/ | tail -n +6 | while read -r old; do rm -rf -- "${old:?}"; done

echo "Live: $BASE/current -> $REL"
