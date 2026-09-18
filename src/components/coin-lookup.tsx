"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircleIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ExternalLinkIcon,
  Loader2Icon,
  MinusIcon,
  SearchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ValueChart } from "@/components/value-chart";
import { COIN_TYPES, EXAMPLE_LOOKUPS, suggestCoins } from "@/lib/coins";
import { currentYear, formatLongDate, formatPct, formatUsd } from "@/lib/format";
import type { LookupResult } from "@/lib/types";

const MINTS = [
  { value: "any", label: "Any mint" },
  { value: "P", label: "P · Philadelphia" },
  { value: "D", label: "D · Denver" },
  { value: "S", label: "S · San Francisco" },
  { value: "O", label: "O · New Orleans" },
  { value: "CC", label: "CC · Carson City" },
  { value: "W", label: "W · West Point" },
];

export function CoinLookup() {
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [mint, setMint] = useState("any");
  const [openSuggest, setOpenSuggest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const suggestions = useMemo(() => suggestCoins(type, 7), [type]);
  const yearNum = year ? Number(year) : NaN;
  const yearValid =
    !year || (Number.isInteger(yearNum) && yearNum >= 1600 && yearNum <= currentYear() + 1);

  async function runLookup(nextType = type, nextYear = year, nextMint = mint) {
    const trimmed = nextType.trim();
    if (!trimmed) {
      setError("Enter a coin type — for example Kennedy Half Dollar.");
      return;
    }
    const parsedYear = nextYear ? Number(nextYear) : undefined;
    if (
      parsedYear != null &&
      (!Number.isInteger(parsedYear) || parsedYear < 1600 || parsedYear > currentYear() + 1)
    ) {
      setError("Use a four-digit date for the coin, such as 1964.");
      return;
    }

    setLoading(true);
    setError(null);
    setOpenSuggest(false);

    const params = new URLSearchParams({ type: trimmed });
    if (parsedYear) params.set("year", String(parsedYear));
    if (nextMint && nextMint !== "any") params.set("mint", nextMint);

    try {
      const res = await fetch(`/api/lookup?${params.toString()}`);
      const data = (await res.json()) as LookupResult & { error?: string };
      if (!res.ok) {
        setResult(null);
        setError(data.error ?? "Lookup failed.");
        return;
      }
      setResult(data);
    } catch {
      setResult(null);
      setError("Could not reach the lookup service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <form
        className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void runLookup();
        }}
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_8rem_minmax(0,0.9fr)_auto] md:items-end">
          <label className="relative block space-y-1.5">
            <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Coin type
            </span>
            <Input
              value={type}
              placeholder="Kennedy Half Dollar, Morgan Dollar, Bitcoin…"
              autoComplete="off"
              className="h-11 bg-background text-base"
              onFocus={() => setOpenSuggest(true)}
              onBlur={() => {
                window.setTimeout(() => setOpenSuggest(false), 120);
              }}
              onChange={(event) => {
                setType(event.target.value);
                setOpenSuggest(true);
              }}
            />
            {openSuggest && suggestions.length > 0 ? (
              <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
                {suggestions.map((coin) => (
                  <li key={coin.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setType(coin.name);
                        if (!year && coin.years) {
                          setYear(String(Math.min(coin.years.end, currentYear())));
                        }
                        setOpenSuggest(false);
                      }}
                    >
                      <span>{coin.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {coin.kind === "crypto"
                          ? "Crypto"
                          : coin.years
                            ? `${coin.years.start}–${coin.years.end}`
                            : "Collectible"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Date
            </span>
            <Input
              inputMode="numeric"
              value={year}
              placeholder="1964"
              className="h-11 bg-background"
              aria-invalid={!yearValid}
              onChange={(event) => setYear(event.target.value.replace(/[^\d]/g, "").slice(0, 4))}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Mint
            </span>
            <Select value={mint} onValueChange={(value) => setMint(value ?? "any")}>
              <SelectTrigger className="h-11 w-full min-w-0 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MINTS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Button type="submit" size="lg" className="h-11 px-5" disabled={loading}>
            {loading ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
            Search last 2 months
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Type plus date identifies the coin. We then search public web results, news,
          and live metal or market data for the past 60 days.
        </p>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_LOOKUPS.map((example) => (
          <Button
            key={`${example.type}-${example.year}`}
            type="button"
            variant="outline"
            size="sm"
            className="bg-background/70"
            onClick={() => {
              setType(example.type);
              setYear(String(example.year));
              void runLookup(example.type, String(example.year), "any");
            }}
          >
            {example.year} {example.type}
          </Button>
        ))}
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? <LoadingState /> : null}

      {!loading && !result && !error ? <EmptyState /> : null}

      {result && !loading ? <Results result={result} /> : null}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed bg-card/60">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Look up a dated coin</CardTitle>
        <CardDescription>
          Search a type and mint year to see what the market has been paying over the
          last two months — melt value, listings, and news that actually quote a price.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {COIN_TYPES.filter((coin) => coin.kind === "collectible")
          .slice(0, 6)
          .map((coin) => (
            <div key={coin.id} className="rounded-xl bg-muted/50 px-3 py-3">
              <p className="font-medium">{coin.name}</p>
              <p className="text-sm text-muted-foreground">
                {coin.years?.start}–{coin.years?.end} · {coin.denomination}
              </p>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

function Results({ result }: { result: LookupResult }) {
  const change = result.summary.changePct;
  const TrendIcon =
    change == null || Math.abs(change) < 0.15
      ? MinusIcon
      : change > 0
        ? ArrowUpRightIcon
        : ArrowDownRightIcon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {result.kind === "crypto" ? "Crypto" : "Collectible"}
            </Badge>
            {result.query.year ? <Badge variant="outline">{result.query.year}</Badge> : null}
            {result.query.mint ? <Badge variant="outline">{result.query.mint}</Badge> : null}
            <span className="text-xs text-muted-foreground">
              Searched {formatLongDate(result.searchedAt)}
            </span>
          </div>
          <CardTitle className="font-heading text-3xl tracking-tight sm:text-4xl">
            {result.query.displayName}
          </CardTitle>
          <CardDescription className="text-base text-foreground/80">
            {result.summary.headline}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Estimated value"
            value={result.summary.estimatedValue != null ? formatUsd(result.summary.estimatedValue) : "—"}
          />
          <Stat
            label="2-month range"
            value={
              result.summary.low != null && result.summary.high != null
                ? `${formatUsd(result.summary.low)} – ${formatUsd(result.summary.high)}`
                : "—"
            }
          />
          <Stat
            label="Last 2 months"
            value={result.summary.changePct != null ? formatPct(result.summary.changePct) : "—"}
            icon={<TrendIcon className="size-4" />}
          />
        </CardContent>
        <p className="px-(--card-spacing) pb-4 text-sm text-muted-foreground">
          {result.summary.basis}. This is a public-source estimate, not a formal appraisal.
        </p>
      </Card>

      {result.warnings.length ? (
        <div className="space-y-2">
          {result.warnings.map((warning) => (
            <p
              key={warning}
              className="flex gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
            >
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Value over the last 2 months</CardTitle>
          <CardDescription>
            {result.kind === "crypto"
              ? "Daily market close in US dollars."
              : "Melt or spot-linked value when the coin has precious metal, plus web-quoted prices."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ValueChart data={result.series} label={result.seriesLabel} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Web findings</CardTitle>
            <CardDescription>
              Public pages and news that mention this coin, with dollar amounts pulled from the copy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {result.findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No priced web results came back. Try a more specific type, or a different year.
              </p>
            ) : (
              result.findings.map((finding, index) => (
                <div key={`${finding.url}-${index}`}>
                  {index > 0 ? <Separator className="my-3" /> : null}
                  <a
                    href={finding.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium group-hover:underline">{finding.title}</p>
                      <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{finding.source}</span>
                      {finding.publishedAt ? <span>{formatLongDate(finding.publishedAt)}</span> : null}
                      {finding.inWindow ? <Badge variant="secondary">Last 2 months</Badge> : null}
                    </div>
                    {finding.snippet ? (
                      <p className="text-sm text-muted-foreground">{finding.snippet}</p>
                    ) : null}
                    {finding.prices.length ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {finding.prices.slice(0, 6).map((price) => (
                          <Badge key={`${finding.url}-${price}`} variant="outline">
                            {formatUsd(price)}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {result.melt ? (
            <Card>
              <CardHeader>
                <CardTitle>Melt value</CardTitle>
                <CardDescription>
                  {result.melt.metal ? `${capitalize(result.melt.metal)} content` : "Intrinsic metal"}
                  {result.melt.oz != null ? ` · ${result.melt.oz} oz / lb equivalent` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Spot" value={result.melt.spot != null ? `${formatUsd(result.melt.spot)} ${result.melt.spotUnit ?? ""}` : "—"} />
                <Row label="Now" value={result.melt.current != null ? formatUsd(result.melt.current) : "—"} />
                <Row
                  label="60 days ago"
                  value={result.melt.start != null ? formatUsd(result.melt.start) : "—"}
                />
                <Row
                  label="Change"
                  value={result.melt.changePct != null ? formatPct(result.melt.changePct) : "—"}
                />
              </CardContent>
            </Card>
          ) : null}

          {result.highlights.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Auction & rarity mentions</CardTitle>
                <CardDescription>
                  Outlier prices from the same search — usually errors, high grade, or records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.highlights.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm hover:underline"
                  >
                    {item.title}
                  </a>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {result.wikipedia ? (
            <Card>
              <CardHeader>
                <CardTitle>{result.wikipedia.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.wikipedia.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.wikipedia.thumbnail}
                    alt=""
                    className="h-28 w-28 rounded-full object-cover ring-1 ring-foreground/10"
                  />
                ) : null}
                <p className="text-sm leading-6 text-muted-foreground">{result.wikipedia.extract}</p>
                <a
                  href={result.wikipedia.url}
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Wikipedia <ExternalLinkIcon className="size-3.5" />
                </a>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-3">
      <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 font-heading text-2xl">{icon}{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
