import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { getNewsfeeds } from "@/lib/site";

export const metadata: Metadata = { title: "Ροές (RSS)" };

export default function FeedsPage() {
  const feeds = getNewsfeeds();
  return (
    <Container>
      <Crumbs items={[{ label: "Ροές" }]} />
      <PageHeader
        title="Ροές ειδήσεων (RSS)"
        subtitle="Εξωτερικές ροές RSS που ήταν καταχωρημένες στον ιστότοπο."
      />
      <ul className="divide-y">
        {feeds.map((f) => (
          <li key={f.id} className="py-3">
            <a
              href={f.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {f.name || f.link}
            </a>
            {f.link && <p className="mt-0.5 truncate text-sm text-muted-foreground">{f.link}</p>}
          </li>
        ))}
      </ul>
    </Container>
  );
}
