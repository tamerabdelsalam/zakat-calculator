import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "./constants";
import { pickPriceData, readPriceSnapshot } from "./snapshot";
import { PriceFetchError, type PriceData } from "./types";

/**
 * Returns price + nisab for `currency` from the committed daily snapshot
 * `data/price-snapshot.json` (produced by `npm run prices:build` / GitHub Actions).
 * Never uses hardcoded spot prices. Fail closed if snapshot or currency is missing.
 */
export async function fetchPrices(
  currency: string = DEFAULT_CURRENCY,
): Promise<PriceData> {
  const c = normCurrency(currency);
  if (!SUPPORTED_CURRENCIES.includes(c)) {
    throw new PriceFetchError(
      "CURRENCY_UNSUPPORTED",
      `العملة "${c}" غير مدعومة.`,
    );
  }
  const snap = await readPriceSnapshot();
  return pickPriceData(snap, c);
}

function normCurrency(c: string): string {
  return c.trim().toUpperCase() || "USD";
}
