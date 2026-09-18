import { CoinLookup } from "@/components/coin-lookup";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.09_80/0.28),transparent_70%)]" />
        <div className="absolute top-64 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.06_55/0.12),transparent_70%)]" />
      </div>

      <header className="relative z-10 border-b border-border/70 bg-card/50 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
                <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="16" cy="16" r="8.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
                <path
                  d="M13 20.5c1.6 1.4 4.4 1.4 6 0M16 10.5v7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <p className="font-heading text-lg leading-none">Coin Date Value</p>
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Type · Date · Two months
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 max-w-2xl space-y-4">
          <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
            Collector & market lookup
          </p>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            What is this coin worth right now — and what was it worth last month?
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Enter a coin type and its date. We search the public web, recent articles, and
            live metal or market prices to estimate value across the last two months.
          </p>
        </div>
        <CoinLookup />
      </main>

      <footer className="relative z-10 mt-auto border-t border-border/70 px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        Public-source estimates only. Melt value tracks live silver, gold, or copper; collector
        premiums come from web listings and news. Not an appraisal or an offer to buy.
      </footer>
    </div>
  );
}
