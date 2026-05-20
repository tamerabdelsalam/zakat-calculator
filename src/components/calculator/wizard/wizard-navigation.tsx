"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface WizardNavigationProps {
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextLabel?: string;
  className?: string;
}

export function WizardNavigation({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  nextLabel = "التالي",
  className,
}: WizardNavigationProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 pt-6", className)}>
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
        السابق
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isLastStep}
        className="inline-flex items-center gap-1 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {nextLabel}
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
