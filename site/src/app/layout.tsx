import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { navSections } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: "Ο Τόπος Μου — Αρχείο otoposmou.gr",
    template: "%s · Ο Τόπος Μου",
  },
  description:
    "Ψηφιακό αρχείο του otoposmou.gr — τοπική κοινότητα & δράση, Κατερίνη/Πιερία, 2004–2020.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nav = navSections().map((s) => ({
    title: s.title,
    slug: s.slug,
    articleCount: s.articleCount,
  }));
  return (
    <html lang="el" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader sections={nav} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
