import type { PricePoint } from "@/lib/types";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const SYMBOLS = {
  silver: { ticker: "SI=F", unit: "USD / troy oz" },
  gold: { ticker: "GC=F", unit: "USD / troy oz" },
  copper: { ticker: "HG=F", unit: "USD / lb" },
} as const;

export type MetalSpot = keyof typeof SYMBOLS;

async function fetchYahooChart(ticker: string): Promise<PricePoint[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2mo`;
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`Yahoo ${ticker} ${res.status}`);
  const data = (await res.json()) as {
    chart?: {
      result?: {
        timestamp?: number[];
        indicators?: { quote?: { close?: (number | null)[] }[] };
      }[];
    };
  };
  const result = data.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const points: PricePoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close == null || !Number.isFinite(close)) continue;
    points.push({ t: timestamps[i] * 1000, value: close });
  }
  return points;
}

export async function fetchMetalSeries(metal: MetalSpot): Promise<{
  points: PricePoint[];
  unit: string;
  spot: number | null;
}> {
  const spec = SYMBOLS[metal];
  const points = await fetchYahooChart(spec.ticker);
  return {
    points,
    unit: spec.unit,
    spot: points.at(-1)?.value ?? null,
  };
}

export function scaleSeries(points: PricePoint[], factor: number): PricePoint[] {
  return points.map((p) => ({ t: p.t, value: p.value * factor }));
}
