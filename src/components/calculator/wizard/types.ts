import type { ZakatInput } from "@/lib/zakat/types";

/** Keys of {@link ZakatInput.assets} — used for checklist and per-type form steps. */
export type AssetCategoryKey = keyof ZakatInput["assets"];

export const ASSET_CATEGORY_ORDER: readonly AssetCategoryKey[] = [
  "cash",
  "stocks",
  "certificates",
  "gold",
  "silver",
  "realEstate",
  "loansGiven",
  "commercial",
  "debts",
] as const;

export const SETUP_STEP_IDS = [
  "currency",
  "yearType",
  "nisabDate",
  "assetChecklist",
] as const;

export type SetupStepId = (typeof SETUP_STEP_IDS)[number];

export type WizardStepId = SetupStepId | AssetCategoryKey | "results";

export interface WizardStepDescriptor {
  id: WizardStepId;
  label: string;
}

export interface WizardState {
  stepIndex: number;
  /** Primary reporting currency — nisab, totals, results. Empty until user picks. */
  currency: string;
  /** Currencies the user holds assets in (Step 1 multi-select). */
  currencies: string[];
  yearType: ZakatInput["yearType"];
  /** YYYY-MM-DD */
  nisabDate: string;
  selectedAssetTypes: AssetCategoryKey[];
  assets: ZakatInput["assets"];
}
