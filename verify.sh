#!/usr/bin/env bash
# Celotechan site: check the live site from the outside.
#   ./verify.sh [https://celotech.sazporto.com]
U="${1:-https://celotech.sazporto.com}"
TMP="$(mktemp)"
fails=0
ok()   { echo "ok    $*"; }
bad()  { echo "FAIL  $*"; fails=$((fails+1)); }

code=$(curl -s -o "$TMP" -w '%{http_code}' "$U/")
[ "$code" = 200 ] && ok "page answers 200" || bad "page answers $code"
grep -q 'data-host="web"' "$TMP" && ok "page is the new site" \
  || bad "page is not the new site yet (old placeholder, or Cloudflare cached the HTML: purge cache)"

# every file the page uses must answer 200
missing=0; n=0
for p in $(grep -oE '(src|poster|href|data-src)="(assets|vendor)/[^"]+"' "$TMP" | sed -E 's/^[a-z-]+="//; s/"$//' | sort -u) duo3d.js favicon.ico og.jpg robots.txt; do
  n=$((n+1))
  c=$(curl -s -o /dev/null -w '%{http_code}' "$U/$p")
  [ "$c" = 200 ] || { bad "$p -> $c"; missing=$((missing+1)); }
done
[ "$missing" = 0 ] && ok "all $n files answer 200"

# videos must allow byte ranges (needed for seeking and for iPhone playback)
v=$(grep -oE 'data-src="assets/[^"]+"' "$TMP" | head -1 | sed -E 's/data-src="//; s/"$//')
if [ -n "$v" ]; then
  c=$(curl -s -o /dev/null -w '%{http_code}' -H 'Range: bytes=0-1023' "$U/$v")
  [ "$c" = 206 ] && ok "video byte ranges work ($v)" || bad "video range request answers $c ($v)"
  ct=$(curl -sI "$U/$v" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-type"{print $2}')
  [ "$ct" = "video/mp4" ] && ok "video content-type video/mp4" || bad "video content-type is '$ct'"
fi

c=$(curl -s -o /dev/null -w '%{http_code}' "$U/halaman-yang-nggak-ada")
[ "$c" = 404 ] && ok "unknown pages answer 404" || bad "unknown page answers $c"

curl -sI "$U/" | tr -d '\r' | grep -iE '^(cache-control|x-content-type-options|cf-cache-status|server):' | sed 's/^/      /'
rm -f "$TMP"
echo
[ "$fails" = 0 ] && echo "ALL GOOD" || { echo "$fails problem(s)"; exit 1; }
