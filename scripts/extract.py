#!/usr/bin/env python3
"""
Extract the otoposmou.gr (Joomla/Mambo) phpMyAdmin dump into clean, structured
data for a static Next.js archive site + a portable export bundle.

Outputs:
  export/data/*.json        canonical deliverable data (articles.json = full)
  export/markdown/<slug>.md  one Markdown file per article
  export/articles.csv        flat spreadsheet index
  site_content/              staged data for the Next.js site
    index.json               sections, categories, slim article index, nav, counts
    articles/<slug>.json     full per-article record
    polls.json contacts.json weblinks.json newsfeeds.json menu.json

Run:  python3 scripts/extract.py
"""
import re, os, json, html, csv, datetime, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "medialoo_topos.sql")

EXPORT_DATA = os.path.join(ROOT, "export", "data")
EXPORT_MD = os.path.join(ROOT, "export", "markdown")
SITE = os.path.join(ROOT, "site_content")
SITE_ARTICLES = os.path.join(SITE, "articles")

for d in (EXPORT_DATA, EXPORT_MD, SITE, SITE_ARTICLES):
    os.makedirs(d, exist_ok=True)

sql = open(SRC, encoding="utf-8", errors="replace").read()

# ----------------------------------------------------------------------------
# Low-level SQL dump parser (handles multi-row INSERTs with quoted HTML)
# ----------------------------------------------------------------------------
def columns(table):
    m = re.search(r"CREATE TABLE `" + re.escape(table) + r"` \((.*?)\n\) ENGINE",
                  sql, re.DOTALL)
    if not m:
        return []
    # only the `col` definitions, not KEY/PRIMARY lines
    out = []
    for line in m.group(1).splitlines():
        cm = re.match(r"\s*`([^`]+)`", line)
        if cm:
            out.append(cm.group(1))
    return out

_ESC = {"n": "\n", "r": "\r", "t": "\t", "0": "", "b": "\b", "Z": "\x1a"}

def _decode(s):
    """Decode a MySQL single-quoted string body (backslash escapes)."""
    out = []
    i = 0
    while i < len(s):
        c = s[i]
        if c == "\\" and i + 1 < len(s):
            nxt = s[i + 1]
            out.append(_ESC.get(nxt, nxt))
            i += 2
        else:
            out.append(c)
            i += 1
    return "".join(out)

def unquote(v):
    v = v.strip()
    if v == "NULL":
        return None
    if len(v) >= 2 and v[0] == "'" and v[-1] == "'":
        return _decode(v[1:-1])
    return v  # numeric / bareword

def raw_tuples(table):
    """Yield lists of raw (still-quoted) field strings for each row."""
    out = []
    pat = re.compile(r"INSERT INTO `" + re.escape(table) +
                     r"` [^;]*? VALUES\s*(.*?);\s*(?:\n|$)", re.DOTALL)
    for m in pat.finditer(sql):
        s = m.group(1)
        i = 0; depth = 0; in_str = False; esc = False; cur = ""; fields = []
        while i < len(s):
            c = s[i]
            if in_str:
                if esc:
                    cur += c; esc = False
                elif c == "\\":
                    cur += c; esc = True
                elif c == "'":
                    in_str = False; cur += c
                else:
                    cur += c
            else:
                if c == "'":
                    in_str = True; cur += c
                elif c == "(":
                    if depth == 0:
                        fields = []; cur = ""
                    else:
                        cur += c
                    depth += 1
                elif c == ")":
                    depth -= 1
                    if depth == 0:
                        fields.append(cur); out.append(fields)
                    else:
                        cur += c
                elif c == "," and depth == 1:
                    fields.append(cur); cur = ""
                else:
                    cur += c
            i += 1
    return out

def records(table):
    cols = columns(table)
    rows = raw_tuples(table)
    recs = []
    for r in rows:
        if len(r) != len(cols):
            # tolerate trailing/oddities by zipping shortest
            pass
        recs.append({c: unquote(v) for c, v in zip(cols, r)})
    return recs

# ----------------------------------------------------------------------------
# Text helpers
# ----------------------------------------------------------------------------
GREEKLISH = {
    "α":"a","β":"v","γ":"g","δ":"d","ε":"e","ζ":"z","η":"i","θ":"th","ι":"i",
    "κ":"k","λ":"l","μ":"m","ν":"n","ξ":"x","ο":"o","π":"p","ρ":"r","σ":"s",
    "ς":"s","τ":"t","υ":"y","φ":"f","χ":"ch","ψ":"ps","ω":"o",
    "ά":"a","έ":"e","ή":"i","ί":"i","ό":"o","ύ":"y","ώ":"o",
    "ϊ":"i","ϋ":"y","ΐ":"i","ΰ":"y","ς":"s",
}

def slugify(text, ident):
    t = html.unescape(text or "").lower().strip()
    out = []
    for ch in t:
        if ch in GREEKLISH:
            out.append(GREEKLISH[ch])
        elif ch.isascii() and (ch.isalnum()):
            out.append(ch)
        elif ch.isdigit():
            out.append(ch)
        else:
            out.append("-")
    s = re.sub(r"-+", "-", "".join(out)).strip("-")
    s = s[:70].strip("-")
    if not s:
        s = "item"
    return f"{s}-{ident}"

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")

def to_plaintext(html_body):
    txt = TAG_RE.sub(" ", html_body or "")
    txt = html.unescape(txt)
    txt = txt.replace("\xa0", " ")
    return WS_RE.sub(" ", txt).strip()

# Placeholder shown in the rendered HTML where an image used to be. Marked
# data-pagefind-ignore so its text is excluded from the search index.
MISSING_IMG = ('<figure class="missing-image" data-missing-image="true" '
               'data-pagefind-ignore="true">🖼 εικόνα μη διαθέσιμη</figure>')

COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)              # incl. MS <!--[if]-->
BLOCK_RE = re.compile(r"<(style|script|xml)\b[^>]*>.*?</\1>",
                      re.DOTALL | re.IGNORECASE)                # Word style/xml dumps
WORDTAG_RE = re.compile(r"</?(?:o|w|m|v):[^>]*>", re.IGNORECASE)  # <o:p>, <w:...>
MACRO_RE = re.compile(r"\{(?:mos|load)[a-z]*[^}]*\}", re.IGNORECASE)

def _strip_junk(b):
    """Remove Word/CMS junk common to both the display and text variants."""
    b = BLOCK_RE.sub("", b)          # drop <style>/<script>/<xml> ... </...> blocks
    b = COMMENT_RE.sub("", b)        # drop comments incl. MS conditional comments
    b = WORDTAG_RE.sub("", b)        # drop Word namespace tags
    return b

def clean_body(html_body):
    """HTML for display: keep structure, swap {mosimage} for a placeholder."""
    if not html_body:
        return ""
    b = _strip_junk(html_body)
    b = re.sub(r"\{mosimage[^}]*\}", MISSING_IMG, b, flags=re.IGNORECASE)
    b = MACRO_RE.sub("", b)          # remaining Mambo/Joomla macros -> nothing
    return b.strip()

def clean_for_text(html_body):
    """Text source for search/excerpt: drop ALL macros (no placeholder text)."""
    if not html_body:
        return ""
    return MACRO_RE.sub("", _strip_junk(html_body))

def parse_dt(v):
    if not v or v.startswith("0000"):
        return None
    try:
        return datetime.datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
    except Exception:
        try:
            return datetime.datetime.strptime(v[:10], "%Y-%m-%d")
        except Exception:
            return None

# ----------------------------------------------------------------------------
# Load taxonomy
# ----------------------------------------------------------------------------
sections_raw = records("TOPOS_sections")
categories_raw = records("TOPOS_categories")

section_by_id = {}
for s in sections_raw:
    sid = s["id"]
    title = html.unescape(s.get("title") or s.get("name") or "").strip()
    section_by_id[sid] = {
        "id": int(sid),
        "title": title,
        "slug": slugify(title, sid),
        "ordering": int(s.get("ordering") or 0),
        "published": s.get("published") == "1",
        "articleCount": 0,
    }

category_by_id = {}
for c in categories_raw:
    cid = c["id"]
    title = html.unescape(c.get("title") or c.get("name") or "").strip()
    sec = c.get("section") or "0"
    category_by_id[cid] = {
        "id": int(cid),
        "title": title,
        "slug": slugify(title, cid),
        "sectionId": int(sec) if str(sec).isdigit() else None,
        "ordering": int(c.get("ordering") or 0),
        "published": c.get("published") == "1",
        "articleCount": 0,
    }

frontpage_ids = {int(r["content_id"]) for r in records("TOPOS_content_frontpage")}

# ----------------------------------------------------------------------------
# Articles
# ----------------------------------------------------------------------------
content = records("TOPOS_content")
articles = []
slugs_seen = set()

for r in content:
    cid = r["id"]
    title = html.unescape((r.get("title") or "").strip())
    body_raw = (r.get("introtext") or "") + (r.get("fulltext") or "")
    body = clean_body(body_raw)
    plain = to_plaintext(clean_for_text(body_raw))
    state = int(r.get("state") or 0)
    sec = section_by_id.get(r.get("sectionid"))
    cat = category_by_id.get(r.get("catid"))
    created = parse_dt(r.get("created"))
    pub_up = parse_dt(r.get("publish_up"))
    disp = pub_up or created
    slug = slugify(title, cid)
    if slug in slugs_seen:            # defensive; id suffix already makes unique
        slug = f"{slug}-{cid}"
    slugs_seen.add(slug)

    art = {
        "id": int(cid),
        "title": title or f"(χωρίς τίτλο #{cid})",
        "slug": slug,
        "sectionId": sec["id"] if sec else None,
        "sectionTitle": sec["title"] if sec else None,
        "sectionSlug": sec["slug"] if sec else None,
        "categoryId": cat["id"] if cat else None,
        "categoryTitle": cat["title"] if cat else None,
        "categorySlug": cat["slug"] if cat else None,
        "date": disp.isoformat() if disp else None,
        "created": created.isoformat() if created else None,
        "published": state == 1,
        "state": state,
        "frontpage": int(cid) in frontpage_ids,
        "hits": int(r.get("hits") or 0),
        "excerpt": plain[:220].strip(),
        "html": body,
        "text": plain,
    }
    articles.append(art)
    if art["published"]:
        if sec:
            sec["articleCount"] += 1
        if cat:
            cat["articleCount"] += 1

# newest first (undated sink to bottom)
articles.sort(key=lambda a: (a["date"] or "0000"), reverse=True)

# ----------------------------------------------------------------------------
# Aux content
# ----------------------------------------------------------------------------
polls_raw = records("TOPOS_polls")
poll_data = records("TOPOS_poll_data")
options_by_poll = {}
for o in poll_data:
    text = html.unescape((o.get("text") or "").strip())
    if not text:
        continue
    options_by_poll.setdefault(o.get("pollid"), []).append(
        {"text": text, "votes": int(o.get("hits") or 0)})
polls = []
for p in polls_raw:
    opts = options_by_poll.get(p["id"], [])
    total = sum(o["votes"] for o in opts) or int(p.get("voters") or 0)
    for o in opts:
        o["pct"] = round(100 * o["votes"] / total, 1) if total else 0
    polls.append({
        "id": int(p["id"]),
        "title": html.unescape((p.get("title") or "").strip()),
        "totalVotes": total,
        "published": p.get("published") == "1",
        "options": sorted(opts, key=lambda o: -o["votes"]),
    })
polls.sort(key=lambda p: -p["totalVotes"])

contacts = []
for c in records("TOPOS_contact_details"):
    contacts.append({
        "id": int(c["id"]),
        "name": html.unescape((c.get("name") or "").strip()),
        "position": html.unescape((c.get("con_position") or "").strip()),
        "address": html.unescape((c.get("address") or "").strip()),
        "telephone": (c.get("telephone") or "").strip(),
        "email": (c.get("email_to") or "").strip(),
        "misc": html.unescape((c.get("misc") or "").strip()),
        "published": c.get("published") == "1",
    })

weblinks = []
for w in records("TOPOS_weblinks"):
    weblinks.append({
        "id": int(w["id"]),
        "title": html.unescape((w.get("title") or "").strip()),
        "url": (w.get("url") or "").strip(),
        "description": to_plaintext(w.get("description") or ""),
        "hits": int(w.get("hits") or 0),
        "published": w.get("published") == "1",
    })

newsfeeds = []
for n in records("TOPOS_newsfeeds"):
    newsfeeds.append({
        "id": int(n["id"]),
        "name": html.unescape((n.get("name") or "").strip()),
        "link": (n.get("link") or "").strip(),
        "published": n.get("published") == "1",
    })

# Curated navigation: published sections that actually have published articles,
# in the site's ordering. Drops empty / Joomla-default sections.
JUNK = {"joomla!", "joomla! home", "joomla! forums", "χωρίς ενότητα"}
nav = sorted(
    [s for s in section_by_id.values()
     if s["articleCount"] > 0 and s["title"].lower() not in JUNK],
    key=lambda s: (s["ordering"], -s["articleCount"]))

# ----------------------------------------------------------------------------
# Write EXPORT bundle (deliverable)
# ----------------------------------------------------------------------------
def wjson(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

sections_out = sorted(section_by_id.values(), key=lambda s: s["ordering"])
categories_out = sorted(category_by_id.values(), key=lambda c: (c["sectionId"] or 0, c["ordering"]))

wjson(os.path.join(EXPORT_DATA, "articles.json"), articles)
wjson(os.path.join(EXPORT_DATA, "sections.json"), sections_out)
wjson(os.path.join(EXPORT_DATA, "categories.json"), categories_out)
wjson(os.path.join(EXPORT_DATA, "polls.json"), polls)
wjson(os.path.join(EXPORT_DATA, "contacts.json"), contacts)
wjson(os.path.join(EXPORT_DATA, "weblinks.json"), weblinks)
wjson(os.path.join(EXPORT_DATA, "newsfeeds.json"), newsfeeds)

# Markdown per article
def to_markdown(a):
    fm = [
        "---",
        f'title: "{a["title"].replace(chr(34), chr(39))}"',
        f'id: {a["id"]}',
        f'date: {a["date"] or ""}',
        f'section: "{(a["sectionTitle"] or "").replace(chr(34), chr(39))}"',
        f'category: "{(a["categoryTitle"] or "").replace(chr(34), chr(39))}"',
        f'published: {str(a["published"]).lower()}',
        "---",
        "",
        f'# {a["title"]}',
        "",
    ]
    return "\n".join(fm) + a["text"] + "\n"

for a in articles:
    with open(os.path.join(EXPORT_MD, a["slug"] + ".md"), "w", encoding="utf-8") as f:
        f.write(to_markdown(a))

# CSV index
with open(os.path.join(ROOT, "export", "articles.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["id", "date", "section", "category", "title", "slug", "published", "hits", "excerpt"])
    for a in articles:
        w.writerow([a["id"], a["date"] or "", a["sectionTitle"] or "", a["categoryTitle"] or "",
                    a["title"], a["slug"], a["published"], a["hits"], a["excerpt"]])

# ----------------------------------------------------------------------------
# Write SITE content (staged -> copied into site/content later)
# ----------------------------------------------------------------------------
generated_at = datetime.datetime.now().replace(microsecond=0).isoformat()

slim = [{k: a[k] for k in ("id", "title", "slug", "sectionTitle", "sectionSlug",
        "categoryTitle", "categorySlug", "date", "published", "frontpage",
        "hits", "excerpt")} for a in articles]

counts = {
    "articles": len(articles),
    "publishedArticles": sum(1 for a in articles if a["published"]),
    "sections": len(sections_out),
    "categories": len(categories_out),
    "polls": len(polls),
    "totalVotes": sum(p["totalVotes"] for p in polls),
}

wjson(os.path.join(SITE, "index.json"), {
    "generatedAt": generated_at,
    "site": {"title": "Ο Τόπος Μου", "domain": "otoposmou.gr"},
    "counts": counts,
    "sections": sections_out,
    "categories": categories_out,
    "nav": nav,
    "articles": slim,
})
wjson(os.path.join(SITE, "polls.json"), polls)
wjson(os.path.join(SITE, "contacts.json"), contacts)
wjson(os.path.join(SITE, "weblinks.json"), weblinks)
wjson(os.path.join(SITE, "newsfeeds.json"), newsfeeds)

for a in articles:
    wjson(os.path.join(SITE_ARTICLES, a["slug"] + ".json"), a)

# ----------------------------------------------------------------------------
# Validation
# ----------------------------------------------------------------------------
EXPECTED = {
    "articles": 1873, "sections": 43, "categories": 103,
    "polls": 16, "contacts": 1, "weblinks": 5, "newsfeeds": 9,
}
actual = {
    "articles": len(articles), "sections": len(sections_out),
    "categories": len(categories_out), "polls": len(polls),
    "contacts": len(contacts), "weblinks": len(weblinks), "newsfeeds": len(newsfeeds),
}
print("Extraction complete.")
print(json.dumps(counts, ensure_ascii=False, indent=2))
ok = True
for k, exp in EXPECTED.items():
    got = actual[k]
    flag = "OK " if got == exp else "!! "
    if got != exp:
        ok = False
    print(f"  {flag}{k}: expected {exp}, got {got}")
bodyless = sum(1 for a in articles if len(a["text"]) < 20)
print(f"  articles with <20 chars of text: {bodyless}")
print(f"  markdown files written: {len(articles)}")
print(f"  nav sections: {len(nav)}")
if not ok:
    print("VALIDATION FAILED", file=sys.stderr)
    sys.exit(1)
print("VALIDATION PASSED")
