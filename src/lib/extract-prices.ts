const PRICE_RE =
  /\$\s?(\d{1,3}(?:,\d{3}){0,3}(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*(k|m|million|billion)?\b/gi;

const FACE_VALUES = new Set([0.01, 0.05, 0.1, 0.25, 0.5, 1]);

const DATE_RES: RegExp[] = [
  /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2}),?\s+(20\d{2})\b/i,
  /\b(20\d{2})-(0?\d|1[0-2])-(0?[1-9]|[12]\d|3[01])\b/,
];

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

export function extractPrices(text: string, yearHint?: number | null): number[] {
  const values: number[] = [];
  const skip = new Set<number>();
  if (yearHint) skip.add(yearHint);
  PRICE_RE.lastIndex = 0;

  for (const match of text.matchAll(PRICE_RE)) {
    const raw = match[1].replaceAll(",", "");
    let value = Number(raw);
    if (!Number.isFinite(value)) continue;
    const suffix = (match[2] ?? "").toLowerCase();
    if (suffix === "k") value *= 1_000;
    if (suffix === "m" || suffix === "million") value *= 1_000_000;
    if (suffix === "billion") value *= 1_000_000_000;
    if (value < 0.05 || value > 5_000_000) continue;
    if (skip.has(Math.round(value)) && !raw.includes(".")) continue;
    if (Number.isInteger(value) && value >= 1700 && value <= 2100) continue;
    values.push(value);
  }
  return values;
}

export function extractDateMs(text: string): number | null {
  const monthMatch = text.match(DATE_RES[0]);
  if (monthMatch) {
    const month = MONTHS[monthMatch[1].toLowerCase().replace(".", "")];
    const day = Number(monthMatch[2]);
    const year = Number(monthMatch[3]);
    if (month !== undefined) return Date.UTC(year, month, day);
  }
  const iso = text.match(DATE_RES[1]);
  if (iso) {
    return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }
  return null;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[idx];
}

export function typicalBand(
  values: number[],
  opts?: { melt?: number | null; spot?: number | null; face?: number | null }
) {
  const melt = opts?.melt ?? null;
  const spot = opts?.spot ?? null;
  const face = opts?.face ?? null;
  let pool = values.filter((v) => !FACE_VALUES.has(v) && v !== face);

  if (spot && melt && Math.abs(spot - melt) / Math.max(melt, 0.01) > 0.15) {
    pool = pool.filter((v) => Math.abs(v - spot) / spot > 0.04);
  }

  if (melt && melt > 0.5) {
    const nearMelt = pool.filter((v) => v >= melt * 0.75 && v <= melt * 2.5);
    if (nearMelt.length) pool = nearMelt;
    else pool = pool.filter((v) => v >= melt * 0.6 && v <= melt * 6);
  } else {
    pool = pool.filter((v) => v <= 50_000);
  }

  if (!pool.length && melt) {
    return { mid: melt, low: melt, high: melt, sample: [melt] };
  }

  const mid = median(pool);
  const low = percentile(pool, 20);
  const high = percentile(pool, 80);
  return { mid, low, high, sample: pool };
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0183;/g, "·")
    .replace(/\s+/g, " ")
    .trim();
}

export function changePct(start: number | null, end: number | null): number | null {
  if (start == null || end == null || start === 0) return null;
  return ((end - start) / start) * 100;
}
