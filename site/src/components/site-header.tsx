"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search, LayoutGrid } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type NavSection = { title: string; slug: string; articleCount: number };

const MAIN_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Αρχική" },
  { href: "/archive/", label: "Αρχείο" },
  { href: "/polls/", label: "Δημοσκοπήσεις" },
  { href: "/data/", label: "Δεδομένα" },
];

function SearchBox({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search/?q=${encodeURIComponent(q)}`);
        onDone?.();
      }}
      className="relative"
      role="search"
    >
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Αναζήτηση…"
        aria-label="Αναζήτηση στο αρχείο"
        className="h-9 w-full pl-8 sm:w-56"
      />
    </form>
  );
}

function TopicsList({ sections }: { sections: NavSection[] }) {
  return (
    <ScrollArea className="h-[60vh] pr-3">
      <ul className="grid gap-1">
        {sections.map((s) => (
          <li key={s.slug}>
            <SheetClose
              render={
                <Link
                  href={`/section/${s.slug}/`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <span>{s.title}</span>
                  <span className="text-xs text-muted-foreground">{s.articleCount}</span>
                </Link>
              }
            />
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

export function SiteHeader({ sections }: { sections: NavSection[] }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Μενού">
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Μενού</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {MAIN_LINKS.map((l) => (
                <SheetClose
                  key={l.href}
                  render={
                    <Link href={l.href} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                      {l.label}
                    </Link>
                  }
                />
              ))}
              <div className="my-2 border-t" />
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground">Θέματα</p>
              <TopicsList sections={sections} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-2 flex flex-col leading-tight">
          <span className="text-lg font-bold tracking-tight">Ο Τόπος Μου</span>
          <span className="hidden text-[11px] text-muted-foreground sm:block">
            Αρχείο otoposmou.gr · 2004–2020
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-2 hidden items-center gap-1 md:flex">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutGrid className="size-4" /> Θέματα
                </Button>
              }
            />
            <SheetContent side="left" className="w-96">
              <SheetHeader>
                <SheetTitle>Θέματα ({sections.length})</SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <TopicsList sections={sections} />
              </div>
            </SheetContent>
          </Sheet>
          {MAIN_LINKS.filter((l) => l.href !== "/").map((l) => (
            <Button
              key={l.href}
              variant="ghost"
              size="sm"
              render={<Link href={l.href}>{l.label}</Link>}
            />
          ))}
        </nav>

        <div className="ml-auto">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
