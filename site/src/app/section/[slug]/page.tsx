import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { ArticleRow } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import {
  allSections,
  articlesInSection,
  categoriesInSection,
  sectionBySlug,
} from "@/lib/site";
import { formatNumber } from "@/lib/format";

export function generateStaticParams() {
  return allSections()
    .filter((s) => s.articleCount > 0)
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = sectionBySlug(slug);
  return { title: s ? s.title : "Ενότητα" };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = sectionBySlug(slug);
  if (!section) notFound();

  const categories = categoriesInSection(section.id);
  const articles = articlesInSection(slug);

  return (
    <Container>
      <Crumbs items={[{ label: section.title }]} />
      <PageHeader
        title={section.title}
        subtitle={`${formatNumber(articles.length)} άρθρα${
          categories.length ? ` · ${categories.length} κατηγορίες` : ""
        }`}
      />

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}/`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                {cat.title} <span className="ml-1 text-muted-foreground">{cat.articleCount}</span>
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <ul>
        {articles.map((a) => <ArticleRow key={a.id} a={a} />)}
      </ul>
    </Container>
  );
}
