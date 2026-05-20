"use client";

import { useEffect } from "react";

const FOCUSABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"]);

/**
 * Keyboard navigation for the wizard:
 * - Enter  → next step (unless focus is inside an interactive element)
 * - Escape → previous step
 *
 * We intentionally skip Enter when the focused element is an input/textarea/select
 * so text fields and radio buttons can still use Enter normally.
 */
export function useWizardKeyboard({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  nextDisabled = false,
}: {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextDisabled?: boolean;
}) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      const isInteractive = FOCUSABLE_TAGS.has(tag);

      if (e.key === "Enter" && !isInteractive && !isLastStep && !nextDisabled) {
        e.preventDefault();
        onNext();
      }

      if (e.key === "Escape" && !isFirstStep) {
        e.preventDefault();
        onBack();
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onBack, isFirstStep, isLastStep, nextDisabled]);
}
