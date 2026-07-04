import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { getWeblinks } from "@/lib/site";

export const metadata: Metadata = { title: "Σύνδεσμοι" };

export default function LinksPage() {
  const links = getWeblinks().filter((l) => l.url);
  return (
    <Container>
      <Crumbs items={[{ label: "Σύνδεσμοι" }]} />
      <PageHeader title="Σύνδεσμοι" subtitle="Κατάλογος εξωτερικών συνδέσμων του αρχείου." />
      {links.length === 0 ? (
        <p className="text-muted-foreground">Δεν βρέθηκαν σύνδεσμοι.</p>
      ) : (
        <ul className="divide-y">
          {links.map((l) => (
            <li key={l.id} className="py-3">
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {l.title || l.url}
              </a>
              {l.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{l.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
