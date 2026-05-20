export const TROY_OUNCE_TO_GRAMS = 31.1035;

export const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || "SAR";

/** File committed by GitHub Actions (see .github/workflows/refresh-prices.yml). */
export const PRICE_SNAPSHOT_BASENAME = "price-snapshot.json";

/**
 * Currencies for which we precompute nisab in the daily snapshot.
 * Two GoldAPI calls (XAU+USD, XAG+USD) + ExchangeRate-API, then all rows derived.
 * Priority international + South Asia: EUR, GBP, TRY, PKR, IDR, INR, MYR, CNY.
 */
export const SUPPORTED_CURRENCIES: readonly string[] = [
  "USD",
  "EGP",
  "SAR",
  "AED",
  "KWD",
  "QAR",
  "BHD",
  "OMR",
  "JOD",
  "EUR",
  "GBP",
  "TRY",
  "PKR",
  "IDR",
  "INR",
  "MYR",
  "CNY",
] as const;

export const GOLD_API_BASE = "https://www.goldapi.io/api";

/** Basic sanity for GoldAPI responses (XAU/USD, XAG/USD), per troy ounce in USD. */
export const GOLD_OZ_USD_SANITY = { min: 800, max: 6_000 } as const;
export const SILVER_OZ_USD_SANITY = { min: 5, max: 200 } as const;
