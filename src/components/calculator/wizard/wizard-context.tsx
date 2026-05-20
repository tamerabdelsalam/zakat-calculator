"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import { wizardReducer, type WizardAction } from "./wizard-reducer";
import {
  buildWizardSteps,
  createInitialWizardState,
  toZakatInput,
} from "./wizard-state";
import type { WizardState, WizardStepDescriptor } from "./types";

export interface WizardContextValue {
  state: WizardState;
  steps: WizardStepDescriptor[];
  currentStep: WizardStepDescriptor;
  stepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  dispatch: (action: WizardAction) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  toZakatInput: () => ReturnType<typeof toZakatInput>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, undefined, createInitialWizardState);

  const steps = useMemo(
    () => buildWizardSteps(state.selectedAssetTypes),
    [state.selectedAssetTypes],
  );

  const stepIndex = state.stepIndex;
  const currentStep = steps[stepIndex] ?? steps[0]!;

  const nextStep = useCallback(() => dispatch({ type: "NEXT_STEP" }), []);
  const prevStep = useCallback(() => dispatch({ type: "PREV_STEP" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const getZakatInput = useCallback(() => toZakatInput(state), [state]);

  const value = useMemo<WizardContextValue>(
    () => ({
      state,
      steps,
      currentStep,
      stepIndex,
      isFirstStep: stepIndex <= 0,
      isLastStep: stepIndex >= steps.length - 1,
      dispatch,
      nextStep,
      prevStep,
      reset,
      toZakatInput: getZakatInput,
    }),
    [state, steps, currentStep, stepIndex, nextStep, prevStep, reset, getZakatInput],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return ctx;
}
