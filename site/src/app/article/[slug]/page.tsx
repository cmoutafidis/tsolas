import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container, Crumbs } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ArticleDownload } from "@/components/article-download";
import { allArticleSlugs, getArticle, type Article } from "@/lib/site";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return allArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let a: Article;
  try {
    a = getArticle(slug);
  } catch {
    return { title: "Άρθρο" };
  }
  return {
    title: a.title,
    description: a.excerpt || undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let a: Article;
  try {
    a = getArticle(slug);
  } catch {
    notFound();
  }

  const html = sanitizeArticleHtml(a.html);
  const hasMissingImages = html.includes("data-missing-image");

  return (
    <Container>
      <Crumbs
        items={[
          ...(a.sectionTitle && a.sectionSlug
            ? [{ href: `/section/${a.sectionSlug}/`, label: a.sectionTitle }]
            : []),
          ...(a.categoryTitle && a.categorySlug
            ? [{ href: `/category/${a.categorySlug}/`, label: a.categoryTitle }]
            : []),
          { label: a.title },
        ]}
      />

      <article data-pagefind-body>
        <header className="mb-6">
          <div
            className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
            data-pagefind-ignore
          >
            {a.date && <time dateTime={a.date}>{formatDate(a.date)}</time>}
            {a.sectionTitle && <Badge variant="secondary">{a.sectionTitle}</Badge>}
            {!a.published && <Badge variant="outline">μη δημοσιευμένο</Badge>}
          </div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {a.title}
          </h1>
        </header>

        {hasMissingImages && (
          <p
            className="mb-6 rounded-md border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground"
            data-pagefind-ignore
          >
            Σημείωση: οι εικόνες του αρχικού άρθρου δεν διασώθηκαν στο αντίγραφο της βάσης
            και εμφανίζονται ως κράτηση θέσης.
          </p>
        )}

        <div
          className="prose prose-neutral max-w-none dark:prose-invert article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-10 border-t pt-6" data-pagefind-ignore>
          <p className="mb-2 text-sm font-medium">Λήψη αυτού του άρθρου</p>
          <ArticleDownload slug={a.slug} />
        </div>
      </article>
    </Container>
  );
}
