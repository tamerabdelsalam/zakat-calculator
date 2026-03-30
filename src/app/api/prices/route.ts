import { NextResponse } from "next/server";
import { fetchPrices } from "@/lib/prices/fetcher";

export const revalidate = 86400; // 24 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get("currency") ?? undefined;

  try {
    const data = await fetchPrices(currency);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "فشل في جلب الأسعار" },
      { status: 500 },
    );
  }
}
