"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { ASSET_LABELS, CURRENCY_LABELS } from "@/lib/zakat/constants";
import { CurrencyMultiSelect } from "@/components/shared/currency-multi-select";
import { cn } from "@/lib/utils";

import { useWizard } from "./wizard-context";
import { useWizardKeyboard } from "./use-wizard-keyboard";
import { WizardNavigation } from "./wizard-navigation";
import { WizardStepper } from "./wizard-stepper";
import { NisabDateStep } from "./step-nisab-date";
import { AssetChecklistStep } from "./step-asset-checklist";
import { CashStep } from "./step-cash";
import { StocksStep } from "./step-stocks";
import { CertificatesStep } from "./step-certificates";
import { type AssetCategoryKey, type WizardStepId } from "./types";

export function CalculatorWizard() {
  const {
    state,
    steps,
    currentStep,
    stepIndex,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
  } = useWizard();

  const currencyStepIncomplete =
    currentStep.id === "currency" && state.currencies.length === 0;

  // Focus the step section heading when the step changes
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex]);

  useWizardKeyboard({
    onNext: nextStep,
    onBack: prevStep,
    isFirstStep,
    isLastStep,
    nextDisabled: currencyStepIncomplete,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">حاسبة الزكاة</h1>
        <WizardStepper steps={steps} currentIndex={stepIndex} />
      </header>

      <section
        aria-labelledby="wizard-step-title"
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <h2
          id="wizard-step-title"
          ref={headingRef}
          tabIndex={-1}
          className="mb-6 text-lg font-semibold focus-visible:outline-none"
        >
          {currentStep.label}
        </h2>

        <WizardStepBody stepId={currentStep.id} />
      </section>

      <WizardNavigation
        onBack={prevStep}
        onNext={nextStep}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        nextDisabled={currencyStepIncomplete}
        nextLabel={isLastStep ? "إنهاء" : "التالي"}
      />
    </div>
  );
}

// ─── Step dispatcher ────────────────────────────────────────────────────────

function WizardStepBody({ stepId }: { stepId: WizardStepId }) {
  switch (stepId) {
    case "currency":
      return <CurrencyStep />;
    case "yearType":
      return <YearTypeStep />;
    case "nisabDate":
      return <NisabDateStep />;
    case "assetChecklist":
      return <AssetChecklistStep />;
    case "cash":
      return <CashStep />;
    case "stocks":
      return <StocksStep />;
    case "certificates":
      return <CertificatesStep />;
    case "results":
      return (
        <p className="text-sm text-muted-foreground">
          عرض النتائج سيُضاف في مرحلة لاحقة. يمكنك الرجوع لتعديل المدخلات.
        </p>
      );
    default:
      return isAssetStep(stepId) ? (
        <p className="text-sm text-muted-foreground">
          نموذج إدخال «{ASSET_LABELS[stepId]}» سيُضاف قريباً.
        </p>
      ) : null;
  }
}

// ─── Step 1: Currency ────────────────────────────────────────────────────────

function sameCurrencySet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((c) => setB.has(c));
}

function formatCurrencyList(codes: readonly string[]): string {
  return codes.map((c) => CURRENCY_LABELS[c] ?? c).join("، ");
}

function CurrencyStep() {
  const { state, dispatch } = useWizard();
  const [showWarning, setShowWarning] = useState(false);
  const [pendingCurrencies, setPendingCurrencies] = useState<string[] | null>(null);
  const [pendingPrimary, setPendingPrimary] = useState<string | null>(null);

  const hasData = hasEnteredData(state.assets);

  function applyCurrencies(currencies: string[], primary: string) {
    dispatch({ type: "SET_CURRENCIES", currencies });
    if (primary && primary !== state.currency) {
      dispatch({ type: "SET_PRIMARY_CURRENCY", currency: primary });
    }
  }

  function handleCurrenciesChange(currencies: string[]) {
    const primary =
      currencies.length === 0
        ? ""
        : currencies.includes(state.currency)
          ? state.currency
          : currencies[0]!;
    if (
      sameCurrencySet(currencies, state.currencies) &&
      primary === state.currency
    ) {
      return;
    }
    if (hasData) {
      setPendingCurrencies(currencies);
      setPendingPrimary(primary);
      setShowWarning(true);
    } else {
      applyCurrencies(currencies, primary);
    }
  }

  function handlePrimaryChange(primary: string) {
    if (primary === state.currency) return;
    if (hasData) {
      setPendingCurrencies([...state.currencies]);
      setPendingPrimary(primary);
      setShowWarning(true);
    } else {
      dispatch({ type: "SET_PRIMARY_CURRENCY", currency: primary });
    }
  }

  function confirmChange() {
    if (pendingCurrencies === null) return;
    const primary =
      pendingPrimary ??
      (pendingCurrencies.length > 0 ? pendingCurrencies[0]! : "");
    applyCurrencies(pendingCurrencies, primary);
    dispatch({ type: "SET_ASSETS", assets: emptyAssetsFromState() });
    setShowWarning(false);
    setPendingCurrencies(null);
    setPendingPrimary(null);
  }

  function cancelChange() {
    setShowWarning(false);
    setPendingCurrencies(null);
    setPendingPrimary(null);
  }

  return (
    <div className="space-y-5">
      {showWarning && (
        <div
          role="alertdialog"
          aria-labelledby="currency-warning-title"
          aria-describedby="currency-warning-desc"
          className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        >
          <div className="flex items-start gap-2 text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              <p id="currency-warning-title" className="text-sm font-semibold">
                تعديل العملات سيمسح البيانات المُدخلة
              </p>
              <p id="currency-warning-desc" className="mt-0.5 text-xs text-muted-foreground">
                {state.currencies.length > 0 ? (
                  <>لقد أدخلت أصولاً بالعملات: {formatCurrencyList(state.currencies)}.</>
                ) : (
                  <>لقد أدخلت أصولاً بالفعل.</>
                )}
                {pendingCurrencies !== null &&
                  !sameCurrencySet(pendingCurrencies, state.currencies) && (
                    <>
                      {" "}
                      {pendingCurrencies.length > 0
                        ? `تعديل القائمة إلى ${formatCurrencyList(pendingCurrencies)} سيحذف جميع البيانات.`
                        : "إفراغ قائمة العملات سيحذف جميع البيانات."}
                    </>
                  )}
                {pendingPrimary && pendingPrimary !== state.currency && (
                  <>
                    {" "}
                    تغيير العملة الرئيسية إلى «
                    {CURRENCY_LABELS[pendingPrimary] ?? pendingPrimary}» سيحذف جميع
                    البيانات.
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={cancelChange}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={confirmChange}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              تأكيد التغيير
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <span className="text-sm font-medium">
          اختر العملة أو العملات التي تدخرها أو تمتلك أصول بها
        </span>
        <CurrencyMultiSelect
          value={state.currencies}
          onChange={handleCurrenciesChange}
          aria-label="اختر العملة أو العملات التي تدخرها أو تمتلك أصول بها"
        />
        <p className="text-xs text-muted-foreground">
          {state.currencies.length === 0
            ? "اختر عملة واحدة على الأقل للمتابعة."
            : "ستظهر العملات المختارة كخيارات لكل سطر إدخال في الخطوات اللاحقة."}
        </p>
      </div>

      {state.currencies.length > 1 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">العملة الرئيسية للنتيجة</legend>
          <p className="text-xs text-muted-foreground">
            يُحسب النصاب والزكاة النهائية بهذه العملة؛ تُحوَّل المبالغ الأخرى
            تلقائياً.
          </p>
          {state.currencies.map((code) => (
            <label
              key={code}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                state.currency === code
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <input
                type="radio"
                name="primaryCurrency"
                value={code}
                checked={state.currency === code}
                onChange={() => handlePrimaryChange(code)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-medium">
                {CURRENCY_LABELS[code] ?? code}
                <span className="ms-1.5 text-muted-foreground">({code})</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {state.currencies.length === 1 && (
        <p className="text-xs text-muted-foreground">
          جميع المبالغ والنصاب وزكاة الحول ستُحسب بـ{" "}
          <span className="font-medium text-foreground">
            {CURRENCY_LABELS[state.currency] ?? state.currency}
          </span>
          .
        </p>
      )}
    </div>
  );
}

// ─── Step 2: Year type ───────────────────────────────────────────────────────

function YearTypeStep() {
  const { state, dispatch } = useWizard();
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const options = [
    {
      value: "hijri" as const,
      label: "سنة هجرية",
      rate: "٢.٥٪",
      desc: "الأصل الفقهي المعتمد — السنة القمرية (٣٥٤ يوم)",
    },
    {
      value: "gregorian" as const,
      label: "سنة ميلادية",
      rate: "٢.٥٧٧٪",
      desc: "للمسلمين الذين يتعذّر عليهم الحساب الهجري",
    },
  ] as const;

  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">نوع السنة</legend>
      {options.map(({ value, label, rate, desc }, idx) => (
        <label
          key={value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-4 transition-colors",
            state.yearType === value
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50",
          )}
        >
          <input
            ref={idx === 0 ? firstRef : undefined}
            type="radio"
            name="yearType"
            value={value}
            checked={state.yearType === value}
            onChange={() => dispatch({ type: "SET_YEAR_TYPE", yearType: value })}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <div>
            <span className="font-semibold">{label}</span>
            <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {rate}
            </span>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        </label>
      ))}
    </fieldset>
  );
}

// NisabDateStep and AssetChecklistStep are imported from dedicated step files.

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isAssetStep(id: string): id is AssetCategoryKey {
  return id in ASSET_LABELS;
}

function hasEnteredData(assets: ReturnType<typeof useWizard>["state"]["assets"]): boolean {
  return Object.values(assets).some((arr) => arr.length > 0);
}

function emptyAssetsFromState(): ReturnType<typeof useWizard>["state"]["assets"] {
  return {
    cash: [],
    stocks: [],
    certificates: [],
    gold: [],
    silver: [],
    realEstate: [],
    loansGiven: [],
    commercial: [],
    debts: [],
  };
}
