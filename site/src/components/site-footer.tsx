import Link from "next/link";
import { counts, generatedAt } from "@/lib/site";
import { formatNumber } from "@/lib/format";

export function SiteFooter() {
  const c = counts();
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-foreground">Ο Τόπος Μου</p>
            <p className="mt-1">
              Ψηφιακό αρχείο του otoposmou.gr — τοπική κοινότητα Κατερίνης &amp; Πιερίας,
              2004–2020.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Περιεχόμενο</p>
            <ul className="mt-1 space-y-0.5">
              <li>{formatNumber(c.publishedArticles)} άρθρα</li>
              <li>{c.sections} θεματικές ενότητες · {c.categories} κατηγορίες</li>
              <li>{c.polls} δημοσκοπήσεις · {formatNumber(c.totalVotes)} ψήφοι</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground">Σύνδεσμοι</p>
            <ul className="mt-1 space-y-0.5">
              <li><Link className="hover:underline" href="/archive/">Αρχείο ανά έτος</Link></li>
              <li><Link className="hover:underline" href="/data/">Λήψη δεδομένων</Link></li>
              <li><Link className="hover:underline" href="/search/">Αναζήτηση</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t pt-4 text-xs">
          Αποκατεστημένο από αντίγραφο βάσης δεδομένων. Οι εικόνες του αρχικού ιστότοπου
          δεν διασώθηκαν. Παράχθηκε {generatedAt().slice(0, 10)}.
        </p>
      </div>
    </footer>
  );
}
