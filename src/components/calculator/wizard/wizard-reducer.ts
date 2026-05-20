import type { YearType, ZakatInput } from "@/lib/zakat/types";

import {
  buildWizardSteps,
  clampStepIndex,
  createInitialWizardState,
} from "./wizard-state";
import type { AssetCategoryKey, WizardState } from "./types";

export type WizardAction =
  | { type: "SET_CURRENCY"; currency: string }
  | { type: "SET_YEAR_TYPE"; yearType: YearType }
  | { type: "SET_NISAB_DATE"; nisabDate: string }
  | { type: "SET_SELECTED_ASSET_TYPES"; selected: AssetCategoryKey[] }
  | { type: "TOGGLE_ASSET_TYPE"; category: AssetCategoryKey }
  | { type: "SET_ASSETS"; assets: ZakatInput["assets"] }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; index: number }
  | { type: "RESET" };

function normalize(state: WizardState): WizardState {
  const steps = buildWizardSteps(state.selectedAssetTypes);
  return {
    ...state,
    stepIndex: clampStepIndex(state.stepIndex, steps.length),
  };
}

function reconcileStepIndex(state: WizardState, next: Partial<WizardState>): number {
  const merged = { ...state, ...next };
  const steps = buildWizardSteps(merged.selectedAssetTypes);
  return clampStepIndex(merged.stepIndex, steps.length);
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_CURRENCY":
      return normalize({ ...state, currency: action.currency });

    case "SET_YEAR_TYPE":
      return normalize({ ...state, yearType: action.yearType });

    case "SET_NISAB_DATE":
      return normalize({ ...state, nisabDate: action.nisabDate });

    case "SET_SELECTED_ASSET_TYPES": {
      const assets = { ...state.assets };
      const nextSet = new Set(action.selected);
      for (const key of Object.keys(assets) as AssetCategoryKey[]) {
        if (!nextSet.has(key)) {
          assets[key] = [];
        }
      }
      const next: WizardState = {
        ...state,
        selectedAssetTypes: [...action.selected],
        assets,
      };
      return normalize({ ...next, stepIndex: reconcileStepIndex(state, next) });
    }

    case "TOGGLE_ASSET_TYPE": {
      const has = state.selectedAssetTypes.includes(action.category);
      const selected = has
        ? state.selectedAssetTypes.filter((k) => k !== action.category)
        : [...state.selectedAssetTypes, action.category];
      const assets = { ...state.assets };
      if (has) {
        assets[action.category] = [];
      }
      const next: WizardState = { ...state, selectedAssetTypes: selected, assets };
      return normalize({ ...next, stepIndex: reconcileStepIndex(state, next) });
    }

    case "SET_ASSETS":
      return normalize({ ...state, assets: action.assets });

    case "NEXT_STEP":
      return normalize({ ...state, stepIndex: state.stepIndex + 1 });

    case "PREV_STEP":
      return normalize({ ...state, stepIndex: state.stepIndex - 1 });

    case "GO_TO_STEP":
      return normalize({ ...state, stepIndex: action.index });

    case "RESET":
      return createInitialWizardState();

    default:
      return state;
  }
}
