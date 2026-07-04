# Ο Τόπος Μου — otoposmou.gr archive

A static, browsable archive of **otoposmou.gr** — a Greek local community / activism
site (Katerini & Pieria, 2004–2020) that ran on Joomla/Mambo. Rebuilt from a
phpMyAdmin database backup into a self-contained Next.js site plus portable data
exports.

**Contents restored:** 1,873 articles (1,824 published) across 43 sections & 103
categories, 16 polls with results, contacts, weblinks and RSS feeds.

> **Images:** the original image *files* were not part of the database backup and
> the site was never archived, so they are unrecoverable. Article **text** is
> complete; a placeholder is shown where an image used to be. Embedded YouTube
> videos still work.

## Structure

```
tsolas/
├── medialoo_topos.sql        # raw DB dump (git-ignored — see Privacy)
├── scripts/
│   ├── extract.py            # parse the SQL dump -> JSON + Markdown + CSV
│   ├── assemble_downloads.sh # build the site's download bundles
│   └── build_data.sh         # full pipeline: extract -> stage -> assemble
└── site/                     # Next.js 16 app (App Router, static export)
    ├── content/              # generated JSON consumed at build time
    ├── public/downloads/     # generated download bundles + per-article files
    └── src/                  # pages & components (shadcn/ui + Tailwind v4)
```

## Regenerating the data (optional)

Requires `python3` (stdlib only) and the raw `medialoo_topos.sql` in the repo root:

```bash
bash scripts/build_data.sh      # extract -> site/content + site/public/downloads
```

The generated `site/content/` and `site/public/downloads/` are committed, so the
site builds without this step.

## Run locally

```bash
cd site
npm install
npm run build        # -> site/out (static) + Pagefind search index
npm run serve        # preview the static build
# or: npm run dev    # dev server (search index only exists after a build)
```

## Deploy to Vercel

Import this repo in Vercel and set:

- **Root Directory:** `site`
- Framework preset: **Next.js** (auto-detected; `vercel.json` sets the build command)

Vercel runs `npm run build`, which produces the static export and the Pagefind
search index (`postbuild`). No environment variables needed.

## Features

- Home, section, category and per-year archive browsing
- Full article pages (sanitized legacy HTML, image placeholders, YouTube embeds)
- Full-text **search** over all articles (Pagefind, Greek)
- Polls with result bar charts
- **Download center** (`/data`) + per-article Markdown/JSON download buttons

## Privacy

The only personal data in the original dump is one admin account (email + password
hash) and three advertiser emails. These are **excluded** from the site and all
exports (the extractor never reads the users table). The raw `medialoo_topos.sql`
is **git-ignored** so the password hash is not published — keep your local copy.
