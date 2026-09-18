# Coin Date Value

Look up a coin by **type** and **date**, then search public web sources for what it has been worth over the **last two months**.

Enter something like `Kennedy Half Dollar` and `1964`. The app:

- Matches common U.S. and bullion types (and major cryptocurrencies)
- Searches the web and recent news for priced mentions
- Charts 60-day melt value for silver, gold, and copper coins
- Charts 60-day spot prices for crypto

No API keys are required. Results are public-source estimates, not appraisals.

## Run locally

```bash
npm install
npm run dev -- --port 43147
```

Open [http://localhost:43147](http://localhost:43147).

```bash
npm run build
npm start -- --port 43147
```

## How a lookup works

1. **Type + date** identify the coin (optional mint mark: P, D, S, O, CC, W).
2. A catalog match supplies metal content and Wikipedia context when we know the series.
3. Live search pulls Bing web results and Google News for the past ~60 days.
4. Silver/gold/copper coins get a melt-value series from COMEX spot prices.
5. Crypto names fall through to CoinGecko market history.

Try `1964 Kennedy Half Dollar`, `1921 Morgan Silver Dollar`, or `Bitcoin`.
