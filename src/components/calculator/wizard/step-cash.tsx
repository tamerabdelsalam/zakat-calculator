"use client";

import { useEffect, useRef } from "react";
import { Banknote, Plus, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";
import { cashEntrySchema } from "@/lib/schemas";
import { CURRENCY_LABELS } from "@/lib/zakat/constants";
import type { CashEntry } from "@/lib/zakat/types";
import { cn } from "@/lib/utils";

import { useWizard } from "./wizard-context";

function createEmptyCashEntry(): CashEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: 0,
  };
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

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const entries = state.assets.cash;
  const currency = state.currency;

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
    updateCash([...entries, createEmptyCashEntry()]);
  }

  const validEntries = entries.filter(
    (e) => !isDraftEntry(e) && cashEntrySchema.safeParse(e).success,
  );

  const subtotal = validEntries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <Banknote className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          أدخل النقد في متناول يدك والأرصدة البنكية الزكوية — حسابات جارية،
          توفير، وودائع قابلة للسحب. جميع المبالغ بـ{" "}
          <span className="font-medium text-foreground">
            {CURRENCY_LABELS[currency] ?? currency}
          </span>
          .
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

                <div className="space-y-1.5">
                  <label htmlFor={`cash-amount-${entry.id}`} className="text-sm font-medium">
                    المبلغ ({currency})
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
            {formatCurrency(subtotal, currency)}
          </span>
        </div>
      )}
    </div>
  );
}
