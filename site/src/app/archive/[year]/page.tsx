import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { ArticleRow } from "@/components/article-card";
import { publishedArticles } from "@/lib/site";
import { yearOf, formatNumber } from "@/lib/format";

function years(): number[] {
  const set = new Set<number>();
  for (const a of publishedArticles()) {
    const y = yearOf(a.date);
    if (y) set.add(y);
  }
  return [...set];
}

export function generateStaticParams() {
  return years().map((y) => ({ year: String(y) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return { title: `Αρχείο ${year}` };
}

export default async function ArchiveYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const y = Number(year);
  if (!years().includes(y)) notFound();

  const articles = publishedArticles().filter((a) => yearOf(a.date) === y);

  return (
    <Container>
      <Crumbs items={[{ href: "/archive/", label: "Αρχείο" }, { label: String(y) }]} />
      <PageHeader title={`Αρχείο ${y}`} subtitle={`${formatNumber(articles.length)} άρθρα`} />
      <ul>
        {articles.map((a) => <ArticleRow key={a.id} a={a} />)}
      </ul>
    </Container>
  );
}
