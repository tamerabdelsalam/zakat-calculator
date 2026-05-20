"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown } from "lucide-react";

import { CURRENCY_LABELS } from "@/lib/zakat/constants";
import { cn } from "@/lib/utils";

export interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** ISO codes in display order (matches CURRENCY_LABELS key insertion order) */
const CURRENCY_CODES = Object.keys(CURRENCY_LABELS);

function filterCurrencies(code: string, inputValue: string): boolean {
  const q = inputValue.toLowerCase().trim();
  if (!q) return true;
  return (
    code.toLowerCase().includes(q) ||
    (CURRENCY_LABELS[code] ?? "").includes(q)
  );
}

/**
 * Searchable single-select currency picker.
 * Filterable by Arabic name or ISO code (e.g. "ريال", "EGP", "saud").
 * Reusable in Step 1 and future per-line asset-row overrides (Phase 4.3).
 */
export function CurrencySelect({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "اختر العملة",
}: CurrencySelectProps) {
  const selectedLabel = CURRENCY_LABELS[value] ?? value;

  return (
    <Combobox.Root<string>
      value={value}
      onValueChange={(v) => {
        if (v && v !== value) onChange(v);
      }}
      filter={filterCurrencies}
      disabled={disabled}
    >
      {/* Trigger shows current value */}
      <Combobox.Trigger
        aria-label={ariaLabel}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span>
          {selectedLabel}
          <span className="ms-1.5 text-muted-foreground">({value})</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner
          sideOffset={4}
          className="z-50 w-[var(--anchor-width)]"
        >
          <Combobox.Popup
            className={cn(
              "max-h-72 overflow-hidden rounded-lg border border-border bg-popover shadow-md",
              "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
              "transition-opacity duration-100",
            )}
          >
            {/* Search input */}
            <div className="sticky top-0 border-b border-border bg-popover px-3 py-2">
              <Combobox.Input
                autoFocus
                placeholder="ابحث... (اسم أو رمز العملة)"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <Combobox.List className="overflow-y-auto p-1">
              <Combobox.Empty className="py-6 text-center text-sm text-muted-foreground">
                لا توجد عملة مطابقة
              </Combobox.Empty>

              {CURRENCY_CODES.map((code) => (
                <Combobox.Item
                  key={code}
                  value={code}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                    "data-[selected]:font-semibold",
                  )}
                >
                  <span>
                    {CURRENCY_LABELS[code] ?? code}
                    <span className="ms-1.5 text-xs text-muted-foreground">({code})</span>
                  </span>
                  <Combobox.ItemIndicator>
                    <Check className="h-4 w-4 text-primary" aria-hidden />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
