import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { counts, getDownloadSizes } from "@/lib/site";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Λήψη δεδομένων" };

function humanSize(bytes: number | undefined): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

const FILES: { file: string; title: string; desc: string }[] = [
  {
    file: "articles.json",
    title: "Όλα τα άρθρα (JSON)",
    desc: "Δομημένα δεδομένα με πλήρες κείμενο, HTML, ενότητα, κατηγορία και ημερομηνία για κάθε άρθρο.",
  },
  {
    file: "articles-markdown.zip",
    title: "Άρθρα σε Markdown (ZIP)",
    desc: "Ένα αρχείο Markdown ανά άρθρο — έτοιμο για εισαγωγή σε WordPress, Ghost, Obsidian κ.ά.",
  },
  {
    file: "articles.csv",
    title: "Ευρετήριο άρθρων (CSV)",
    desc: "Λογιστικό φύλλο: τίτλος, ημερομηνία, ενότητα, κατηγορία και απόσπασμα για κάθε άρθρο.",
  },
];

export default function DataPage() {
  const c = counts();
  const sizes = getDownloadSizes();
  return (
    <Container>
      <Crumbs items={[{ label: "Λήψη δεδομένων" }]} />
      <PageHeader
        title="Λήψη δεδομένων"
        subtitle="Κατεβάστε ολόκληρο το αρχείο σε ανοιχτές, επαναχρησιμοποιήσιμες μορφές."
      />

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Το αρχείο περιέχει {formatNumber(c.publishedArticles)} δημοσιευμένα άρθρα
        ({formatNumber(c.articles)} συνολικά με τα μη δημοσιευμένα). Τα δεδομένα είναι δικά
        σας — μπορείτε να τα κατεβάσετε και να τα χρησιμοποιήσετε ελεύθερα. Κάθε άρθρο
        διαθέτει επίσης ξεχωριστά κουμπιά λήψης (Markdown / JSON) στη σελίδα του.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {FILES.map((f) => {
          const size = humanSize(sizes[f.file]);
          return (
            <Card key={f.file} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">{f.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{size}</span>
                <Button
                  size="sm"
                  render={
                    <a href={`/downloads/${f.file}`} download>
                      <Download className="size-4" /> Λήψη
                    </a>
                  }
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
