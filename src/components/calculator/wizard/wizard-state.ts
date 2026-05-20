import { ASSET_LABELS } from "@/lib/zakat/constants";
import type { ZakatInput } from "@/lib/zakat/types";

import {
  ASSET_CATEGORY_ORDER,
  SETUP_STEP_IDS,
  type AssetCategoryKey,
  type WizardState,
  type WizardStepDescriptor,
  type WizardStepId,
} from "./types";

export const WIZARD_STEP_LABELS: Record<WizardStepId, string> = {
  currency: "العملة",
  yearType: "نوع السنة",
  nisabDate: "تاريخ بلوغ النصاب",
  assetChecklist: "أنواع الأصول",
  results: "النتيجة",
  ...ASSET_LABELS,
};

export function emptyAssets(): ZakatInput["assets"] {
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

export function defaultNisabDateIso(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

export function createInitialWizardState(): WizardState {
  return {
    stepIndex: 0,
    currency: "EGP",
    yearType: "hijri",
    nisabDate: defaultNisabDateIso(),
    selectedAssetTypes: [],
    assets: emptyAssets(),
  };
}

/** Ordered steps: setup → selected asset forms (fixed category order) → results. */
export function buildWizardSteps(
  selectedAssetTypes: readonly AssetCategoryKey[],
): WizardStepDescriptor[] {
  const selected = new Set(selectedAssetTypes);
  const assetSteps = ASSET_CATEGORY_ORDER.filter((k) => selected.has(k)).map(
    (id) => ({
      id,
      label: WIZARD_STEP_LABELS[id],
    }),
  );

  const setup = SETUP_STEP_IDS.map((id) => ({
    id,
    label: WIZARD_STEP_LABELS[id],
  }));

  return [...setup, ...assetSteps, { id: "results" as const, label: WIZARD_STEP_LABELS.results }];
}

export function clampStepIndex(index: number, stepCount: number): number {
  if (stepCount <= 0) return 0;
  return Math.min(Math.max(0, index), stepCount - 1);
}

export function toZakatInput(state: WizardState): ZakatInput {
  return {
    currency: state.currency,
    yearType: state.yearType,
    nisabDate: new Date(`${state.nisabDate}T12:00:00`),
    assets: state.assets,
  };
}
