import Link from "next/link";
import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { publishedArticles } from "@/lib/site";
import { yearOf, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Αρχείο ανά έτος" };

export default function ArchiveIndex() {
  const byYear = new Map<number, number>();
  for (const a of publishedArticles()) {
    const y = yearOf(a.date);
    if (y) byYear.set(y, (byYear.get(y) ?? 0) + 1);
  }
  const years = [...byYear.entries()].sort((a, b) => b[0] - a[0]);

  return (
    <Container>
      <Crumbs items={[{ label: "Αρχείο" }]} />
      <PageHeader
        title="Αρχείο ανά έτος"
        subtitle="Περιηγηθείτε στα άρθρα ανά χρονιά δημοσίευσης."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {years.map(([y, n]) => (
          <Link
            key={y}
            href={`/archive/${y}/`}
            className="flex items-baseline justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
          >
            <span className="text-lg font-semibold">{y}</span>
            <span className="text-sm text-muted-foreground">{formatNumber(n)}</span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
