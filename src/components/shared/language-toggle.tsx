"use client";

import { cn } from "@/lib/utils";

/**
 * Language selector. Arabic is the only active locale in v1.
 * The EN option is visible but disabled — a placeholder for future i18n.
 */
export function LanguageToggle() {
  const currentLang = "ar";

  return (
    <div
      role="group"
      aria-label="اختيار اللغة"
      className="flex items-center gap-0.5 rounded-md border border-border bg-muted p-0.5 text-xs font-medium"
    >
      <span
        aria-current="true"
        className={cn(
          "rounded px-2 py-1 transition-colors",
          currentLang === "ar"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground",
        )}
      >
        AR
      </span>
      <button
        type="button"
        disabled
        aria-label="اللغة الإنجليزية (قريباً)"
        className="rounded px-2 py-1 text-muted-foreground/50 cursor-not-allowed"
      >
        EN
      </button>
    </div>
  );
}
