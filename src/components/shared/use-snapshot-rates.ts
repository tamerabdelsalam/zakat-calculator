"use client";

import { useEffect, useState } from "react";

import type { PriceData } from "@/lib/prices/types";

type State =
  | { status: "loading" }
  | { status: "ok"; rates: Record<string, number>; fetchedAt: string }
  | { status: "error"; message: string };

/**
 * Fetches `/api/prices?currency=USD` once and exposes the full exchange-rate
 * table (`rates`) for use in per-line currency conversion.
 *
 * Usage in asset entry forms (Phase 4.3):
 *   const { rates } = useSnapshotRates();
 *   const local = convertAmount(usdAmount, "USD", mainCurrency, rates);
 *
 * Uses USD as the base so the rate table is identical to
 * `snapshot.byCurrency.USD.currencies.rates` — the same object `convertAmount`
 * expects.
 */
export function useSnapshotRates(): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/prices?currency=USD")
      .then(async (res) => {
        const body: unknown = await res.json();
        if (!res.ok) {
          const msg =
            typeof body === "object" && body && "error" in body
              ? String((body as { error: string }).error)
              : "تعذّر جلب أسعار الصرف";
          return Promise.reject(new Error(msg));
        }
        return body as PriceData;
      })
      .then((data) => {
        if (!cancelled) {
          setState({
            status: "ok",
            rates: data.currencies.rates,
            fetchedAt: data.fetchedAt,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "تعذّر جلب أسعار الصرف",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
