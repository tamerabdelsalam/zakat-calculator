/**
 * Dev/CI: writes data/price-snapshot.json with deterministic placeholder spot prices
 * (no external APIs). Used so the app and tests have a valid snapshot without keys.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildPriceDataForCurrency } from "../src/lib/prices/build-snapshot";
import { SUPPORTED_CURRENCIES } from "../src/lib/prices/constants";
import { getSnapshotFilePath } from "../src/lib/prices/snapshot";
import type { PriceSnapshotFile } from "../src/lib/prices/types";

const GOLD_USD_OZ = 3_200;
const SILVER_USD_OZ = 32;
const TS = Math.floor(new Date("2026-04-27T00:00:00Z").getTime() / 1000);
const BENCHMARK = "2026-04-27";
/** Illustrative: units of each currency per 1 USD (dev seed only; live job uses the API). */
const RATES: Record<string, number> = {
  USD: 1,
  EGP: 48.2,
  SAR: 3.75,
  AED: 3.67,
  KWD: 0.31,
  QAR: 3.64,
  BHD: 0.376,
  OMR: 0.384,
  JOD: 0.71,
  EUR: 0.92,
  GBP: 0.79,
  TRY: 38,
  PKR: 280,
  IDR: 16200,
  INR: 85,
  MYR: 4.5,
};

async function main(): Promise<void> {
  const exAt = "2026-04-27T00:00:00.000Z";
  const byCurrency: PriceSnapshotFile["byCurrency"] = {};
  for (const cur of SUPPORTED_CURRENCIES) {
    const c = cur.toUpperCase();
    const r = RATES[c];
    if (r === undefined) throw new Error(`No rate for ${c}`);
    byCurrency[c] = buildPriceDataForCurrency(
      c,
      r,
      GOLD_USD_OZ,
      SILVER_USD_OZ,
      TS,
      TS,
      BENCHMARK,
      { base: "USD", rates: RATES, updatedAt: exAt },
    );
  }
  const file: PriceSnapshotFile = {
    version: 1,
    benchmarkDate: BENCHMARK,
    refreshedAt: exAt,
    byCurrency,
  };
  const out = getSnapshotFilePath();
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(file, null, 2) + "\n", "utf-8");
  console.log("Wrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
