"use client";

import { Download, FileJson, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Per-article download controls. Markdown/JSON are served as static files under
 * /downloads/ (not embedded in the page) to keep article HTML small.
 */
export function ArticleDownload({ slug }: { slug: string }) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        render={
          <a href={`/downloads/md/${slug}.md`} download>
            <Download className="size-4" /> Markdown
          </a>
        }
      />
      <Button
        variant="outline"
        size="sm"
        render={
          <a href={`/downloads/json/${slug}.json`} download>
            <FileJson className="size-4" /> JSON
          </a>
        }
      />
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="size-4" /> Εκτύπωση / PDF
      </Button>
    </div>
  );
}
