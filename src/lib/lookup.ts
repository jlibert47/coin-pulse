import { compositionFor, extractYearFromText, findCoin } from "@/lib/coins";
import { normalizeQuery } from "@/lib/format";
import { fetchCryptoChart, searchCrypto } from "@/lib/crypto";
import {
  changePct,
  extractPrices,
  typicalBand,
} from "@/lib/extract-prices";
import { formatUsd, twoMonthWindow } from "@/lib/format";
import { fetchMetalSeries, scaleSeries, type MetalSpot } from "@/lib/metals";
import type {
  CoinKind,
  LookupRequest,
  LookupResult,
  PricePoint,
  WebFinding,
} from "@/lib/types";
import {
  dedupeFindings,
  fetchPageText,
  fetchWikipedia,
  markWindow,
  searchBing,
  searchNews,
} from "@/lib/web-search";

const VALUE_HOSTS = [
  "coinvalues.com",
  "usacoinbook.com",
  "ngccoin.com",
  "pcgs.com",
  "greysheet.com",
  "coinvaluechecker.com",
  "jmbullion.com",
  "apmex.com",
  "kitco.com",
  "coingecko.com",
];

function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function metalSpotFor(metal: string | undefined): MetalSpot | null {
  if (metal === "silver" || metal === "gold" || metal === "copper") return metal;
  return null;
}

function buildQuery(type: string, year: number | null, mint?: string) {
  const mintPart = mint && mint !== "any" ? ` ${mint}` : "";
  const yearPart = year ? `${year} ` : "";
  return `${yearPart}${type}${mintPart} value worth`.replace(/\s+/g, " ").trim();
}

function pickPagesToFetch(findings: WebFinding[], preferred?: string | null) {
  const urls: string[] = [];
  if (preferred) urls.push(preferred);
  for (const finding of findings) {
    if (VALUE_HOSTS.some((host) => finding.url.includes(host))) {
      urls.push(finding.url);
    }
  }
  return [...new Set(urls)].slice(0, 4);
}

export async function lookupCoin(input: LookupRequest): Promise<LookupResult> {
  const type = input.type.trim();
  if (!type) {
    throw new Error("Enter a coin type to search.");
  }

  const yearFromText = extractYearFromText(type);
  const year = input.year || yearFromText || null;
  const mint = input.mint && input.mint !== "any" ? input.mint : null;
  const window = twoMonthWindow();
  const matched = findCoin(type);
  const warnings: string[] = [];
  const displayName = [year, matched?.name ?? type, mint ? `(${mint})` : ""]
    .filter(Boolean)
    .join(" ");

  const searchQ = buildQuery(matched?.name ?? type, year, mint ?? undefined);
  const newsQ = `${year ?? ""} ${matched?.name ?? type} value`.trim();

  const wikiTitle = matched?.wikiTitle ?? (matched?.name ?? type).replaceAll(" ", "_");
  const preferredPage =
    matched?.valueSlug && year
      ? `https://coinvalues.com/${matched.valueSlug}/${year}`
      : null;

  const metal = matched ? compositionFor(matched, year) : null;
  const metalKind = metalSpotFor(metal?.metal);

  const [bingRes, newsRes, wikiRes, metalRes, cryptoRes] = await Promise.allSettled([
    searchBing(searchQ, year),
    searchNews(newsQ, year),
    fetchWikipedia(wikiTitle),
    metalKind ? fetchMetalSeries(metalKind) : Promise.resolve(null),
    (async () => {
      if (matched?.kind === "crypto" && matched.coingeckoId) {
        return fetchCryptoChart(matched.coingeckoId);
      }
      if (matched?.kind === "collectible" || year) return null;
      const hit = await searchCrypto(type);
      if (!hit) return null;
      const chart = await fetchCryptoChart(hit.id);
      if (!chart) return null;
      return { ...chart, name: hit.name, symbol: hit.symbol };
    })(),
  ]);

  if (bingRes.status === "rejected") warnings.push("Web search was partially blocked; showing other sources.");
  if (newsRes.status === "rejected") warnings.push("Recent news search did not respond.");
  if (metalRes.status === "rejected") warnings.push("Live metal prices were unavailable.");
  if (cryptoRes.status === "rejected") warnings.push("Crypto market data was unavailable.");

  let findings = dedupeFindings([
    ...(settledValue(bingRes) ?? []),
    ...(settledValue(newsRes) ?? []),
  ]);
  findings = markWindow(findings, window.start, window.end);

  const pages = pickPagesToFetch(findings, preferredPage);
  const pageTexts = await Promise.all(pages.map((url) => fetchPageText(url)));
  for (let i = 0; i < pages.length; i++) {
    const text = pageTexts[i];
    if (!text) continue;
    const prices = extractPrices(text, year);
    if (!prices.length) continue;
    const existing = findings.find((f) => f.url === pages[i]);
    if (existing) {
      existing.prices = [...new Set([...existing.prices, ...prices.slice(0, 12)])];
      if (!existing.snippet) existing.snippet = text.slice(0, 220);
    } else {
      findings.unshift({
        title: `${displayName} live pricing`,
        url: pages[i],
        snippet: text.slice(0, 220),
        source: new URL(pages[i]).hostname.replace(/^www\./, ""),
        publishedAt: Date.now(),
        prices: prices.slice(0, 12),
        inWindow: true,
      });
    }
  }

  findings.sort((a, b) => {
    const aScore = (a.inWindow ? 2 : 0) + (a.prices.length ? 1 : 0);
    const bScore = (b.inWindow ? 2 : 0) + (b.prices.length ? 1 : 0);
    if (bScore !== aScore) return bScore - aScore;
    return (b.publishedAt ?? 0) - (a.publishedAt ?? 0);
  });

  const crypto = settledValue(cryptoRes);
  const metalQuote = settledValue(metalRes);
  const wiki = settledValue(wikiRes);

  const isCrypto = Boolean(crypto?.series.length) && (matched?.kind === "crypto" || !matched);
  const kind: CoinKind | "unknown" = matched?.kind ?? (isCrypto ? "crypto" : "unknown");

  let series: PricePoint[] = [];
  let seriesLabel = "Last 2 months";
  let meltValue: LookupResult["melt"] = null;
  let estimated: number | null = null;
  let low: number | null = null;
  let high: number | null = null;
  let basis = "public web sources from the last two months";
  let headline = "";

  if (isCrypto && crypto) {
    const cryptoName = matched?.name ?? crypto.name;
    series = downsample(crypto.series, 60);
    seriesLabel = `${(matched?.aliases[0] ?? crypto.symbol ?? "price").toUpperCase()} · last 60 days`;
    estimated = crypto.current;
    low = minOf(series);
    high = maxOf(series);
    basis = "CoinGecko spot prices for the last 60 days";
    const start = series[0]?.value ?? null;
    headline = estimated
      ? `${cryptoName} is ${formatUsd(estimated)} — ${changeLabel(changePct(start, estimated))}`
      : `No live ${cryptoName} price was returned`;
  } else {
    const oz = metal?.silverOz ?? metal?.goldOz ?? null;
    const copperLb = metal?.copperLb ?? null;
    const factor = oz ?? copperLb ?? null;
    if (metalQuote && factor) {
      series = downsample(scaleSeries(metalQuote.points, factor), 60);
      seriesLabel = `Melt value · last 60 days`;
      const currentMelt = series.at(-1)?.value ?? null;
      const startMelt = series[0]?.value ?? null;
      meltValue = {
        metal: metal?.metal ?? null,
        spot: metalQuote.spot,
        spotUnit: metalQuote.unit,
        oz: oz ?? copperLb ?? null,
        current: currentMelt,
        start: startMelt,
        changePct: changePct(startMelt, currentMelt),
      };
    }

    findings = findings.filter((finding) => isRelevantFinding(finding.title, matched?.name ?? type, year));

    const windowPrices = findings
      .filter((f) => f.inWindow || f.prices.length)
      .flatMap((f) => f.prices);
    const band = typicalBand(windowPrices, {
      melt: meltValue?.current ?? null,
      spot: meltValue?.spot ?? null,
      face: faceValueOf(matched?.denomination),
    });
    estimated = band.mid ?? meltValue?.current ?? null;
    low = band.low ?? meltValue?.current ?? null;
    high = band.high ?? meltValue?.current ?? null;

    if (band.mid && meltValue?.current && Math.abs(band.mid - meltValue.current) / meltValue.current > 0.08) {
      basis = "web listings plus live melt value from the last two months";
    } else if (meltValue?.current) {
      basis = "live precious-metal melt value over the last two months";
      const meltNow = meltValue.current;
      if (
        !band.sample.length ||
        band.sample.every((v) => Math.abs(v - meltNow) / meltNow < 0.08)
      ) {
        warnings.push(
          "Most public quotes track melt value; collector premiums were thin in the last two months."
        );
      }
    } else if (band.mid) {
      basis = "prices extracted from public web results";
    } else {
      basis = "available public sources; priced listings were scarce";
    }

    const seriesChange = changePct(series[0]?.value ?? meltValue?.start ?? null, series.at(-1)?.value ?? estimated);
    headline = estimated
      ? `${displayName} is around ${formatUsd(estimated)} (${changeLabel(seriesChange)})`
      : `No reliable asking price turned up for ${displayName}`;
  }

  const highlights = findings
    .filter((f) => f.prices.some((p) => estimated != null && p > Math.max(estimated * 8, 500)))
    .slice(0, 4);

  const recentFindings = findings.filter((f) => f.inWindow || f.prices.length).slice(0, 10);
  const shownFindings = recentFindings.length ? recentFindings : findings.slice(0, 8);

  if (!shownFindings.length) {
    warnings.push("Web search returned no priced results for this coin and date.");
  }

  return {
    query: {
      type,
      year,
      mint,
      displayName,
    },
    matchedCoin: matched,
    kind,
    window,
    summary: {
      headline,
      estimatedValue: estimated,
      low,
      high,
      changePct: changePct(series[0]?.value ?? meltValue?.start ?? null, series.at(-1)?.value ?? estimated),
      changeLabel: changeLabel(
        changePct(series[0]?.value ?? meltValue?.start ?? null, series.at(-1)?.value ?? estimated)
      ),
      basis,
    },
    melt: meltValue,
    series,
    seriesLabel,
    findings: shownFindings,
    highlights,
    wikipedia: wiki,
    warnings,
    searchedAt: Date.now(),
  };
}

function downsample(points: PricePoint[], max = 60): PricePoint[] {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const out: PricePoint[] = [];
  for (let i = 0; i < points.length; i += step) out.push(points[i]);
  const last = points.at(-1);
  if (last && out.at(-1)?.t !== last.t) out.push(last);
  return out;
}

function minOf(points: PricePoint[]) {
  if (!points.length) return null;
  return points.reduce((m, p) => Math.min(m, p.value), Number.POSITIVE_INFINITY);
}

function maxOf(points: PricePoint[]) {
  if (!points.length) return null;
  return points.reduce((m, p) => Math.max(m, p.value), Number.NEGATIVE_INFINITY);
}

function changeLabel(pct: number | null) {
  if (pct == null || !Number.isFinite(pct)) return "no two-month change yet";
  const abs = Math.abs(pct).toFixed(1);
  if (pct > 0.15) return `up ${abs}% over the last 2 months`;
  if (pct < -0.15) return `down ${abs}% over the last 2 months`;
  return "roughly unchanged over the last 2 months";
}

function faceValueOf(denomination?: string) {
  if (!denomination) return null;
  if (denomination.includes("$")) {
    const value = Number(denomination.replace(/[^0-9.]/g, ""));
    return Number.isFinite(value) ? value : null;
  }
  if (denomination.includes("¢")) {
    const cents = Number(denomination.replace(/[^0-9.]/g, ""));
    return Number.isFinite(cents) ? cents / 100 : null;
  }
  return null;
}

function isRelevantFinding(title: string, coinName: string, year: number | null) {
  const titleQ = normalizeQuery(title);
  const nameQ = normalizeQuery(coinName);
  const stop = new Set([
    "dollar",
    "half",
    "cent",
    "coin",
    "coins",
    "silver",
    "gold",
    "american",
    "united",
    "states",
    "the",
    "and",
    "of",
    "nickel",
    "dime",
    "quarter",
    "penny",
    "bullion",
    "value",
    "values",
  ]);
  const distinctive = nameQ.split(" ").filter((token) => token.length > 2 && !stop.has(token));
  if (titleQ.includes("live pricing")) return true;
  if (distinctive.some((token) => titleQ.includes(token))) return true;
  if (year && titleQ.includes(String(year))) {
    const overlap = nameQ.split(" ").filter((token) => titleQ.includes(token)).length;
    return overlap >= 2;
  }
  if (!distinctive.length) {
    return nameQ.split(" ").filter((token) => titleQ.includes(token)).length >= 2;
  }
  return false;
}
