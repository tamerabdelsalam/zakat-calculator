import { NextResponse } from "next/server";
import { fetchMetalUsdOnDate } from "@/lib/prices/goldapi";
import { readPriceSnapshot } from "@/lib/prices/snapshot";
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, TROY_OUNCE_TO_GRAMS } from "@/lib/prices/constants";
import { PriceFetchError } from "@/lib/prices/types";
import { gold24KTo21KPrice } from "@/lib/zakat/nisab";
import { calculateGoldNisab } from "@/lib/zakat/nisab";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** YYYY-MM-DD pattern */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface HistoricalNisabData {
  /** The date queried (YYYY-MM-DD). */
  date: string;
  currency: string;
  /** Gold price per gram 21K in the requested currency. */
  goldPerGram21K: number;
  /** Nisab threshold in the requested currency (85 g × goldPerGram21K). */
  goldNisab: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const currencyParam = (searchParams.get("currency") ?? DEFAULT_CURRENCY).trim().toUpperCase();

  if (!dateParam || !ISO_DATE_RE.test(dateParam)) {
    return NextResponse.json(
      { error: "يجب تمرير تاريخ صالح بتنسيق YYYY-MM-DD عبر المعامل ?date=", code: "INVALID_DATE" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!SUPPORTED_CURRENCIES.includes(currencyParam)) {
    return NextResponse.json(
      { error: `العملة "${currencyParam}" غير مدعومة.`, code: "CURRENCY_UNSUPPORTED" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const goldApiKey = process.env.GOLD_API_KEY ?? "";

  try {
    // Historical XAU/USD price from GoldAPI
    const xau = await fetchMetalUsdOnDate("XAU", dateParam, goldApiKey);

    // Exchange rates come from the committed snapshot — no extra API call needed
    const snapshot = await readPriceSnapshot();
    const snapshotEntry = snapshot.byCurrency[currencyParam];
    if (!snapshotEntry) {
      return NextResponse.json(
        { error: `العملة "${currencyParam}" غير موجودة في لقطة الأسعار.`, code: "CURRENCY_UNSUPPORTED" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Derive local-per-USD rate from the snapshot (snapshot stores local prices, not raw rates)
    // snapshot metals.gold.pricePerOunceUSD is actually in local currency (field name is legacy)
    const localGoldOzInSnapshot = snapshotEntry.metals.gold.pricePerOunceUSD;
    const snapshotUsdRate = snapshotEntry.currencies.rates[currencyParam];

    // Prefer the explicit rate from the rates table; fall back to deriving from gold prices
    const localPerUsd: number =
      snapshotUsdRate !== undefined && Number.isFinite(snapshotUsdRate) && snapshotUsdRate > 0
        ? snapshotUsdRate
        : localGoldOzInSnapshot / xau.pricePerOunceUSD;

    const goldOzLocal = xau.pricePerOunceUSD * localPerUsd;
    const goldPerGram24K = goldOzLocal / TROY_OUNCE_TO_GRAMS;
    const goldPerGram21K = gold24KTo21KPrice(goldPerGram24K);
    const goldNisab = calculateGoldNisab(goldPerGram21K);

    const data: HistoricalNisabData = {
      date: dateParam,
      currency: currencyParam,
      goldPerGram21K,
      goldNisab,
    };

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
    });
  } catch (e) {
    if (e instanceof PriceFetchError) {
      const status = e.code === "SNAPSHOT_MISSING" || e.code === "PRICES_UNAVAILABLE" ? 503 : 502;
      return NextResponse.json(
        { error: e.messageAr, code: e.code },
        { status, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { error: "خطأ داخلي في جلب الأسعار التاريخية" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
