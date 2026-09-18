export type MetalKind = "silver" | "gold" | "copper" | "nickel" | "clad" | "steel";

export type CoinKind = "collectible" | "crypto";

export interface Composition {
  startYear: number;
  endYear: number;
  metal: MetalKind;
  silverOz?: number;
  goldOz?: number;
  copperLb?: number;
  note?: string;
}

export interface CoinType {
  id: string;
  name: string;
  kind: CoinKind;
  aliases: string[];
  years?: { start: number; end: number; gaps?: number[] };
  denomination?: string;
  country?: string;
  wikiTitle?: string;
  valueSlug?: string;
  composition?: Composition[];
  coingeckoId?: string;
}

export interface PricePoint {
  t: number;
  value: number;
  label?: string;
}

export interface WebFinding {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt: number | null;
  prices: number[];
  inWindow: boolean;
}

export interface LookupRequest {
  type: string;
  year?: number;
  mint?: string;
}

export interface LookupResult {
  query: {
    type: string;
    year: number | null;
    mint: string | null;
    displayName: string;
  };
  matchedCoin: CoinType | null;
  kind: CoinKind | "unknown";
  window: { start: number; end: number };
  summary: {
    headline: string;
    estimatedValue: number | null;
    low: number | null;
    high: number | null;
    changePct: number | null;
    changeLabel: string;
    basis: string;
  };
  melt: {
    metal: MetalKind | null;
    spot: number | null;
    spotUnit: string | null;
    oz: number | null;
    current: number | null;
    start: number | null;
    changePct: number | null;
  } | null;
  series: PricePoint[];
  seriesLabel: string;
  findings: WebFinding[];
  highlights: WebFinding[];
  wikipedia: { title: string; extract: string; url: string; thumbnail?: string } | null;
  warnings: string[];
  searchedAt: number;
}
