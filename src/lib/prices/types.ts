/**
 * @remarks Field names `pricePerGramUSD` / `pricePerOunceUSD` are legacy: values are in
 * {@link PriceData.nisab.currency} (local quote currency) after snapshot build.
 */
export interface MetalPrices {
  gold: {
    pricePerGramUSD: number;
    pricePerOunceUSD: number;
    updatedAt: string;
  };
  silver: {
    pricePerGramUSD: number;
    pricePerOunceUSD: number;
    updatedAt: string;
  };
}

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
}

export interface PriceData {
  /** YYYY-MM-DD (UTC) — trading-day label for the snapshot, shown as "آخر تحديث" date in UI. */
  benchmarkDate: string;
  metals: MetalPrices;
  currencies: CurrencyRates;
  nisab: {
    goldNisab: number;
    silverNisab: number;
    currency: string;
  };
  /** When the running server read the snapshot (ISO). */
  fetchedAt: string;
}

export const PRICE_SNAPSHOT_VERSION = 1 as const;

export interface PriceSnapshotFile {
  version: typeof PRICE_SNAPSHOT_VERSION;
  benchmarkDate: string;
  refreshedAt: string;
  byCurrency: Record<string, PriceData>;
}

export type PriceFetchErrorCode =
  | "PRICES_UNAVAILABLE"
  | "PRICES_INVALID"
  | "CURRENCY_UNSUPPORTED"
  | "SNAPSHOT_MISSING";

export class PriceFetchError extends Error {
  constructor(
    public readonly code: PriceFetchErrorCode,
    public readonly messageAr: string,
  ) {
    super(messageAr);
    this.name = "PriceFetchError";
  }
}
