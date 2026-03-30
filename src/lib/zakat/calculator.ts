import {
  type ZakatInput,
  type ZakatResult,
  type AssetBreakdown,
  type SpecialCase,
  ZAKAT_RATE,
  GOLD_PURITY_RATIO,
  SILVER_PURITY_RATIO,
} from "./types";
import { ASSET_LABELS } from "./constants";
import { calculateGoldNisab, calculateSilverNisab } from "./nisab";

interface PriceContext {
  /** سعر جرام الذهب عيار ٢١ بالعملة المختارة — في تاريخ بلوغ النصاب */
  goldPricePerGram21K: number;
  /** سعر جرام الفضة عيار ٩٢٥ بالعملة المختارة */
  silverPricePerGram925: number;
  /** سعر جرام الذهب عيار ٢٤ الحالي (لحساب قيمة الذهب العيني) */
  currentGoldPricePerGram24K: number;
  /** سعر جرام الفضة عيار ٩٩٩ الحالي */
  currentSilverPricePerGram999: number;
}

/**
 * حساب الزكاة الكامل بناءً على المدخلات وأسعار المعادن.
 */
export function calculateZakat(
  input: ZakatInput,
  prices: PriceContext,
): ZakatResult {
  const breakdown: AssetBreakdown[] = [];

  const cashTotal = input.assets.cash.reduce((sum, e) => sum + e.amount, 0);
  if (cashTotal > 0) {
    breakdown.push({
      category: "cash",
      label: ASSET_LABELS.cash,
      amount: cashTotal,
    });
  }

  const stocksTotal = input.assets.stocks.reduce(
    (sum, e) => sum + e.marketValue,
    0,
  );
  if (stocksTotal > 0) {
    breakdown.push({
      category: "stocks",
      label: ASSET_LABELS.stocks,
      amount: stocksTotal,
    });
  }

  const certsTotal = input.assets.certificates.reduce(
    (sum, e) => sum + e.totalValue,
    0,
  );
  if (certsTotal > 0) {
    breakdown.push({
      category: "certificates",
      label: ASSET_LABELS.certificates,
      amount: certsTotal,
    });
  }

  const goldTotal = input.assets.gold.reduce((sum, e) => {
    const pureGrams = e.weightGrams * GOLD_PURITY_RATIO[e.purity];
    return sum + pureGrams * prices.currentGoldPricePerGram24K;
  }, 0);
  if (goldTotal > 0) {
    breakdown.push({
      category: "gold",
      label: ASSET_LABELS.gold,
      amount: goldTotal,
    });
  }

  const silverTotal = input.assets.silver.reduce((sum, e) => {
    const pureGrams = e.weightGrams * SILVER_PURITY_RATIO[e.purity];
    return sum + pureGrams * prices.currentSilverPricePerGram999;
  }, 0);
  if (silverTotal > 0) {
    breakdown.push({
      category: "silver",
      label: ASSET_LABELS.silver,
      amount: silverTotal,
    });
  }

  const realEstateTotal = input.assets.realEstate.reduce((sum, e) => {
    const zakatable = e.paidAmount ?? e.value;
    return sum + zakatable;
  }, 0);
  if (realEstateTotal > 0) {
    breakdown.push({
      category: "realEstate",
      label: ASSET_LABELS.realEstate,
      amount: realEstateTotal,
    });
  }

  const likelyLoansTotal = input.assets.loansGiven
    .filter((e) => e.likelihood === "likely")
    .reduce((sum, e) => sum + e.amount, 0);
  const unlikelyLoansTotal = input.assets.loansGiven
    .filter((e) => e.likelihood === "unlikely")
    .reduce((sum, e) => sum + e.amount, 0);
  if (likelyLoansTotal > 0) {
    breakdown.push({
      category: "loansGiven",
      label: ASSET_LABELS.loansGiven,
      amount: likelyLoansTotal,
    });
  }

  const commercialTotal = input.assets.commercial.reduce(
    (sum, e) => sum + e.value,
    0,
  );
  if (commercialTotal > 0) {
    breakdown.push({
      category: "commercial",
      label: ASSET_LABELS.commercial,
      amount: commercialTotal,
    });
  }

  const debtsTotal = input.assets.debts.reduce((sum, e) => sum + e.amount, 0);
  if (debtsTotal > 0) {
    breakdown.push({
      category: "debts",
      label: ASSET_LABELS.debts,
      amount: -debtsTotal,
    });
  }

  const totalZakatableWealth =
    cashTotal +
    stocksTotal +
    certsTotal +
    goldTotal +
    silverTotal +
    realEstateTotal +
    likelyLoansTotal +
    commercialTotal;

  const netZakatableWealth = totalZakatableWealth - debtsTotal;

  const goldNisab = calculateGoldNisab(prices.goldPricePerGram21K);
  const silverNisab = calculateSilverNisab(prices.silverPricePerGram925);

  const hasSilverOnly =
    silverTotal > 0 &&
    cashTotal === 0 &&
    stocksTotal === 0 &&
    certsTotal === 0 &&
    goldTotal === 0 &&
    realEstateTotal === 0 &&
    likelyLoansTotal === 0 &&
    commercialTotal === 0;

  const nisabThreshold = hasSilverOnly
    ? Math.min(goldNisab, silverNisab)
    : goldNisab;

  const isAboveNisab = netZakatableWealth >= nisabThreshold;
  const zakatRate = ZAKAT_RATE[input.yearType];

  let specialCaseApplied: SpecialCase = null;
  if (hasSilverOnly) specialCaseApplied = "silver_only";

  const zakatDue = isAboveNisab ? netZakatableWealth * zakatRate : 0;

  let potentialZakat: number | null = null;
  if (!isAboveNisab && unlikelyLoansTotal > 0) {
    const withUnlikely = netZakatableWealth + unlikelyLoansTotal;
    if (withUnlikely >= nisabThreshold) {
      potentialZakat = withUnlikely * zakatRate;
      specialCaseApplied = "unlikely_loans_push_above_nisab";
    }
  }

  return {
    totalZakatableWealth,
    totalDebts: debtsTotal,
    netZakatableWealth,
    nisabThreshold,
    isAboveNisab,
    zakatRate,
    zakatDue,
    potentialZakat,
    specialCaseApplied,
    breakdown,
  };
}
