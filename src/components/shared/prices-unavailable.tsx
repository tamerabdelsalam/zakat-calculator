"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export interface PricesUnavailableProps {
  /** Optional Arabic detail message from the API error (e.g. e.message). */
  detail?: string;
  /** Called when the user presses the retry button. */
  onRetry?: () => void;
}

/**
 * Full-page blocking error state shown when /api/prices returns 503.
 * Per the price-data rule, the UI must block the wizard flow — not invent numbers.
 */
export function PricesUnavailable({ detail, onRetry }: PricesUnavailableProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 py-12 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" aria-hidden />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">تعذّر جلب أسعار الذهب</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {detail ??
            "الأسعار غير متوفرة حالياً. يرجى المحاولة مجدداً أو العودة لاحقاً."}
        </p>
      </div>

      <p className="max-w-xs text-xs text-muted-foreground">
        لا يمكن إتمام حساب الزكاة بدون سعر الذهب — لضمان دقة النصاب لا نعتمد
        على أسعار ثابتة مُضمَّنة في التطبيق.
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
