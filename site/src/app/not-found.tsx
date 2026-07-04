import Link from "next/link";
import { Container } from "@/components/page";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container>
      <div className="py-16 text-center">
        <p className="text-6xl font-bold text-muted-foreground">404</p>
        <h1 className="mt-4 text-xl font-semibold">Η σελίδα δεν βρέθηκε</h1>
        <p className="mt-2 text-muted-foreground">
          Η σελίδα που ζητήσατε δεν υπάρχει στο αρχείο.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button render={<Link href="/">Αρχική</Link>} />
          <Button variant="outline" render={<Link href="/search/">Αναζήτηση</Link>} />
        </div>
      </div>
    </Container>
  );
}
