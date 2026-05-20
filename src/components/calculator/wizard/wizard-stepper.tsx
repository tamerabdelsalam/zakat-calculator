"use client";

import { cn } from "@/lib/utils";

import type { WizardStepDescriptor } from "./types";

interface WizardStepperProps {
  steps: WizardStepDescriptor[];
  currentIndex: number;
  className?: string;
}

/**
 * Compact step indicator for mobile-first layout. Shows all step labels on sm+;
 * on narrow screens shows "الخطوة X من Y" plus current step name.
 */
export function WizardStepper({ steps, currentIndex, className }: WizardStepperProps) {
  const total = steps.length;
  const current = steps[currentIndex];

  return (
    <nav
      aria-label="خطوات الحاسبة"
      className={cn("w-full", className)}
    >
      <p className="mb-2 text-center text-xs text-muted-foreground sm:hidden">
        الخطوة {currentIndex + 1} من {total}
        {current ? ` — ${current.label}` : ""}
      </p>

      <ol className="hidden flex-wrap items-center justify-center gap-1 sm:flex">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <li key={step.id} className="flex items-center gap-1">
              {index > 0 && (
                <span
                  className="text-muted-foreground/40"
                  aria-hidden
                >
                  /
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  isCurrent && "bg-primary text-primary-foreground",
                  isPast && !isCurrent && "text-foreground",
                  !isCurrent && !isPast && "text-muted-foreground",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
