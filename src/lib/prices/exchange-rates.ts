import { PriceFetchError } from "./types";

const EXCHANGE_BASE = "https://v6.exchangerate-api.com/v6";

export interface LatestUsdRatesResult {
  /** 1 USD = `rates[CCY]` units of each currency. */
  rates: Record<string, number>;
  updatedAt: string;
}

/**
 * Fetches latest conversion rates with base USD (pairing: units of each currency per 1 USD).
 * https://www.exchangerate-api.com/docs/requests
 */
export async function fetchLatestUsdRates(
  exchangeApiKey: string,
  signal?: AbortSignal,
): Promise<LatestUsdRatesResult> {
  if (!exchangeApiKey) {
    throw new PriceFetchError("PRICES_UNAVAILABLE", "مفتاح ExchangeRate-API مفقود.");
  }

  const url = `${EXCHANGE_BASE}/${encodeURIComponent(exchangeApiKey)}/latest/USD`;
  const res = await fetch(url, { signal: signal ?? AbortSignal.timeout(12_000) });

  if (!res.ok) {
    throw new PriceFetchError(
      "PRICES_UNAVAILABLE",
      "تعذر جلب أسعار الصرف من مزوّد البيانات.",
    );
  }

  const body: unknown = await res.json();
  if (!isV6Success(body)) {
    const msg = typeof body === "object" && body && "error-type" in body
      ? String((body as { "error-type"?: string })["error-type"])
      : "invalid";
    throw new PriceFetchError(
      "PRICES_INVALID",
      `رد غير صالح من مزوّد أسعار الصرف: ${msg}`,
    );
  }

  return {
    rates: { USD: 1, ...body.conversion_rates },
    updatedAt: new Date().toISOString(),
  };
}

type V6LatestResponse = { result: string; conversion_rates: Record<string, number> };

function isV6Success(x: unknown): x is V6LatestResponse {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  if (o.result !== "success") return false;
  if (typeof o.conversion_rates !== "object" || o.conversion_rates === null) {
    return false;
  }
  return !Array.isArray(o.conversion_rates);
}
