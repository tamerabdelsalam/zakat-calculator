import { describe, expect, it } from "vitest";

import { convertAmount, CurrencyConversionError } from "./convert";

const RATES: Record<string, number> = {
  USD: 1,
  EGP: 48.2,
  SAR: 3.75,
  CNY: 7.25,
};

describe("convertAmount", () => {
  it("returns the same amount when from === to", () => {
    expect(convertAmount(100, "EGP", "EGP", RATES)).toBe(100);
  });

  it("converts USD to EGP correctly", () => {
    expect(convertAmount(1, "USD", "EGP", RATES)).toBeCloseTo(48.2, 4);
  });

  it("converts EGP to USD (inverse)", () => {
    expect(convertAmount(48.2, "EGP", "USD", RATES)).toBeCloseTo(1, 4);
  });

  it("converts cross-rate (EGP to SAR) via USD pivot", () => {
    // 100 EGP / 48.2 = ~2.074 USD; 2.074 * 3.75 = ~7.78 SAR
    const result = convertAmount(100, "EGP", "SAR", RATES);
    expect(result).toBeCloseTo((100 / 48.2) * 3.75, 4);
  });

  it("converts CNY to EGP", () => {
    const result = convertAmount(100, "CNY", "EGP", RATES);
    expect(result).toBeCloseTo((100 / 7.25) * 48.2, 4);
  });

  it("throws CurrencyConversionError for unknown source currency", () => {
    expect(() => convertAmount(100, "XXX", "EGP", RATES)).toThrowError(
      CurrencyConversionError,
    );
    expect(() => convertAmount(100, "XXX", "EGP", RATES)).toThrow("XXX");
  });

  it("throws CurrencyConversionError for unknown target currency", () => {
    expect(() => convertAmount(100, "USD", "ZZZ", RATES)).toThrowError(
      CurrencyConversionError,
    );
    expect(() => convertAmount(100, "USD", "ZZZ", RATES)).toThrow("ZZZ");
  });

  it("throws for zero rate", () => {
    expect(() => convertAmount(100, "USD", "EGP", { ...RATES, EGP: 0 })).toThrowError(
      CurrencyConversionError,
    );
  });
});
