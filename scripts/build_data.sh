#!/usr/bin/env bash
# Full data pipeline: parse the SQL dump -> stage JSON into the site ->
# assemble downloadable bundles. Run before `npm run build` in site/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> [1/3] Extracting data from SQL dump"
python3 "$ROOT/scripts/extract.py"

echo "==> [2/3] Staging content into site/content"
rm -rf "$ROOT/site/content"
mkdir -p "$ROOT/site/content"
cp "$ROOT/site_content/"*.json "$ROOT/site/content/"
cp -R "$ROOT/site_content/articles" "$ROOT/site/content/articles"

echo "==> [3/3] Assembling downloads"
bash "$ROOT/scripts/assemble_downloads.sh"

echo "Data pipeline complete."
