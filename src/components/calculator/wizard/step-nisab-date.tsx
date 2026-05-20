"use client";

import { useEffect, useRef } from "react";
import { CalendarClock, RotateCcw } from "lucide-react";

import { useWizard } from "./wizard-context";
import { defaultNisabDateIso } from "./wizard-state";

const today = new Date().toISOString().slice(0, 10);
const fiveYearsAgo = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5);
  return d.toISOString().slice(0, 10);
})();

export function NisabDateStep() {
  const { state, dispatch } = useWizard();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const defaultDate = defaultNisabDateIso();
  const isDefault = state.nisabDate === defaultDate;

  function handleReset() {
    dispatch({ type: "SET_NISAB_DATE", nisabDate: defaultDate });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          أدخل التاريخ الذي بلغت فيه ثروتك النصاب لأول مرة في هذا الحول.
          يُستخدم سعر الذهب في ذلك اليوم لحساب قيمة النصاب — وليس السعر
          الحالي.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="nisab-date" className="text-sm font-medium">
            تاريخ بلوغ النصاب
          </label>
          {!isDefault && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label="إعادة التعيين إلى سنة كاملة مضت"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              إعادة التعيين
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          id="nisab-date"
          type="date"
          value={state.nisabDate}
          min={fiveYearsAgo}
          max={today}
          onChange={(e) => dispatch({ type: "SET_NISAB_DATE", nisabDate: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <p className="text-xs text-muted-foreground">
          الافتراضي: سنة كاملة مضت ({defaultDate})
        </p>
      </div>
    </div>
  );
}
