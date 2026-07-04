import "server-only";
import fs from "node:fs";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "content");

function readJson<T>(...parts: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, ...parts), "utf-8")) as T;
}

// ---- Types ----------------------------------------------------------------
export interface Section {
  id: number;
  title: string;
  slug: string;
  ordering: number;
  published: boolean;
  articleCount: number;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  sectionId: number | null;
  ordering: number;
  published: boolean;
  articleCount: number;
}

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  sectionTitle: string | null;
  sectionSlug: string | null;
  categoryTitle: string | null;
  categorySlug: string | null;
  date: string | null;
  published: boolean;
  frontpage: boolean;
  hits: number;
  excerpt: string;
}

export interface Article extends ArticleSummary {
  sectionId: number | null;
  categoryId: number | null;
  created: string | null;
  state: number;
  html: string;
  text: string;
}

export interface PollOption {
  text: string;
  votes: number;
  pct: number;
}
export interface Poll {
  id: number;
  title: string;
  totalVotes: number;
  published: boolean;
  options: PollOption[];
}

export interface Contact {
  id: number;
  name: string;
  position: string;
  address: string;
  telephone: string;
  email: string;
  misc: string;
  published: boolean;
}
export interface Weblink {
  id: number;
  title: string;
  url: string;
  description: string;
  hits: number;
  published: boolean;
}
export interface Newsfeed {
  id: number;
  name: string;
  link: string;
  published: boolean;
}

interface Index {
  generatedAt: string;
  site: { title: string; domain: string };
  counts: {
    articles: number;
    publishedArticles: number;
    sections: number;
    categories: number;
    polls: number;
    totalVotes: number;
  };
  sections: Section[];
  categories: Category[];
  nav: Section[];
  articles: ArticleSummary[];
}

// ---- Cached loaders -------------------------------------------------------
let _index: Index | null = null;
function index(): Index {
  if (!_index) _index = readJson<Index>("index.json");
  return _index;
}

export const site = () => index().site;
export const counts = () => index().counts;
export const generatedAt = () => index().generatedAt;

export const allSections = () => index().sections;
export const allCategories = () => index().categories;
export const navSections = () => index().nav;

// Only published articles are surfaced in navigation/listing.
export function publishedArticles(): ArticleSummary[] {
  return index().articles.filter((a) => a.published);
}

export function frontpageArticles(): ArticleSummary[] {
  return publishedArticles().filter((a) => a.frontpage);
}

export function articlesInSection(slug: string): ArticleSummary[] {
  return publishedArticles().filter((a) => a.sectionSlug === slug);
}

export function articlesInCategory(slug: string): ArticleSummary[] {
  return publishedArticles().filter((a) => a.categorySlug === slug);
}

export function categoriesInSection(sectionId: number): Category[] {
  return allCategories()
    .filter((c) => c.sectionId === sectionId && c.articleCount > 0)
    .sort((a, b) => a.ordering - b.ordering);
}

export function sectionBySlug(slug: string): Section | undefined {
  return allSections().find((s) => s.slug === slug);
}
export function categoryBySlug(slug: string): Category | undefined {
  return allCategories().find((c) => c.slug === slug);
}

export function getArticle(slug: string): Article {
  return readJson<Article>("articles", `${slug}.json`);
}

// All article slugs (for generateStaticParams) — every article gets a page.
export function allArticleSlugs(): string[] {
  return index().articles.map((a) => a.slug);
}

export const getDownloadSizes = () =>
  readJson<Record<string, number>>("downloads-manifest.json");

export const getPolls = () => readJson<Poll[]>("polls.json");
export const getContacts = () => readJson<Contact[]>("contacts.json");
export const getWeblinks = () => readJson<Weblink[]>("weblinks.json");
export const getNewsfeeds = () => readJson<Newsfeed[]>("newsfeeds.json");
