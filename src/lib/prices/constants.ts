export const TROY_OUNCE_TO_GRAMS = 31.1035;

export const PRICE_CACHE_TTL_MS =
  (Number(process.env.PRICE_CACHE_TTL) || 86400) * 1000;

export const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || "SAR";

/**
 * Hardcoded fallback prices (approximate, for when APIs are unavailable).
 * Updated: March 2026. Replace with real data ASAP.
 */
export const FALLBACK_PRICES = {
  goldPerOunceUSD: 3050,
  silverPerOunceUSD: 34,
  usdToEGP: 50.5,
};
