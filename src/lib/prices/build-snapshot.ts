import { SUPPORTED_CURRENCIES, TROY_OUNCE_TO_GRAMS } from "./constants";
import { fetchLatestUsdRates, type LatestUsdRatesResult } from "./exchange-rates";
import { fetchMetalUsd } from "./goldapi";
import {
  calculateGoldNisab,
  calculateSilverNisab,
  convertSilverPrice,
  gold24KTo21KPrice,
} from "../zakat/nisab";
import {
  type PriceData,
  type PriceSnapshotFile,
  PRICE_SNAPSHOT_VERSION,
} from "./types";

function isoDateUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function metalUpdatedAtFromUnixSec(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Build {@link PriceData} for a quote currency from USD spot and USD→all rates.
 * `localPerUsd` = how many units of `currency` per 1 USD (e.g. EGP per USD).
 */
export function buildPriceDataForCurrency(
  currency: string,
  localPerUsd: number,
  goldUsdPerOz: number,
  silverUsdPerOz: number,
  goldApiTimestampSec: number,
  silverApiTimestampSec: number,
  benchmarkDate: string,
  exchangeBlock: { base: string; rates: Record<string, number>; updatedAt: string },
): PriceData {
  if (!Number.isFinite(localPerUsd) || localPerUsd <= 0) {
    throw new Error(`Invalid localPerUsd for ${currency}`);
  }

  const goldOz = goldUsdPerOz * localPerUsd;
  const silverOz = silverUsdPerOz * localPerUsd;
  const goldPerGram24K = goldOz / TROY_OUNCE_TO_GRAMS;
  const goldPerGram21K = gold24KTo21KPrice(goldPerGram24K);
  const silverPerGram999 = silverOz / TROY_OUNCE_TO_GRAMS;
  const silverPerGram925 = convertSilverPrice(silverPerGram999, "999", "925");

  const gTs = metalUpdatedAtFromUnixSec(goldApiTimestampSec);
  const sTs = metalUpdatedAtFromUnixSec(silverApiTimestampSec);
  const now = new Date().toISOString();

  return {
    benchmarkDate,
    metals: {
      gold: {
        pricePerGramUSD: goldPerGram21K,
        pricePerOunceUSD: goldOz,
        updatedAt: gTs,
      },
      silver: {
        pricePerGramUSD: silverPerGram925,
        pricePerOunceUSD: silverOz,
        updatedAt: sTs,
      },
    },
    currencies: {
      base: "USD",
      rates: { ...exchangeBlock.rates },
      updatedAt: exchangeBlock.updatedAt,
    },
    nisab: {
      goldNisab: calculateGoldNisab(goldPerGram21K),
      silverNisab: calculateSilverNisab(silverPerGram925),
      currency,
    },
    fetchedAt: now,
  };
}

/**
 * Fetches 2 GoldAPI (XAU+USD, XAG+USD) + one ExchangeRate call, then builds all per-currency rows.
 */
export async function buildPriceSnapshotFile(opts: {
  goldApiKey: string;
  exchangeApiKey: string;
  signal?: AbortSignal;
}): Promise<PriceSnapshotFile> {
  const signal = opts.signal;
  const [xau, xag, er] = await Promise.all([
    fetchMetalUsd("XAU", opts.goldApiKey, signal),
    fetchMetalUsd("XAG", opts.goldApiKey, signal),
    fetchLatestUsdRates(opts.exchangeApiKey, signal),
  ]);

  const now = new Date();
  const benchmarkDate = isoDateUtc(now);
  const refreshedAt = now.toISOString();
  const exchangeForRows: LatestUsdRatesResult = er;

  const byCurrency: Record<string, PriceData> = {};
  for (const currency of SUPPORTED_CURRENCIES) {
    const c = currency.toUpperCase();
    const localPerUsd = exchangeForRows.rates[c];
    if (localPerUsd === undefined || !Number.isFinite(localPerUsd) || localPerUsd <= 0) {
      throw new Error(`Missing or invalid rate for ${c}`);
    }
    byCurrency[c] = buildPriceDataForCurrency(
      c,
      localPerUsd,
      xau.pricePerOunceUSD,
      xag.pricePerOunceUSD,
      xau.timestamp,
      xag.timestamp,
      benchmarkDate,
      { base: "USD", rates: exchangeForRows.rates, updatedAt: exchangeForRows.updatedAt },
    );
  }

  return {
    version: PRICE_SNAPSHOT_VERSION,
    benchmarkDate,
    refreshedAt,
    byCurrency,
  };
}

export function parsePriceSnapshotFile(json: string): PriceSnapshotFile {
  const data: unknown = JSON.parse(json);
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid snapshot: not an object");
  }
  const o = data as Record<string, unknown>;
  if (o.version !== 1) throw new Error("Invalid snapshot: version");
  if (typeof o.benchmarkDate !== "string" || !o.benchmarkDate) {
    throw new Error("Invalid snapshot: benchmarkDate");
  }
  if (typeof o.refreshedAt !== "string" || !o.refreshedAt) {
    throw new Error("Invalid snapshot: refreshedAt");
  }
  if (typeof o.byCurrency !== "object" || o.byCurrency === null) {
    throw new Error("Invalid snapshot: byCurrency");
  }
  return data as PriceSnapshotFile;
}
