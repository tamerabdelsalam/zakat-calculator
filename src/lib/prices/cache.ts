import type { PriceData } from "./types";
import { PRICE_CACHE_TTL_MS } from "./constants";

let cachedPrices: PriceData | null = null;
let cachedAt = 0;

export function getCachedPrices(): PriceData | null {
  if (!cachedPrices) return null;
  if (Date.now() - cachedAt > PRICE_CACHE_TTL_MS) return null;
  return cachedPrices;
}

export function setCachedPrices(data: PriceData): void {
  cachedPrices = data;
  cachedAt = Date.now();
}

export function invalidateCache(): void {
  cachedPrices = null;
  cachedAt = 0;
}
