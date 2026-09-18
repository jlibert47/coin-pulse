import type { PricePoint } from "@/lib/types";

export interface CryptoQuote {
  id: string;
  name: string;
  symbol: string;
  series: PricePoint[];
  current: number | null;
  image?: string;
}

export async function searchCrypto(query: string): Promise<{ id: string; name: string; symbol: string } | null> {
  const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    coins?: { id: string; name: string; symbol: string; market_cap_rank?: number }[];
  };
  const coin = data.coins?.[0];
  if (!coin) return null;
  return { id: coin.id, name: coin.name, symbol: coin.symbol };
}

export async function fetchCryptoChart(id: string): Promise<CryptoQuote | null> {
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=60`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 900 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { prices?: [number, number][] };
  const series = (data.prices ?? [])
    .filter((row) => Number.isFinite(row[0]) && Number.isFinite(row[1]))
    .map(([t, value]) => ({ t, value }));
  return {
    id,
    name: id,
    symbol: id,
    series,
    current: series.at(-1)?.value ?? null,
  };
}
