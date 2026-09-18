import type { CoinType } from "@/lib/types";
import { normalizeQuery } from "@/lib/format";

const SILVER_DIME = 0.07234;
const SILVER_QUARTER = 0.18084;
const SILVER_HALF = 0.36169;
const SILVER_HALF_40 = 0.14792;
const SILVER_DOLLAR = 0.77344;
const GOLD_20 = 0.9675;
const GOLD_10 = 0.48375;
const GOLD_5 = 0.24187;
const GOLD_2_5 = 0.12094;
const COPPER_WHEAT_LB = 0.00656;

export const COIN_TYPES: CoinType[] = [
  {
    id: "lincoln-wheat-cent",
    name: "Lincoln Wheat Cent",
    kind: "collectible",
    aliases: ["wheat penny", "wheat cent", "lincoln wheat", "wheaties"],
    years: { start: 1909, end: 1958 },
    denomination: "1¢",
    country: "United States",
    wikiTitle: "Lincoln_wheat_cent",
    valueSlug: "lincoln-wheat-cent",
    composition: [
      {
        startYear: 1909,
        endYear: 1942,
        metal: "copper",
        copperLb: COPPER_WHEAT_LB,
        note: "95% copper bronze",
      },
      {
        startYear: 1943,
        endYear: 1943,
        metal: "steel",
        note: "Zinc-coated steel wartime cent",
      },
      {
        startYear: 1944,
        endYear: 1958,
        metal: "copper",
        copperLb: COPPER_WHEAT_LB,
        note: "95% copper bronze",
      },
    ],
  },
  {
    id: "lincoln-memorial-cent",
    name: "Lincoln Memorial Cent",
    kind: "collectible",
    aliases: ["memorial penny", "lincoln memorial", "lincoln cent"],
    years: { start: 1959, end: 2008 },
    denomination: "1¢",
    country: "United States",
    wikiTitle: "Lincoln_cent",
    valueSlug: "lincoln-memorial-cent",
    composition: [
      {
        startYear: 1959,
        endYear: 1981,
        metal: "copper",
        copperLb: COPPER_WHEAT_LB,
      },
      {
        startYear: 1982,
        endYear: 2008,
        metal: "clad",
        note: "Most 1982+ cents are copper-plated zinc",
      },
    ],
  },
  {
    id: "indian-head-cent",
    name: "Indian Head Cent",
    kind: "collectible",
    aliases: ["indian head penny", "indian cent"],
    years: { start: 1859, end: 1909 },
    denomination: "1¢",
    country: "United States",
    wikiTitle: "Indian_Head_cent",
    valueSlug: "indian-head-cent",
    composition: [
      { startYear: 1859, endYear: 1864, metal: "clad", note: "Copper-nickel" },
      {
        startYear: 1864,
        endYear: 1909,
        metal: "copper",
        copperLb: COPPER_WHEAT_LB,
      },
    ],
  },
  {
    id: "buffalo-nickel",
    name: "Buffalo Nickel",
    kind: "collectible",
    aliases: ["indian head nickel", "bison nickel"],
    years: { start: 1913, end: 1938 },
    denomination: "5¢",
    country: "United States",
    wikiTitle: "Buffalo_nickel",
    valueSlug: "buffalo-nickel",
    composition: [{ startYear: 1913, endYear: 1938, metal: "nickel" }],
  },
  {
    id: "jefferson-nickel",
    name: "Jefferson Nickel",
    kind: "collectible",
    aliases: ["jefferson 5 cent", "wartime nickel"],
    years: { start: 1938, end: 2026 },
    denomination: "5¢",
    country: "United States",
    wikiTitle: "Jefferson_nickel",
    valueSlug: "jefferson-nickel",
    composition: [
      { startYear: 1938, endYear: 1941, metal: "nickel" },
      {
        startYear: 1942,
        endYear: 1945,
        metal: "silver",
        silverOz: 0.05626,
        note: "35% silver wartime nickel",
      },
      { startYear: 1946, endYear: 2026, metal: "nickel" },
    ],
  },
  {
    id: "barber-dime",
    name: "Barber Dime",
    kind: "collectible",
    aliases: ["barber 10 cent", "liberty head dime"],
    years: { start: 1892, end: 1916 },
    denomination: "10¢",
    country: "United States",
    wikiTitle: "Barber_dime",
    valueSlug: "barber-dime",
    composition: [
      {
        startYear: 1892,
        endYear: 1916,
        metal: "silver",
        silverOz: SILVER_DIME,
      },
    ],
  },
  {
    id: "mercury-dime",
    name: "Mercury Dime",
    kind: "collectible",
    aliases: ["winged liberty dime", "mercury 10 cent"],
    years: { start: 1916, end: 1945 },
    denomination: "10¢",
    country: "United States",
    wikiTitle: "Mercury_dime",
    valueSlug: "mercury-dime",
    composition: [
      {
        startYear: 1916,
        endYear: 1945,
        metal: "silver",
        silverOz: SILVER_DIME,
      },
    ],
  },
  {
    id: "roosevelt-dime",
    name: "Roosevelt Dime",
    kind: "collectible",
    aliases: ["roosevelt 10 cent"],
    years: { start: 1946, end: 2026 },
    denomination: "10¢",
    country: "United States",
    wikiTitle: "Roosevelt_dime",
    valueSlug: "roosevelt-dime",
    composition: [
      {
        startYear: 1946,
        endYear: 1964,
        metal: "silver",
        silverOz: SILVER_DIME,
      },
      { startYear: 1965, endYear: 2026, metal: "clad" },
    ],
  },
  {
    id: "barber-quarter",
    name: "Barber Quarter",
    kind: "collectible",
    aliases: ["liberty head quarter"],
    years: { start: 1892, end: 1916 },
    denomination: "25¢",
    country: "United States",
    wikiTitle: "Barber_quarter",
    valueSlug: "barber-quarter",
    composition: [
      {
        startYear: 1892,
        endYear: 1916,
        metal: "silver",
        silverOz: SILVER_QUARTER,
      },
    ],
  },
  {
    id: "standing-liberty-quarter",
    name: "Standing Liberty Quarter",
    kind: "collectible",
    aliases: ["standing liberty"],
    years: { start: 1916, end: 1930 },
    denomination: "25¢",
    country: "United States",
    wikiTitle: "Standing_Liberty_quarter",
    valueSlug: "standing-liberty-quarter",
    composition: [
      {
        startYear: 1916,
        endYear: 1930,
        metal: "silver",
        silverOz: SILVER_QUARTER,
      },
    ],
  },
  {
    id: "washington-quarter",
    name: "Washington Quarter",
    kind: "collectible",
    aliases: ["washington 25 cent", "state quarter"],
    years: { start: 1932, end: 2026 },
    denomination: "25¢",
    country: "United States",
    wikiTitle: "Washington_quarter",
    valueSlug: "washington-quarter",
    composition: [
      {
        startYear: 1932,
        endYear: 1964,
        metal: "silver",
        silverOz: SILVER_QUARTER,
      },
      { startYear: 1965, endYear: 2026, metal: "clad" },
    ],
  },
  {
    id: "barber-half",
    name: "Barber Half Dollar",
    kind: "collectible",
    aliases: ["barber half", "liberty head half"],
    years: { start: 1892, end: 1915 },
    denomination: "50¢",
    country: "United States",
    wikiTitle: "Barber_half_dollar",
    valueSlug: "barber-half-dollar",
    composition: [
      {
        startYear: 1892,
        endYear: 1915,
        metal: "silver",
        silverOz: SILVER_HALF,
      },
    ],
  },
  {
    id: "walking-liberty-half",
    name: "Walking Liberty Half Dollar",
    kind: "collectible",
    aliases: ["walker", "walking liberty half"],
    years: { start: 1916, end: 1947 },
    denomination: "50¢",
    country: "United States",
    wikiTitle: "Walking_Liberty_half_dollar",
    valueSlug: "walking-liberty-half-dollar",
    composition: [
      {
        startYear: 1916,
        endYear: 1947,
        metal: "silver",
        silverOz: SILVER_HALF,
      },
    ],
  },
  {
    id: "franklin-half",
    name: "Franklin Half Dollar",
    kind: "collectible",
    aliases: ["franklin half", "ben franklin half"],
    years: { start: 1948, end: 1963 },
    denomination: "50¢",
    country: "United States",
    wikiTitle: "Franklin_half_dollar",
    valueSlug: "franklin-half-dollar",
    composition: [
      {
        startYear: 1948,
        endYear: 1963,
        metal: "silver",
        silverOz: SILVER_HALF,
      },
    ],
  },
  {
    id: "kennedy-half",
    name: "Kennedy Half Dollar",
    kind: "collectible",
    aliases: ["kennedy half", "jfk half", "kennedy 50 cent"],
    years: { start: 1964, end: 2026 },
    denomination: "50¢",
    country: "United States",
    wikiTitle: "Kennedy_half_dollar",
    valueSlug: "kennedy-half-dollar",
    composition: [
      {
        startYear: 1964,
        endYear: 1964,
        metal: "silver",
        silverOz: SILVER_HALF,
        note: "90% silver",
      },
      {
        startYear: 1965,
        endYear: 1970,
        metal: "silver",
        silverOz: SILVER_HALF_40,
        note: "40% silver",
      },
      { startYear: 1971, endYear: 2026, metal: "clad" },
    ],
  },
  {
    id: "morgan-dollar",
    name: "Morgan Silver Dollar",
    kind: "collectible",
    aliases: ["morgan dollar", "morgan", "silver dollar"],
    years: { start: 1878, end: 2024 },
    denomination: "$1",
    country: "United States",
    wikiTitle: "Morgan_dollar",
    valueSlug: "morgan-dollar",
    composition: [
      {
        startYear: 1878,
        endYear: 1904,
        metal: "silver",
        silverOz: SILVER_DOLLAR,
      },
      {
        startYear: 1921,
        endYear: 1921,
        metal: "silver",
        silverOz: SILVER_DOLLAR,
      },
      {
        startYear: 2021,
        endYear: 2024,
        metal: "silver",
        silverOz: 0.859,
        note: "Modern Morgan commemorative issues",
      },
    ],
  },
  {
    id: "peace-dollar",
    name: "Peace Silver Dollar",
    kind: "collectible",
    aliases: ["peace dollar"],
    years: { start: 1921, end: 2024 },
    denomination: "$1",
    country: "United States",
    wikiTitle: "Peace_dollar",
    valueSlug: "peace-dollar",
    composition: [
      {
        startYear: 1921,
        endYear: 1935,
        metal: "silver",
        silverOz: SILVER_DOLLAR,
      },
      {
        startYear: 2021,
        endYear: 2024,
        metal: "silver",
        silverOz: 0.859,
      },
    ],
  },
  {
    id: "ike-dollar",
    name: "Eisenhower Dollar",
    kind: "collectible",
    aliases: ["ike dollar", "eisenhower"],
    years: { start: 1971, end: 1978 },
    denomination: "$1",
    country: "United States",
    wikiTitle: "Eisenhower_dollar",
    valueSlug: "eisenhower-dollar",
    composition: [
      { startYear: 1971, endYear: 1978, metal: "clad" },
    ],
  },
  {
    id: "american-silver-eagle",
    name: "American Silver Eagle",
    kind: "collectible",
    aliases: ["silver eagle", "ase", "us silver eagle"],
    years: { start: 1986, end: 2026 },
    denomination: "$1",
    country: "United States",
    wikiTitle: "American_Silver_Eagle",
    valueSlug: "american-silver-eagle",
    composition: [
      {
        startYear: 1986,
        endYear: 2026,
        metal: "silver",
        silverOz: 1,
        note: "1 troy oz .999 silver",
      },
    ],
  },
  {
    id: "american-gold-eagle",
    name: "American Gold Eagle (1 oz)",
    kind: "collectible",
    aliases: ["gold eagle", "age", "us gold eagle"],
    years: { start: 1986, end: 2026 },
    denomination: "$50",
    country: "United States",
    wikiTitle: "American_Gold_Eagle",
    valueSlug: "american-gold-eagle",
    composition: [
      {
        startYear: 1986,
        endYear: 2026,
        metal: "gold",
        goldOz: 1,
        note: "1 troy oz gold",
      },
    ],
  },
  {
    id: "saint-gaudens-double-eagle",
    name: "Saint-Gaudens Double Eagle",
    kind: "collectible",
    aliases: ["saint gaudens", "double eagle", "st gaudens $20"],
    years: { start: 1907, end: 1933 },
    denomination: "$20",
    country: "United States",
    wikiTitle: "Saint-Gaudens_double_eagle",
    valueSlug: "saint-gaudens-double-eagle",
    composition: [
      { startYear: 1907, endYear: 1933, metal: "gold", goldOz: GOLD_20 },
    ],
  },
  {
    id: "indian-head-eagle",
    name: "Indian Head Eagle",
    kind: "collectible",
    aliases: ["indian head $10", "indian eagle"],
    years: { start: 1907, end: 1933 },
    denomination: "$10",
    country: "United States",
    wikiTitle: "Indian_Head_eagle",
    valueSlug: "indian-head-eagle",
    composition: [
      { startYear: 1907, endYear: 1933, metal: "gold", goldOz: GOLD_10 },
    ],
  },
  {
    id: "indian-head-half-eagle",
    name: "Indian Head Half Eagle",
    kind: "collectible",
    aliases: ["indian head $5", "indian half eagle"],
    years: { start: 1908, end: 1929 },
    denomination: "$5",
    country: "United States",
    wikiTitle: "Indian_Head_half_eagle",
    valueSlug: "indian-head-half-eagle",
    composition: [
      { startYear: 1908, endYear: 1929, metal: "gold", goldOz: GOLD_5 },
    ],
  },
  {
    id: "indian-head-quarter-eagle",
    name: "Indian Head Quarter Eagle",
    kind: "collectible",
    aliases: ["indian head $2.50", "indian quarter eagle"],
    years: { start: 1908, end: 1929 },
    denomination: "$2.50",
    country: "United States",
    wikiTitle: "Indian_Head_quarter_eagle",
    valueSlug: "indian-head-quarter-eagle",
    composition: [
      { startYear: 1908, endYear: 1929, metal: "gold", goldOz: GOLD_2_5 },
    ],
  },
  {
    id: "maple-leaf-silver",
    name: "Canadian Silver Maple Leaf",
    kind: "collectible",
    aliases: ["maple leaf", "silver maple"],
    years: { start: 1988, end: 2026 },
    denomination: "$5",
    country: "Canada",
    wikiTitle: "Canadian_Silver_Maple_Leaf",
    composition: [
      { startYear: 1988, endYear: 2026, metal: "silver", silverOz: 1 },
    ],
  },
  {
    id: "krugerrand",
    name: "Krugerrand (1 oz)",
    kind: "collectible",
    aliases: ["krugerand", "krugerrand gold"],
    years: { start: 1967, end: 2026 },
    denomination: "1 oz",
    country: "South Africa",
    wikiTitle: "Krugerrand",
    composition: [
      { startYear: 1967, endYear: 2026, metal: "gold", goldOz: 1 },
    ],
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    kind: "crypto",
    aliases: ["btc", "xbt"],
    wikiTitle: "Bitcoin",
    coingeckoId: "bitcoin",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    kind: "crypto",
    aliases: ["eth", "ether"],
    wikiTitle: "Ethereum",
    coingeckoId: "ethereum",
  },
  {
    id: "solana",
    name: "Solana",
    kind: "crypto",
    aliases: ["sol"],
    wikiTitle: "Solana_(blockchain_platform)",
    coingeckoId: "solana",
  },
  {
    id: "xrp",
    name: "XRP",
    kind: "crypto",
    aliases: ["ripple"],
    wikiTitle: "Ripple_(payment_protocol)",
    coingeckoId: "ripple",
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    kind: "crypto",
    aliases: ["doge"],
    wikiTitle: "Dogecoin",
    coingeckoId: "dogecoin",
  },
];

export const EXAMPLE_LOOKUPS = [
  { type: "Kennedy Half Dollar", year: 1964, blurb: "90% silver first-year JFK" },
  { type: "Morgan Silver Dollar", year: 1921, blurb: "Last classic Morgan year" },
  { type: "Wheat Cent", year: 1909, blurb: "First Lincoln penny" },
  { type: "American Silver Eagle", year: 2024, blurb: "1 oz bullion dollar" },
  { type: "Bitcoin", year: 2026, blurb: "Spot price, last 60 days" },
  { type: "Mercury Dime", year: 1942, blurb: "Wartime 90% silver dime" },
];

export function compositionFor(coin: CoinType, year: number | null) {
  if (!coin.composition?.length) return null;
  if (!year) return coin.composition[0] ?? null;
  return (
    coin.composition.find((row) => year >= row.startYear && year <= row.endYear) ??
    null
  );
}

export function scoreCoinMatch(coin: CoinType, query: string): number {
  const q = normalizeQuery(query);
  if (!q) return 0;
  const names = [coin.name, coin.id.replaceAll("-", " "), ...coin.aliases].map(
    normalizeQuery
  );
  let best = 0;
  for (const name of names) {
    if (name === q) best = Math.max(best, 100);
    else if (name.startsWith(q) || q.startsWith(name)) best = Math.max(best, 80);
    else if (name.includes(q) || q.includes(name)) best = Math.max(best, 70);
    else {
      const qTokens = q.split(" ");
      const nTokens = new Set(name.split(" "));
      const overlap = qTokens.filter((t) => nTokens.has(t) && t.length > 2).length;
      if (overlap) best = Math.max(best, 40 + overlap * 10);
    }
  }
  return best;
}

export function findCoin(query: string): CoinType | null {
  let best: { coin: CoinType; score: number } | null = null;
  for (const coin of COIN_TYPES) {
    const score = scoreCoinMatch(coin, query);
    if (!best || score > best.score) best = { coin, score };
  }
  return best && best.score >= 40 ? best.coin : null;
}

export function extractYearFromText(text: string): number | null {
  const match = text.match(/\b(17|18|19|20)\d{2}\b/);
  if (!match) return null;
  const year = Number(match[0]);
  const max = new Date().getFullYear() + 1;
  if (year < 1600 || year > max) return null;
  return year;
}

export function suggestCoins(query: string, limit = 8): CoinType[] {
  const q = normalizeQuery(query);
  if (!q) return COIN_TYPES.filter((c) => c.kind === "collectible").slice(0, limit);
  return [...COIN_TYPES]
    .map((coin) => ({ coin, score: scoreCoinMatch(coin, q) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.coin);
}
