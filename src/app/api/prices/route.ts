import { NextResponse } from "next/server";
import { fetchPrices } from "@/lib/prices/fetcher";
import { PriceFetchError } from "@/lib/prices/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get("currency") ?? undefined;

  try {
    const data = await fetchPrices(currency);
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    if (e instanceof PriceFetchError) {
      if (e.code === "CURRENCY_UNSUPPORTED") {
        return NextResponse.json(
          { error: e.messageAr, code: e.code },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }
      return NextResponse.json(
        { error: e.messageAr, code: e.code },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { error: "خطأ داخلي في جلب الأسعار" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
