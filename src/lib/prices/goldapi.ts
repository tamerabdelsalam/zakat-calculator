import {
  GOLD_API_BASE,
  GOLD_OZ_USD_SANITY,
  SILVER_OZ_USD_SANITY,
} from "./constants";
import { PriceFetchError } from "./types";

export interface GoldApiMetalUsdResult {
  pricePerOunceUSD: number;
  /** GoldAPI unix seconds */
  timestamp: number;
}

/**
 * Fetches XAU/USD or XAG/USD (price per troy oz in US dollars) from goldapi.io.
 */
export async function fetchMetalUsd(
  metal: "XAU" | "XAG",
  goldApiKey: string,
  signal?: AbortSignal,
): Promise<GoldApiMetalUsdResult> {
  if (!goldApiKey) {
    throw new PriceFetchError("PRICES_UNAVAILABLE", "مفتاح GoldAPI مفقود.");
  }

  const url = `${GOLD_API_BASE}/${metal}/USD`;
  const res = await fetch(url, {
    signal: signal ?? AbortSignal.timeout(12_000),
    headers: { "x-access-token": goldApiKey },
  });

  if (!res.ok) {
    throw new PriceFetchError(
      "PRICES_UNAVAILABLE",
      "تعذر جلب سعر المعدن من مزوّد الأسعار.",
    );
  }

  const body: unknown = await res.json();
  if (!isGoldApiResponse(body)) {
    throw new PriceFetchError("PRICES_INVALID", "رد غير صالح من مزوّد أسعار الذهب.");
  }

  if (!Number.isFinite(body.price) || body.price <= 0) {
    throw new PriceFetchError("PRICES_INVALID", "سعر المعدن غير صالح.");
  }

  const { min, max } = metal === "XAU" ? GOLD_OZ_USD_SANITY : SILVER_OZ_USD_SANITY;
  if (body.price < min || body.price > max) {
    throw new PriceFetchError("PRICES_INVALID", "سعر المعدن خارج المدى المسموح للتحقق.");
  }

  return { pricePerOunceUSD: body.price, timestamp: body.timestamp };
}

type GoldApiResponse = { price: number; timestamp: number };

function isGoldApiResponse(x: unknown): x is GoldApiResponse {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.price === "number" &&
    typeof o.timestamp === "number" &&
    Number.isFinite(o.price) &&
    Number.isFinite(o.timestamp)
  );
}
