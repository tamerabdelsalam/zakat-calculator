"use client";

import { useEffect, useState } from "react";
import { AlertCircle, TrendingUp } from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/formatters";
import type { PriceData } from "@/lib/prices/types";

interface PriceBarProps {
  /** ISO 4217 currency code; defaults to EGP. Passed from wizard context once wizard is built. */
  currency?: string;
}

type State =
  | { status: "loading"; currency: string }
  | { status: "ok"; data: PriceData; currency: string }
  | { status: "error"; message: string; currency: string };

export function PriceBar({ currency = "EGP" }: PriceBarProps) {
  const [state, setState] = useState<State>({ status: "loading", currency });

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/prices?currency=${encodeURIComponent(currency)}`)
      .then(async (res) => {
        const body: unknown = await res.json();
        if (!res.ok) {
          const msg =
            typeof body === "object" && body && "error" in body
              ? String((body as { error: string }).error)
              : "تعذّر جلب الأسعار";
          return Promise.reject(new Error(msg));
        }
        return body as PriceData;
      })
      .then((data) => {
        if (!cancelled) setState({ status: "ok", data, currency });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "تعذّر جلب الأسعار",
            currency,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currency]);

  // When the currency prop changes, treat the stale result as loading until the
  // new fetch resolves — no synchronous setState inside the effect needed.
  const isStale = state.currency !== currency;

  if (state.status === "loading" || isStale) {
    return (
      <div
        aria-label="جارٍ تحميل الأسعار"
        className="w-full border-b border-border bg-muted/50 px-4 py-1.5"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-4 overflow-x-auto sm:px-6">
          <div className="h-3.5 w-28 animate-pulse rounded bg-muted-foreground/20" />
          <div className="h-3.5 w-28 animate-pulse rounded bg-muted-foreground/20" />
          <div className="ms-auto h-3 w-20 animate-pulse rounded bg-muted-foreground/15" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className="w-full border-b border-border bg-destructive/5 px-4 py-1.5 text-destructive"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 sm:px-6">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="text-xs">{state.message}</span>
        </div>
      </div>
    );
  }

  const { data } = state;
  // Field names are legacy ("USD") but values are already in the requested local currency
  const goldPerGram = data.metals.gold.pricePerGramUSD;
  const silverPerGram = data.metals.silver.pricePerGramUSD;
  const ccy = data.nisab.currency;
  const updatedAt = new Date(data.metals.gold.updatedAt);

  return (
    <div
      aria-label="شريط أسعار المعادن"
      className="w-full border-b border-border bg-muted/50 px-4 py-1.5"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto sm:px-6">
        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />

        <dl className="flex flex-1 items-center gap-4 text-xs">
          <div className="flex items-baseline gap-1 whitespace-nowrap">
            <dt className="text-muted-foreground">ذهب عيار ٢١</dt>
            <dd className="font-medium tabular-nums">
              {formatCurrency(goldPerGram, ccy)} / جرام
            </dd>
          </div>

          <span className="text-border" aria-hidden>
            |
          </span>

          <div className="flex items-baseline gap-1 whitespace-nowrap">
            <dt className="text-muted-foreground">فضة عيار ٩٢٥</dt>
            <dd className="font-medium tabular-nums">
              {formatCurrency(silverPerGram, ccy)} / جرام
            </dd>
          </div>
        </dl>

        <time
          dateTime={data.metals.gold.updatedAt}
          className="ms-auto shrink-0 whitespace-nowrap text-xs text-muted-foreground"
          title={`آخر تحديث: ${data.metals.gold.updatedAt}`}
        >
          {formatDate(updatedAt)}
        </time>
      </div>
    </div>
  );
}
