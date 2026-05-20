"use client";

import { useEffect, useRef } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";
import { certificateEntrySchema } from "@/lib/schemas";
import { CURRENCY_LABELS } from "@/lib/zakat/constants";
import type { CertificateEntry } from "@/lib/zakat/types";
import { cn } from "@/lib/utils";

import { useWizard } from "./wizard-context";

function createEmptyCertificateEntry(): CertificateEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    totalValue: 0,
    spendsReturnsOnly: false,
  };
}

function isDraftEntry(entry: CertificateEntry): boolean {
  return entry.label.trim() === "" && entry.totalValue <= 0;
}

function entryFieldErrors(
  entry: CertificateEntry,
): { label?: string; totalValue?: string; spendsReturnsOnly?: string } {
  if (isDraftEntry(entry)) return {};
  const result = certificateEntrySchema.safeParse(entry);
  if (result.success) return {};
  const errors: {
    label?: string;
    totalValue?: string;
    spendsReturnsOnly?: string;
  } = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "label" || field === "totalValue" || field === "spendsReturnsOnly") {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function CertificatesStep() {
  const { state, dispatch } = useWizard();
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const entries = state.assets.certificates;
  const currency = state.currency;

  function updateCertificates(next: CertificateEntry[]) {
    dispatch({
      type: "SET_ASSETS",
      assets: { ...state.assets, certificates: next },
    });
  }

  function updateEntry(id: string, patch: Partial<CertificateEntry>) {
    updateCertificates(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    updateCertificates(entries.filter((e) => e.id !== id));
  }

  function addEntry() {
    updateCertificates([...entries, createEmptyCertificateEntry()]);
  }

  const validEntries = entries.filter(
    (e) => !isDraftEntry(e) && certificateEntrySchema.safeParse(e).success,
  );

  const subtotal = validEntries.reduce((sum, e) => sum + e.totalValue, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          أدخل شهادات الإيداع والاستثمارات ذات العائد الثابت. إذا كانت ثروتك الزكوية
          تتكون <span className="font-medium text-foreground">فقط</span> من شهادات
          تنفق عوائدها دون لمس أصل المال — فعّل الخيار المناسب لكل شهادة؛ يُطبَّق
          حينها حكم خاص (١٠٪ من العائد). جميع المبالغ بـ{" "}
          <span className="font-medium text-foreground">
            {CURRENCY_LABELS[currency] ?? currency}
          </span>
          .
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد إدخالات — أضف شهادة إيداع أو استثماراً.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="قائمة الشهادات البنكية">
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
                  <label
                    htmlFor={`cert-label-${entry.id}`}
                    className="text-sm font-medium"
                  >
                    الوصف
                  </label>
                  <input
                    ref={idx === 0 ? firstRef : undefined}
                    id={`cert-label-${entry.id}`}
                    type="text"
                    value={entry.label}
                    onChange={(e) => updateEntry(entry.id, { label: e.target.value })}
                    placeholder="مثال: شهادة إيداع ٣ سنوات — البنك الأهلي"
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
                    htmlFor={`cert-value-${entry.id}`}
                    className="text-sm font-medium"
                  >
                    القيمة الإجمالية ({currency})
                  </label>
                  <input
                    id={`cert-value-${entry.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={entry.totalValue > 0 ? entry.totalValue : ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const totalValue = raw === "" ? 0 : Number.parseFloat(raw);
                      updateEntry(entry.id, {
                        totalValue: Number.isFinite(totalValue) ? totalValue : 0,
                      });
                    }}
                    placeholder="0.00"
                    className={cn(
                      "w-full rounded-md border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      errors.totalValue ? "border-destructive" : "border-input",
                    )}
                  />
                  {errors.totalValue && (
                    <p className="text-xs text-destructive">{errors.totalValue}</p>
                  )}
                </div>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors",
                    entry.spendsReturnsOnly
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={entry.spendsReturnsOnly}
                    onChange={(e) =>
                      updateEntry(entry.id, { spendsReturnsOnly: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <div>
                    <span className="text-sm font-medium">
                      أُنفق العوائد/الأرباح فقط
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                      لا أستخدم أصل رأس المال — ينطبق حكم خاص إذا كانت هذه الشهادات
                      وحدها هي ثروتي الزكوية.
                    </p>
                  </div>
                </label>
                {errors.spendsReturnsOnly && (
                  <p className="text-xs text-destructive">{errors.spendsReturnsOnly}</p>
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
          <span className="text-muted-foreground">مجموع الشهادات</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(subtotal, currency)}
          </span>
        </div>
      )}
    </div>
  );
}
