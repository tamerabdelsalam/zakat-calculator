import { describe, expect, it } from "vitest";
import { calculateZakat } from "./calculator";
import type { ZakatInput } from "./types";
import { calculateGoldNisab, calculateSilverNisab } from "./nisab";

const DEFAULT_PRICES = {
  goldPricePerGram21K: 100,
  silverPricePerGram925: 1,
  currentGoldPricePerGram24K: 120,
  currentSilverPricePerGram999: 1,
};

function emptyAssets(): ZakatInput["assets"] {
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

function baseInput(
  overrides: Partial<ZakatInput["assets"]> = {},
): ZakatInput {
  return {
    yearType: "hijri",
    nisabDate: new Date("2025-01-01"),
    currency: "EGP",
    assets: { ...emptyAssets(), ...overrides },
  };
}

describe("calculateZakat – basic calculation", () => {
  it("computes zakat at 2.5% for hijri year when above nisab", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const amount = nisab + 1000;
    const result = calculateZakat(
      baseInput({ cash: [{ id: "c1", label: "نقد", amount }] }),
      DEFAULT_PRICES,
    );
    expect(result.isAboveNisab).toBe(true);
    expect(result.zakatDue).toBeCloseTo(amount * 0.025);
  });

  it("returns zero zakat when below nisab", () => {
    const result = calculateZakat(
      baseInput({ cash: [{ id: "c1", label: "نقد", amount: 10 }] }),
      DEFAULT_PRICES,
    );
    expect(result.isAboveNisab).toBe(false);
    expect(result.zakatDue).toBe(0);
  });

  it("deducts debts from net zakatable wealth", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        cash: [{ id: "c1", label: "نقد", amount: nisab + 5000 }],
        debts: [{ id: "d1", label: "دين", amount: 10000 }],
      }),
      DEFAULT_PRICES,
    );
    expect(result.netZakatableWealth).toBe(nisab + 5000 - 10000);
  });
});

describe("calculateZakat – special case: silver_only", () => {
  it("uses min(gold nisab, silver nisab) when wealth is silver-only", () => {
    const prices = {
      goldPricePerGram21K: 1000,
      silverPricePerGram925: 1,
      currentGoldPricePerGram24K: 1200,
      currentSilverPricePerGram999: 2,
    };
    const result = calculateZakat(
      baseInput({
        silver: [{ id: "s1", label: "فضة", weightGrams: 400, purity: "999" }],
      }),
      prices,
    );
    const goldNisab = calculateGoldNisab(prices.goldPricePerGram21K);
    const silverNisab = calculateSilverNisab(prices.silverPricePerGram925);
    expect(result.nisabThreshold).toBe(Math.min(goldNisab, silverNisab));
    expect(result.specialCases).toContain("silver_only");
  });

  it("does NOT flag silver_only when other assets exist", () => {
    const result = calculateZakat(
      baseInput({
        silver: [{ id: "s1", label: "فضة", weightGrams: 100, purity: "999" }],
        cash: [{ id: "c1", label: "نقد", amount: 500 }],
      }),
      DEFAULT_PRICES,
    );
    expect(result.specialCases).not.toContain("silver_only");
  });
});

describe("calculateZakat – special case: returns_only", () => {
  it("exempts from annual zakat when all certificates spend returns only", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        certificates: [
          { id: "cert1", label: "شهادة", totalValue: nisab + 5000, spendsReturnsOnly: true },
        ],
      }),
      DEFAULT_PRICES,
    );
    expect(result.specialCases).toContain("returns_only");
    expect(result.zakatDue).toBe(0);
  });

  it("does NOT flag returns_only when spendsReturnsOnly is false", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        certificates: [
          { id: "cert1", label: "شهادة", totalValue: nisab + 5000, spendsReturnsOnly: false },
        ],
      }),
      DEFAULT_PRICES,
    );
    expect(result.specialCases).not.toContain("returns_only");
    expect(result.zakatDue).toBeGreaterThan(0);
  });

  it("does NOT flag returns_only when other assets exist alongside certificates", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        certificates: [
          { id: "cert1", label: "شهادة", totalValue: nisab, spendsReturnsOnly: true },
        ],
        cash: [{ id: "c1", label: "نقد", amount: 1000 }],
      }),
      DEFAULT_PRICES,
    );
    expect(result.specialCases).not.toContain("returns_only");
  });
});

describe("calculateZakat – special case: real_estate_only", () => {
  it("exempts from annual zakat when all assets are investment real estate", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        realEstate: [
          { id: "re1", label: "عقار", value: nisab + 5000, purpose: "investment" },
        ],
      }),
      DEFAULT_PRICES,
    );
    expect(result.specialCases).toContain("real_estate_only");
    expect(result.zakatDue).toBe(0);
  });

  it("does NOT flag real_estate_only for trade-purpose real estate", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        realEstate: [
          { id: "re1", label: "عقار", value: nisab + 5000, purpose: "trade" },
        ],
      }),
      DEFAULT_PRICES,
    );
    expect(result.specialCases).not.toContain("real_estate_only");
    expect(result.zakatDue).toBeGreaterThan(0);
  });

  it("does NOT flag real_estate_only when other assets exist", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        realEstate: [
          { id: "re1", label: "عقار", value: nisab, purpose: "investment" },
        ],
        cash: [{ id: "c1", label: "نقد", amount: 1000 }],
      }),
      DEFAULT_PRICES,
    );
    expect(result.specialCases).not.toContain("real_estate_only");
  });
});

describe("calculateZakat – special case: unlikely_loans_push_above_nisab", () => {
  it("sets potentialZakat when unlikely loans push wealth above nisab", () => {
    const result = calculateZakat(
      baseInput({
        cash: [{ id: "c1", label: "نقد", amount: 5000 }],
        loansGiven: [
          { id: "l1", label: "قرض", amount: 6000, likelihood: "unlikely" },
        ],
      }),
      DEFAULT_PRICES,
    );
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    expect(result.isAboveNisab).toBe(false);
    expect(result.netZakatableWealth).toBeLessThan(nisab);
    expect(result.potentialZakat).toBeCloseTo((5000 + 6000) * 0.025);
    expect(result.specialCases).toContain("unlikely_loans_push_above_nisab");
  });

  it("does NOT set potentialZakat when unlikely loans still leave wealth below nisab", () => {
    const result = calculateZakat(
      baseInput({
        cash: [{ id: "c1", label: "نقد", amount: 10 }],
        loansGiven: [
          { id: "l1", label: "قرض", amount: 20, likelihood: "unlikely" },
        ],
      }),
      DEFAULT_PRICES,
    );
    expect(result.potentialZakat).toBeNull();
    expect(result.specialCases).not.toContain("unlikely_loans_push_above_nisab");
  });
});

describe("calculateZakat – unlikely loans excluded from annual total", () => {
  it("only includes likely loans in zakatable wealth", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        cash: [{ id: "c1", label: "نقد", amount: nisab + 1000 }],
        loansGiven: [
          { id: "l1", label: "قرض مرجح", amount: 500, likelihood: "likely" },
          { id: "l2", label: "قرض غير مرجح", amount: 99999, likelihood: "unlikely" },
        ],
      }),
      DEFAULT_PRICES,
    );
    expect(result.totalZakatableWealth).toBe(nisab + 1000 + 500);
  });
});

describe("calculateZakat – no special cases", () => {
  it("returns empty specialCases for standard mixed assets", () => {
    const nisab = calculateGoldNisab(DEFAULT_PRICES.goldPricePerGram21K);
    const result = calculateZakat(
      baseInput({
        cash: [{ id: "c1", label: "نقد", amount: nisab + 1000 }],
        stocks: [{ id: "st1", label: "أسهم", marketValue: 5000 }],
      }),
      DEFAULT_PRICES,
    );
    expect(result.specialCases).toEqual([]);
    expect(result.zakatDue).toBeGreaterThan(0);
  });
});
