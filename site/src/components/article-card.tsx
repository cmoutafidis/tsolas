import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ArticleSummary } from "@/lib/site";
import { formatDate } from "@/lib/format";

export function ArticleCard({ a }: { a: ArticleSummary }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {a.date && <time dateTime={a.date}>{formatDate(a.date)}</time>}
          {a.sectionTitle && a.sectionSlug && (
            <>
              <span aria-hidden>·</span>
              <Link href={`/section/${a.sectionSlug}/`} className="hover:underline">
                {a.sectionTitle}
              </Link>
            </>
          )}
        </div>
        <CardTitle className="text-base leading-snug">
          <Link href={`/article/${a.slug}/`} className="hover:underline">
            {a.title}
          </Link>
        </CardTitle>
      </CardHeader>
      {a.excerpt && (
        <CardContent className="mt-auto">
          <p className="line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>
        </CardContent>
      )}
    </Card>
  );
}

/** Compact one-line row for long lists (section/category/archive pages). */
export function ArticleRow({ a }: { a: ArticleSummary }) {
  return (
    <li className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      {a.date && (
        <time
          dateTime={a.date}
          className="w-28 shrink-0 text-xs tabular-nums text-muted-foreground"
        >
          {formatDate(a.date)}
        </time>
      )}
      <div className="min-w-0">
        <Link href={`/article/${a.slug}/`} className="font-medium hover:underline">
          {a.title}
        </Link>
        {a.categoryTitle && (
          <Badge variant="secondary" className="ml-2 align-middle text-[10px]">
            {a.categoryTitle}
          </Badge>
        )}
        {a.excerpt && (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{a.excerpt}</p>
        )}
      </div>
    </li>
  );
}
