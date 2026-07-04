import type { Metadata } from "next";
import { Container, Crumbs, PageHeader } from "@/components/page";
import { PollBars } from "@/components/poll-bars";
import { getPolls } from "@/lib/site";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Δημοσκοπήσεις" };

export default function PollsPage() {
  const polls = getPolls();
  const total = polls.reduce((s, p) => s + p.totalVotes, 0);
  return (
    <Container>
      <Crumbs items={[{ label: "Δημοσκοπήσεις" }]} />
      <PageHeader
        title="Δημοσκοπήσεις"
        subtitle={`${polls.length} δημοσκοπήσεις · ${formatNumber(total)} ψήφοι συνολικά`}
      />
      <div className="grid gap-5 md:grid-cols-2">
        {polls.map((p) => <PollBars key={p.id} poll={p} />)}
      </div>
    </Container>
  );
}
