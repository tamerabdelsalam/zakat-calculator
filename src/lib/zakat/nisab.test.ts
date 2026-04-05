import { describe, expect, it } from "vitest";
import {
  calculateGoldNisab,
  calculateSilverNisab,
  gold24KTo21KPrice,
  goldToPureGrams,
  silverToPureGrams,
  convertSilverPrice,
} from "./nisab";
import { GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS } from "./constants";

describe("calculateGoldNisab", () => {
  it("multiplies nisab grams by 21K price per gram", () => {
    expect(calculateGoldNisab(100)).toBe(GOLD_NISAB_GRAMS * 100);
  });
});

describe("calculateSilverNisab", () => {
  it("multiplies nisab grams by 925 price per gram", () => {
    expect(calculateSilverNisab(2)).toBe(SILVER_NISAB_GRAMS * 2);
  });
});

describe("goldToPureGrams", () => {
  it("converts 21K weight to pure gold", () => {
    expect(goldToPureGrams(100, "21K")).toBeCloseTo(87.5);
  });
});

describe("silverToPureGrams", () => {
  it("converts 925 weight to pure silver fraction", () => {
    expect(silverToPureGrams(100, "925")).toBeCloseTo(92.5);
  });
});

describe("gold24KTo21KPrice", () => {
  it("scales 24K gram price to 21K", () => {
    expect(gold24KTo21KPrice(100)).toBeCloseTo(87.5);
  });
});

describe("convertSilverPrice", () => {
  it("converts 999 price to 925", () => {
    expect(convertSilverPrice(100, "999", "925")).toBeCloseTo(92.5);
  });

  it("converts 925 price to 999", () => {
    expect(convertSilverPrice(92.5, "925", "999")).toBeCloseTo(100);
  });

  it("returns same price when purities match", () => {
    expect(convertSilverPrice(50, "999", "999")).toBe(50);
    expect(convertSilverPrice(50, "925", "925")).toBe(50);
  });
});
