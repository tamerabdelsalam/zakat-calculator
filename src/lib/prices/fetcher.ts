import type { PriceData } from "./types";
import {
  TROY_OUNCE_TO_GRAMS,
  DEFAULT_CURRENCY,
  FALLBACK_PRICES,
} from "./constants";
import { getCachedPrices, setCachedPrices } from "./cache";
import { calculateGoldNisab, calculateSilverNisab } from "../zakat/nisab";

/**
 * Fetch current price data. Returns cached data if fresh, otherwise
 * fetches from external APIs and caches the result.
 *
 * TODO: Integrate real APIs (GoldAPI, ExchangeRate-API) in Phase 2.
 * For now, returns fallback prices.
 */
export async function fetchPrices(
  currency = DEFAULT_CURRENCY,
): Promise<PriceData> {
  const cached = getCachedPrices();
  if (cached && cached.nisab.currency === currency) {
    return cached;
  }

  const data = buildFallbackPrices(currency);
  setCachedPrices(data);
  return data;
}

function buildFallbackPrices(currency: string): PriceData {
  const rate = currency === "EGP" ? FALLBACK_PRICES.usdToEGP : 1;
  const goldPerGramUSD = FALLBACK_PRICES.goldPerOunceUSD / TROY_OUNCE_TO_GRAMS;
  const silverPerGramUSD =
    FALLBACK_PRICES.silverPerOunceUSD / TROY_OUNCE_TO_GRAMS;

  const goldPerGram21K = goldPerGramUSD * 0.875 * rate;
  const silverPerGram925 = silverPerGramUSD * 0.925 * rate;

  const now = new Date().toISOString();

  return {
    metals: {
      gold: {
        pricePerGramUSD: goldPerGramUSD,
        pricePerOunceUSD: FALLBACK_PRICES.goldPerOunceUSD,
        updatedAt: now,
      },
      silver: {
        pricePerGramUSD: silverPerGramUSD,
        pricePerOunceUSD: FALLBACK_PRICES.silverPerOunceUSD,
        updatedAt: now,
      },
    },
    currencies: {
      base: "USD",
      rates: { EGP: FALLBACK_PRICES.usdToEGP, USD: 1 },
      updatedAt: now,
    },
    nisab: {
      goldNisab: calculateGoldNisab(goldPerGram21K),
      silverNisab: calculateSilverNisab(silverPerGram925),
      currency,
    },
    fetchedAt: now,
  };
}
