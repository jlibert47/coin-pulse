export function formatUsd(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  const maxFrac = value >= 1000 ? 0 : value >= 10 ? 2 : value >= 1 ? 2 : 4;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Math.min(digits, maxFrac),
    maximumFractionDigits: Math.max(digits, maxFrac),
  }).format(value);
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatShortDate(t: number): string {
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(t: number): string {
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function twoMonthWindow(now = Date.now()) {
  const start = now - 60 * 24 * 60 * 60 * 1000;
  return { start, end: now };
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function normalizeQuery(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
