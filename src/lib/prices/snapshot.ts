import { readFile } from "node:fs/promises";
import path from "node:path";

import { PRICE_SNAPSHOT_BASENAME } from "./constants";
import { parsePriceSnapshotFile } from "./build-snapshot";
import { PriceFetchError, type PriceData, type PriceSnapshotFile } from "./types";

export function getSnapshotFilePath(
  rootDir: string = process.cwd(),
  basename: string = PRICE_SNAPSHOT_BASENAME,
): string {
  return path.join(rootDir, "data", basename);
}

/**
 * Read and parse the committed `data/price-snapshot.json`.
 */
export async function readPriceSnapshot(
  rootDir: string = process.cwd(),
): Promise<PriceSnapshotFile> {
  const p = getSnapshotFilePath(rootDir, PRICE_SNAPSHOT_BASENAME);
  let raw: string;
  try {
    raw = await readFile(p, "utf-8");
  } catch {
    throw new PriceFetchError(
      "SNAPSHOT_MISSING",
      "لا توجد لقطة أسعار مُعدّة. يجب توليد الملف (انظر docs أو أمر prices:build).",
    );
  }
  try {
    return parsePriceSnapshotFile(raw);
  } catch {
    throw new PriceFetchError("PRICES_INVALID", "ملف لقطة الأسعار تالف أو غير صالح.");
  }
}

/**
 * Resolves a single currency from a snapshot, or throws {@link PriceFetchError}.
 */
export function pickPriceData(
  file: PriceSnapshotFile,
  currency: string,
): PriceData {
  const c = currency.toUpperCase();
  const entry = file.byCurrency[c];
  if (!entry) {
    throw new PriceFetchError(
      "CURRENCY_UNSUPPORTED",
      `العملة "${c}" غير مدعومة في لقطة الأسعار الحالية.`,
    );
  }
  return { ...entry, fetchedAt: new Date().toISOString() };
}
