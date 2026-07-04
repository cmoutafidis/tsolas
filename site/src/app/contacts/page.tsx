import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContacts } from "@/lib/site";

export const metadata: Metadata = { title: "Επικοινωνία" };

export default function ContactsPage() {
  const contacts = getContacts();
  return (
    <Container>
      <Crumbs items={[{ label: "Επικοινωνία" }]} />
      <PageHeader
        title="Επικοινωνία"
        subtitle="Στοιχεία επικοινωνίας όπως ήταν καταχωρημένα στη βάση δεδομένων."
      />
      {contacts.length === 0 ? (
        <p className="text-muted-foreground">Δεν βρέθηκαν στοιχεία επικοινωνίας.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">{c.name || "—"}</CardTitle>
                {c.position && <p className="text-sm text-muted-foreground">{c.position}</p>}
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {c.address && <p>{c.address}</p>}
                {c.telephone && <p>Τηλ.: {c.telephone}</p>}
                {c.email && <p>Email: {c.email}</p>}
                {c.misc && <p className="text-muted-foreground">{c.misc}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
