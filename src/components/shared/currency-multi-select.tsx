"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";

import { CURRENCY_LABELS } from "@/lib/zakat/constants";
import { cn } from "@/lib/utils";

export interface CurrencyMultiSelectProps {
  value: string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

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
 * Searchable multi-select currency picker for Step 1.
 * Starts empty — user picks currencies explicitly.
 */
export function CurrencyMultiSelect({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "اختر العملات التي تدخرها أو تمتلك أصول بها",
}: CurrencyMultiSelectProps) {
  return (
    <Combobox.Root<string, true>
      multiple
      modal={false}
      items={CURRENCY_CODES}
      value={value}
      onValueChange={(next) => {
        onChange(next ?? []);
      }}
      filter={filterCurrencies}
      itemToStringLabel={(code) => CURRENCY_LABELS[code] ?? code}
      autoHighlight
      disabled={disabled}
    >
      <Combobox.InputGroup
        aria-label={ariaLabel}
        className={cn(
          "flex min-h-12 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors",
          "focus-within:ring-2 focus-within:ring-ring",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <Combobox.Chips className="flex flex-wrap items-center gap-1.5">
          {value.map((code) => (
            <Combobox.Chip
              key={code}
              aria-label={`${CURRENCY_LABELS[code] ?? code} — محددة`}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              {CURRENCY_LABELS[code] ?? code}
              <Combobox.ChipRemove
                aria-label={`إزالة ${CURRENCY_LABELS[code] ?? code}`}
                className="inline-flex rounded p-0.5 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3 w-3" aria-hidden />
              </Combobox.ChipRemove>
            </Combobox.Chip>
          ))}
          <Combobox.Input
            placeholder={value.length === 0 ? "ابحث لإضافة عملة..." : "أضف..."}
            className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </Combobox.Chips>
        <ChevronDown
          className="ms-auto h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="z-50 w-[var(--anchor-width)]">
          <Combobox.Popup
            initialFocus={false}
            className={cn(
              "max-h-72 overflow-hidden rounded-lg border border-border bg-popover shadow-md",
              "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
              "transition-opacity duration-100",
            )}
          >
            <Combobox.Empty className="py-6 text-center text-sm text-muted-foreground">
              لا توجد عملة مطابقة
            </Combobox.Empty>

            <Combobox.List className="overflow-y-auto p-1">
              {(code) => (
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
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
