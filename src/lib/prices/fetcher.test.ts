import { writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildPriceDataForCurrency, parsePriceSnapshotFile } from "./build-snapshot";
import { fetchPrices } from "./fetcher";
import { getSnapshotFilePath, readPriceSnapshot, pickPriceData } from "./snapshot";
import type { PriceSnapshotFile } from "./types";

const TEST_ROOT = path.join(process.cwd(), "data", "vitest-snapshot-temp");

function miniSnapshot(): PriceSnapshotFile {
  const b = "2026-04-27";
  const e = { base: "USD" as const, rates: { USD: 1, EGP: 50 } as Record<string, number>, updatedAt: b };
  return {
    version: 1,
    benchmarkDate: b,
    refreshedAt: b,
    byCurrency: {
      USD: buildPriceDataForCurrency("USD", 1, 3_200, 32, 1_700_000_000, 1_700_000_000, b, e),
      EGP: buildPriceDataForCurrency("EGP", 50, 3_200, 32, 1_700_000_000, 1_700_000_000, b, e),
    },
  };
}

beforeEach(async () => {
  await rm(TEST_ROOT, { recursive: true, force: true });
});

afterEach(async () => {
  await rm(TEST_ROOT, { recursive: true, force: true });
});

describe("buildPriceDataForCurrency", () => {
  it("produces nisab values in local currency for USD and EGP", () => {
    const e = { base: "USD", rates: { USD: 1, EGP: 50 }, updatedAt: "t" };
    const b = "2026-01-10";
    const usd = buildPriceDataForCurrency("USD", 1, 3_200, 32, 1_000_000_000, 1_000_000_000, b, e);
    const egp = buildPriceDataForCurrency("EGP", 50, 3_200, 32, 1_000_000_000, 1_000_000_000, b, e);
    expect(usd.nisab.currency).toBe("USD");
    expect(egp.nisab.currency).toBe("EGP");
    expect(egp.nisab.goldNisab / usd.nisab.goldNisab).toBeCloseTo(50, 0);
  });
});

describe("parsePriceSnapshotFile", () => {
  it("rejects invalid JSON", () => {
    expect(() => parsePriceSnapshotFile("{")).toThrow();
  });
});

describe("readPriceSnapshot", () => {
  it("picks a currency and updates fetchedAt", async () => {
    const root = path.join(TEST_ROOT, "a");
    await mkdir(path.join(root, "data"), { recursive: true });
    const p = getSnapshotFilePath(root);
    await writeFile(p, JSON.stringify(miniSnapshot()), "utf-8");
    const snap = await readPriceSnapshot(root);
    const d = pickPriceData(snap, "EGP");
    expect(d.nisab.currency).toBe("EGP");
    expect(d.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("throws for missing file", async () => {
    const root = path.join(TEST_ROOT, "b");
    await mkdir(path.join(root, "data"), { recursive: true });
    // no price-snapshot.json
    await expect(readPriceSnapshot(root)).rejects.toMatchObject({ code: "SNAPSHOT_MISSING" });
  });
});

describe("fetchPrices", () => {
  it("throws CURRENCY_UNSUPPORTED for bad code", async () => {
    await expect(fetchPrices("XXX")).rejects.toMatchObject({ code: "CURRENCY_UNSUPPORTED" });
  });
});
