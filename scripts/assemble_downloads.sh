#!/usr/bin/env bash
# Assemble the site's downloadable assets from the extraction outputs.
# Run after scripts/extract.py. Idempotent.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DL="$ROOT/site/public/downloads"

rm -rf "$DL"
mkdir -p "$DL/md" "$DL/json"

# Whole-dataset bundles (linked from the /data page).
# NOTE: the raw SQL dump is intentionally NOT published — it contains the admin
# password hash and advertiser emails. Only sanitized, article-only exports.
cp "$ROOT/export/data/articles.json" "$DL/articles.json"
cp "$ROOT/export/articles.csv"       "$DL/articles.csv"

# Per-article files (linked from each article page)
cp "$ROOT/export/markdown/"*.md          "$DL/md/"
cp "$ROOT/site_content/articles/"*.json  "$DL/json/"

# Markdown zip
( cd "$ROOT/export" && zip -q -r -X "$DL/articles-markdown.zip" markdown )

echo "downloads assembled:"
echo "  whole-dataset: $(ls "$DL"/*.* | wc -l | tr -d ' ') files"
echo "  per-article md:   $(ls "$DL/md"   | wc -l | tr -d ' ')"
echo "  per-article json: $(ls "$DL/json" | wc -l | tr -d ' ')"
du -sh "$DL"
