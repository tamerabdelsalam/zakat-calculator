"use client";

import { useEffect, useRef } from "react";
import { Banknote, Plus, Trash2 } from "lucide-react";

import { CurrencySelect } from "@/components/shared/currency-select";
import { useSnapshotRates } from "@/components/shared/use-snapshot-rates";
import { formatCurrency } from "@/lib/formatters";
import { convertAmount } from "@/lib/prices/convert";
import { cashEntrySchema } from "@/lib/schemas";
import { CURRENCY_LABELS } from "@/lib/zakat/constants";
import type { CashEntry } from "@/lib/zakat/types";
import { cn } from "@/lib/utils";

import { useWizard } from "./wizard-context";

function createEmptyCashEntry(defaultCurrency: string): CashEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: 0,
    currency: defaultCurrency,
  };
}

function rowCurrency(entry: CashEntry, primary: string): string {
  return entry.currency ?? primary;
}

function isDraftEntry(entry: CashEntry): boolean {
  return entry.label.trim() === "" && entry.amount <= 0;
}

function entryFieldErrors(entry: CashEntry): { label?: string; amount?: string } {
  if (isDraftEntry(entry)) return {};
  const result = cashEntrySchema.safeParse(entry);
  if (result.success) return {};
  const errors: { label?: string; amount?: string } = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "label" || field === "amount") {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function CashStep() {
  const { state, dispatch } = useWizard();
  const firstRef = useRef<HTMLInputElement>(null);
  const ratesState = useSnapshotRates();

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const entries = state.assets.cash;
  const primary = state.currency;
  const allowed = state.currencies;
  const multi = allowed.length > 1;

  function updateCash(next: CashEntry[]) {
    dispatch({
      type: "SET_ASSETS",
      assets: { ...state.assets, cash: next },
    });
  }

  function updateEntry(id: string, patch: Partial<CashEntry>) {
    updateCash(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    updateCash(entries.filter((e) => e.id !== id));
  }

  function addEntry() {
    updateCash([...entries, createEmptyCashEntry(primary)]);
  }

  const validEntries = entries.filter(
    (e) => !isDraftEntry(e) && cashEntrySchema.safeParse(e).success,
  );

  const subtotal = validEntries.reduce((sum, e) => {
    const code = rowCurrency(e, primary);
    if (code === primary) return sum + e.amount;
    if (ratesState.status !== "ok") return sum;
    try {
      return sum + convertAmount(e.amount, code, primary, ratesState.rates);
    } catch {
      return sum;
    }
  }, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <Banknote className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          أدخل النقد في متناول يدك والأرصدة البنكية الزكوية — حسابات جارية،
          توفير، وودائع قابلة للسحب.{" "}
          {multi ? (
            <>
              اختر عملة كل سطر؛ يُحسب المجموع بالعملة الرئيسية (
              <span className="font-medium text-foreground">
                {CURRENCY_LABELS[primary] ?? primary}
              </span>
              ).
            </>
          ) : (
            <>
              جميع المبالغ بـ{" "}
              <span className="font-medium text-foreground">
                {CURRENCY_LABELS[primary] ?? primary}
              </span>
              .
            </>
          )}
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد إدخالات — أضف رصيداً نقدياً أو حساباً بنكياً.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="قائمة النقد والأرصدة">
          {entries.map((entry, idx) => {
            const errors = entryFieldErrors(entry);
            const code = rowCurrency(entry, primary);
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
                  <label htmlFor={`cash-label-${entry.id}`} className="text-sm font-medium">
                    الوصف
                  </label>
                  <input
                    ref={idx === 0 ? firstRef : undefined}
                    id={`cash-label-${entry.id}`}
                    type="text"
                    value={entry.label}
                    onChange={(e) => updateEntry(entry.id, { label: e.target.value })}
                    placeholder="مثال: حساب توفير — البنك الأهلي"
                    className={cn(
                      "w-full rounded-md border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      errors.label ? "border-destructive" : "border-input",
                    )}
                  />
                  {errors.label && (
                    <p className="text-xs text-destructive">{errors.label}</p>
                  )}
                </div>

                <div className={cn("grid gap-3", multi && "sm:grid-cols-2")}>
                  <div className="space-y-1.5">
                    <label htmlFor={`cash-amount-${entry.id}`} className="text-sm font-medium">
                      المبلغ ({code})
                    </label>
                    <input
                      id={`cash-amount-${entry.id}`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={entry.amount > 0 ? entry.amount : ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const amount = raw === "" ? 0 : Number.parseFloat(raw);
                        updateEntry(entry.id, {
                          amount: Number.isFinite(amount) ? amount : 0,
                        });
                      }}
                      placeholder="0.00"
                      className={cn(
                        "w-full rounded-md border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        errors.amount ? "border-destructive" : "border-input",
                      )}
                    />
                    {errors.amount && (
                      <p className="text-xs text-destructive">{errors.amount}</p>
                    )}
                  </div>

                  {multi && (
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium">العملة</span>
                      <CurrencySelect
                        value={code}
                        allowedCurrencies={allowed}
                        onChange={(next) => updateEntry(entry.id, { currency: next })}
                        aria-label={`عملة الإدخال ${idx + 1}`}
                      />
                    </div>
                  )}
                </div>

                {multi &&
                  code !== primary &&
                  entry.amount > 0 &&
                  ratesState.status === "ok" && (
                    <p className="text-xs text-muted-foreground">
                      ≈{" "}
                      {formatCurrency(
                        convertAmount(entry.amount, code, primary, ratesState.rates),
                        primary,
                      )}{" "}
                      بالعملة الرئيسية
                    </p>
                  )}
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
          <span className="text-muted-foreground">مجموع النقد والأرصدة</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(subtotal, primary)}
          </span>
        </div>
      )}
    </div>
  );
}
