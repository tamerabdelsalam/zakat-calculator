import { describe, expect, it } from "vitest";

import { buildWizardSteps, createInitialWizardState } from "./wizard-state";
import { wizardReducer } from "./wizard-reducer";

describe("buildWizardSteps", () => {
  it("includes setup, selected asset forms, and results", () => {
    const steps = buildWizardSteps(["cash", "gold"]);
    expect(steps.map((s) => s.id)).toEqual([
      "currency",
      "yearType",
      "nisabDate",
      "assetChecklist",
      "cash",
      "gold",
      "results",
    ]);
  });
});

describe("wizardReducer", () => {
  it("advances and goes back between steps", () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, { type: "NEXT_STEP" });
    expect(state.stepIndex).toBe(1);
    state = wizardReducer(state, { type: "PREV_STEP" });
    expect(state.stepIndex).toBe(0);
  });

  it("clamps step index when asset selection shrinks", () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, { type: "SET_SELECTED_ASSET_TYPES", selected: ["cash"] });
    for (let i = 0; i < 10; i++) {
      state = wizardReducer(state, { type: "NEXT_STEP" });
    }
    const steps = buildWizardSteps(state.selectedAssetTypes);
    expect(state.stepIndex).toBeLessThan(steps.length);
  });
});
