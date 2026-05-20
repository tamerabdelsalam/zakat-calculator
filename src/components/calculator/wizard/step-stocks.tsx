"use client";

import { useEffect, useRef } from "react";
import { Plus, Trash2, TrendingUp } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";
import { stockEntrySchema } from "@/lib/schemas";
import { CURRENCY_LABELS } from "@/lib/zakat/constants";
import type { StockEntry } from "@/lib/zakat/types";
import { cn } from "@/lib/utils";

import { useWizard } from "./wizard-context";

function createEmptyStockEntry(): StockEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    marketValue: 0,
  };
}

function isDraftEntry(entry: StockEntry): boolean {
  return entry.label.trim() === "" && entry.marketValue <= 0;
}

function entryFieldErrors(
  entry: StockEntry,
): { label?: string; marketValue?: string } {
  if (isDraftEntry(entry)) return {};
  const result = stockEntrySchema.safeParse(entry);
  if (result.success) return {};
  const errors: { label?: string; marketValue?: string } = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "label" || field === "marketValue") {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function StocksStep() {
  const { state, dispatch } = useWizard();
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const entries = state.assets.stocks;
  const currency = state.currency;

  function updateStocks(next: StockEntry[]) {
    dispatch({
      type: "SET_ASSETS",
      assets: { ...state.assets, stocks: next },
    });
  }

  function updateEntry(id: string, patch: Partial<StockEntry>) {
    updateStocks(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    updateStocks(entries.filter((e) => e.id !== id));
  }

  function addEntry() {
    updateStocks([...entries, createEmptyStockEntry()]);
  }

  const validEntries = entries.filter(
    (e) => !isDraftEntry(e) && stockEntrySchema.safeParse(e).success,
  );

  const subtotal = validEntries.reduce((sum, e) => sum + e.marketValue, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          أدخل قيمة أسهمك وصناديقك الاستثمارية وETFs السوقية — بالقيمة السوقية
          الحالية يوم حساب الزكاة. جميع المبالغ بـ{" "}
          <span className="font-medium text-foreground">
            {CURRENCY_LABELS[currency] ?? currency}
          </span>
          .
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد إدخالات — أضف سهماً أو صندوقاً.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="قائمة الأسهم والصناديق">
          {entries.map((entry, idx) => {
            const errors = entryFieldErrors(entry);
            return (
              <li
                key={entry.id}
                className="space-y-3 rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    إدخال {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    aria-label={`حذف الإدخال ${idx + 1}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`stock-label-${entry.id}`} className="text-sm font-medium">
                    الوصف
                  </label>
                  <input
                    ref={idx === 0 ? firstRef : undefined}
                    id={`stock-label-${entry.id}`}
                    type="text"
                    value={entry.label}
                    onChange={(e) => updateEntry(entry.id, { label: e.target.value })}
                    placeholder="مثال: أسهم أرامكو — محفظة Thndr"
                    className={cn(
                      "w-full rounded-md border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      errors.label ? "border-destructive" : "border-input",
                    )}
                  />
                  {errors.label && (
                    <p className="text-xs text-destructive">{errors.label}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={`stock-value-${entry.id}`}
                    className="text-sm font-medium"
                  >
                    القيمة السوقية ({currency})
                  </label>
                  <input
                    id={`stock-value-${entry.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={entry.marketValue > 0 ? entry.marketValue : ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const marketValue = raw === "" ? 0 : Number.parseFloat(raw);
                      updateEntry(entry.id, {
                        marketValue: Number.isFinite(marketValue) ? marketValue : 0,
                      });
                    }}
                    placeholder="0.00"
                    className={cn(
                      "w-full rounded-md border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      errors.marketValue ? "border-destructive" : "border-input",
                    )}
                  />
                  {errors.marketValue && (
                    <p className="text-xs text-destructive">{errors.marketValue}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={addEntry}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
      >
        <Plus className="h-4 w-4" aria-hidden />
        أضف إدخالاً
      </button>

      {validEntries.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-sm">
          <span className="text-muted-foreground">مجموع الأسهم والصناديق</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(subtotal, currency)}
          </span>
        </div>
      )}
    </div>
  );
}
