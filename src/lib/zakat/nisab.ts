import { GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS } from "./constants";
import { GOLD_PURITY_RATIO, SILVER_PURITY_RATIO } from "./types";

/**
 * حساب قيمة نصاب الذهب بالعملة المحلية.
 * النصاب = ٨٥ جرام × سعر جرام الذهب عيار ٢١
 */
export function calculateGoldNisab(goldPricePerGram21K: number): number {
  return GOLD_NISAB_GRAMS * goldPricePerGram21K;
}

/**
 * حساب قيمة نصاب الفضة بالعملة المحلية.
 * النصاب = ٥٩٥ جرام × سعر جرام الفضة عيار ٩٢٥
 */
export function calculateSilverNisab(silverPricePerGram925: number): number {
  return SILVER_NISAB_GRAMS * silverPricePerGram925;
}

/**
 * تحويل وزن الذهب من أي عيار إلى ذهب خالص (٢٤ قيراط).
 */
export function goldToPureGrams(
  weightGrams: number,
  purity: keyof typeof GOLD_PURITY_RATIO,
): number {
  return weightGrams * GOLD_PURITY_RATIO[purity];
}

/**
 * تحويل وزن الفضة من أي عيار إلى فضة خالصة (٩٩٩).
 */
export function silverToPureGrams(
  weightGrams: number,
  purity: keyof typeof SILVER_PURITY_RATIO,
): number {
  return weightGrams * SILVER_PURITY_RATIO[purity];
}

/**
 * تحويل سعر جرام ذهب ٢٤ إلى سعر عيار ٢١ (للنصاب).
 */
export function gold24KTo21KPrice(pricePerGram24K: number): number {
  return pricePerGram24K * GOLD_PURITY_RATIO["21K"];
}
