import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = { title: "Αναζήτηση" };

export default function SearchPage() {
  return (
    <Container>
      <Crumbs items={[{ label: "Αναζήτηση" }]} />
      <PageHeader
        title="Αναζήτηση"
        subtitle="Αναζητήστε σε όλα τα άρθρα του αρχείου."
      />
      <SearchClient />
    </Container>
  );
}
