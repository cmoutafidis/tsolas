import Link from "next/link";
import { Container } from "@/components/page";
import { ArticleCard } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import {
  counts,
  frontpageArticles,
  navSections,
  publishedArticles,
} from "@/lib/site";
import { formatNumber } from "@/lib/format";

export default function Home() {
  const c = counts();
  const featured = frontpageArticles().slice(0, 6);
  const recent = publishedArticles()
    .filter((a) => !featured.some((f) => f.id === a.id))
    .slice(0, 12);
  const sections = navSections();

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-muted/30">
        <Container>
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-3">Ψηφιακό αρχείο · 2004–2020</Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ο Τόπος Μου</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Το πλήρες αρχείο κειμένων του <strong>otoposmou.gr</strong> — τοπική
              ενημέρωση, περιβάλλον και κοινωνική δράση στην Κατερίνη και την Πιερία.
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div><dt className="text-muted-foreground">Άρθρα</dt><dd className="text-xl font-semibold">{formatNumber(c.publishedArticles)}</dd></div>
              <div><dt className="text-muted-foreground">Θέματα</dt><dd className="text-xl font-semibold">{c.sections}</dd></div>
              <div><dt className="text-muted-foreground">Κατηγορίες</dt><dd className="text-xl font-semibold">{c.categories}</dd></div>
              <div><dt className="text-muted-foreground">Δημοσκοπήσεις</dt><dd className="text-xl font-semibold">{c.polls}</dd></div>
            </dl>
          </div>
        </Container>
      </section>

      <Container>
        {featured.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold">Επιλεγμένα</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((a) => <ArticleCard key={a.id} a={a} />)}
            </div>
          </section>
        )}

        <section className="mb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Πρόσφατα</h2>
            <Link href="/archive/" className="text-sm text-muted-foreground hover:underline">
              Όλο το αρχείο →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((a) => <ArticleCard key={a.id} a={a} />)}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Θεματικές ενότητες</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <Link
                key={s.slug}
                href={`/section/${s.slug}/`}
                className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="font-medium">{s.title}</span>
                <span className="text-muted-foreground">{s.articleCount}</span>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
