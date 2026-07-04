import type { Poll } from "@/lib/site";
import { formatNumber } from "@/lib/format";

export function PollBars({ poll }: { poll: Poll }) {
  return (
    <div className="rounded-lg border p-5">
      <h3 className="font-semibold leading-snug">{poll.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Σύνολο ψήφων: {formatNumber(poll.totalVotes)}
      </p>
      <ul className="mt-4 space-y-3">
        {poll.options.map((o, i) => (
          <li key={i}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0">{o.text}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {o.pct}% · {formatNumber(o.votes)}
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
              role="meter"
              aria-valuenow={o.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(o.pct, 1.5)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
