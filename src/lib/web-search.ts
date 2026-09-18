import { extractDateMs, extractPrices, stripHtml } from "@/lib/extract-prices";
import { hostnameOf } from "@/lib/format";
import type { WebFinding } from "@/lib/types";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function decodeBingHref(href: string): string {
  try {
    const url = new URL(href, "https://www.bing.com");
    const raw = url.searchParams.get("u");
    if (raw?.startsWith("a1")) {
      const b64 = raw.slice(2).replace(/-/g, "+").replace(/_/g, "/");
      const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
      const decoded = Buffer.from(padded, "base64").toString("utf8");
      if (decoded.startsWith("http")) return decoded;
    }
  } catch {
    /* keep original */
  }
  return href;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export async function searchBing(query: string, year?: number | null): Promise<WebFinding[]> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=12`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`Bing search failed (${res.status})`);
  const html = await res.text();
  const blocks = [...html.matchAll(/<li class="b_algo"[\s\S]*?<\/li>/g)].map((m) => m[0]);
  const findings: WebFinding[] = [];

  for (const block of blocks) {
    const titleMatch = block.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;
    const href = decodeBingHref(titleMatch[1].replace(/&amp;/g, "&"));
    const title = decodeEntities(titleMatch[2]);
    const snippetMatch =
      block.match(/class="b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
      block.match(/class="b_caption"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
    const snippet = decodeEntities(snippetMatch?.[1] ?? "");
    const publishedAt = extractDateMs(`${title} ${snippet}`);
    findings.push({
      title,
      url: href,
      snippet,
      source: hostnameOf(href),
      publishedAt,
      prices: extractPrices(`${title} ${snippet}`, year),
      inWindow: false,
    });
  }
  return findings;
}

export async function searchNews(query: string, year?: number | null): Promise<WebFinding[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, Accept: "application/rss+xml, application/xml, text/xml" },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`News search failed (${res.status})`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const findings: WebFinding[] = [];

  for (const item of items) {
    const title = decodeEntities(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const link = decodeEntities(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "");
    const desc = decodeEntities(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "");
    const pub = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
    const publishedAt = pub ? Date.parse(pub) : extractDateMs(`${title} ${desc}`);
    if (!title) continue;
    findings.push({
      title,
      url: link,
      snippet: stripHtml(desc).slice(0, 280),
      source: hostnameOf(link) || "Google News",
      publishedAt: Number.isFinite(publishedAt) ? publishedAt : null,
      prices: extractPrices(`${title} ${desc}`, year),
      inWindow: false,
    });
  }
  return findings;
}

export async function fetchWikipedia(title: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CoinDateValue/1.0 (coin value lookup)",
      "Api-User-Agent": "CoinDateValue/1.0 (coin value lookup)",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    title?: string;
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
    thumbnail?: { source?: string };
  };
  if (!data.extract) return null;
  return {
    title: data.title ?? title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${title}`,
    thumbnail: data.thumbnail?.source,
  };
}

export async function fetchPageText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    return stripHtml(html).slice(0, 20_000);
  } catch {
    return null;
  }
}

export function markWindow(findings: WebFinding[], start: number, end: number): WebFinding[] {
  return findings.map((finding) => ({
    ...finding,
    inWindow: finding.publishedAt != null && finding.publishedAt >= start && finding.publishedAt <= end,
  }));
}

export function dedupeFindings(findings: WebFinding[]): WebFinding[] {
  const seen = new Set<string>();
  const out: WebFinding[] = [];
  for (const finding of findings) {
    const key = `${finding.source}|${finding.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(finding);
  }
  return out;
}
