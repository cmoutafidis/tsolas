const MONTHS_EL = [
  "Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαΐ", "Ιουν",
  "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ",
];

/** Format an ISO date string as a short Greek date, e.g. "7 Ιουλ 2012". */
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS_EL[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function yearOf(iso: string | null): number | null {
  if (!iso) return null;
  const y = Number(iso.slice(0, 4));
  return Number.isFinite(y) && y > 1990 ? y : null;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("el-GR").format(n);
}
