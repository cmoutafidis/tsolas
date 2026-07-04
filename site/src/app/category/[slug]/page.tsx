import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { ArticleRow } from "@/components/article-card";
import {
  allCategories,
  articlesInCategory,
  categoryBySlug,
  allSections,
} from "@/lib/site";
import { formatNumber } from "@/lib/format";

export function generateStaticParams() {
  return allCategories()
    .filter((c) => c.articleCount > 0)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  return { title: c ? c.title : "Κατηγορία" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const parent = allSections().find((s) => s.id === category.sectionId);
  const articles = articlesInCategory(slug);

  return (
    <Container>
      <Crumbs
        items={[
          ...(parent ? [{ href: `/section/${parent.slug}/`, label: parent.title }] : []),
          { label: category.title },
        ]}
      />
      <PageHeader title={category.title} subtitle={`${formatNumber(articles.length)} άρθρα`} />
      <ul>
        {articles.map((a) => <ArticleRow key={a.id} a={a} />)}
      </ul>
    </Container>
  );
}
