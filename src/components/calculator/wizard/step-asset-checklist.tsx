"use client";

import { forwardRef, useEffect, useRef } from "react";
import {
  Banknote,
  TrendingUp,
  FileText,
  Gem,
  Circle,
  Building2,
  HandCoins,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ASSET_LABELS } from "@/lib/zakat/constants";
import { cn } from "@/lib/utils";

import { useWizard } from "./wizard-context";
import { ASSET_CATEGORY_ORDER, type AssetCategoryKey } from "./types";

// ─── Icon & description map ───────────────────────────────────────────────────

const ASSET_ICONS: Record<AssetCategoryKey, LucideIcon> = {
  cash: Banknote,
  stocks: TrendingUp,
  certificates: FileText,
  gold: Gem,
  silver: Circle,
  realEstate: Building2,
  loansGiven: HandCoins,
  commercial: ShoppingBag,
  debts: CreditCard,
};

const ASSET_DESCRIPTIONS: Record<AssetCategoryKey, string> = {
  cash: "نقد، توفير، حسابات جارية",
  stocks: "أسهم، صناديق، ETFs",
  certificates: "شهادات إيداع بنكية",
  gold: "سبائك، مجوهرات، عيارات ٢٤/٢١/١٨/١٤",
  silver: "سبائك، مجوهرات، عيارات ٩٩٩/٩٢٥",
  realEstate: "أراضي، شقق، عقارات استثمارية",
  loansGiven: "أموال أقرضتها للغير",
  commercial: "مخزون تجاري، ذمم مدينة",
  debts: "ديون مستحقة عليك تُخصم من المجموع",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AssetChecklistStep() {
  const { state, dispatch } = useWizard();
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const allSelected = ASSET_CATEGORY_ORDER.every((c) =>
    state.selectedAssetTypes.includes(c),
  );
  const noneSelected = state.selectedAssetTypes.length === 0;

  function selectAll() {
    dispatch({
      type: "SET_SELECTED_ASSET_TYPES",
      selected: [...ASSET_CATEGORY_ORDER],
    });
  }

  function clearAll() {
    dispatch({ type: "SET_SELECTED_ASSET_TYPES", selected: [] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          اختر أنواع الأصول التي تملكها — ستُحسب زكاة كل نوع حسب قواعده
          الشرعية.
        </p>
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <button
            type="button"
            onClick={selectAll}
            disabled={allSelected}
            className="rounded px-2 py-1 text-primary hover:bg-primary/10 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            تحديد الكل
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={noneSelected}
            className="rounded px-2 py-1 text-muted-foreground hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            مسح الكل
          </button>
        </div>
      </div>

      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">أنواع الأصول التي تملكها</legend>
        {ASSET_CATEGORY_ORDER.map((category, idx) => (
          <AssetCard
            key={category}
            ref={idx === 0 ? firstRef : undefined}
            category={category}
            checked={state.selectedAssetTypes.includes(category)}
            onToggle={() => dispatch({ type: "TOGGLE_ASSET_TYPE", category })}
          />
        ))}
      </fieldset>

      {state.selectedAssetTypes.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {state.selectedAssetTypes.length} من {ASSET_CATEGORY_ORDER.length} أنواع محددة
        </p>
      )}
    </div>
  );
}

// ─── Individual card ─────────────────────────────────────────────────────────

const AssetCard = forwardRef<
  HTMLInputElement,
  { category: AssetCategoryKey; checked: boolean; onToggle: () => void }
>(function AssetCard({ category, checked, onToggle }, ref) {
  const Icon = ASSET_ICONS[category];

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
        checked
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-muted/50",
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />

      {/* Icon badge */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
          checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">{ASSET_LABELS[category]}</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
          {ASSET_DESCRIPTIONS[category]}
        </p>
      </div>

      {/* Checkbox indicator */}
      <div
        className={cn(
          "ms-auto mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background",
        )}
        aria-hidden
      >
        {checked && (
          <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5" aria-hidden>
            <path
              d="M1 4l3 3 5-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </label>
  );
});
