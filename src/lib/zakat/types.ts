/** السنة الهجرية أو الميلادية */
export type YearType = "hijri" | "gregorian";

/** نسبة الزكاة حسب نوع السنة */
export const ZAKAT_RATE: Record<YearType, number> = {
  hijri: 0.025,
  gregorian: 0.02577,
};

/** عيارات الذهب المدعومة */
export type GoldPurity = "24K" | "21K" | "18K" | "14K";

/** نسبة الذهب الخالص حسب العيار */
export const GOLD_PURITY_RATIO: Record<GoldPurity, number> = {
  "24K": 1.0,
  "21K": 0.875,
  "18K": 0.75,
  "14K": 0.583,
};

/** عيارات الفضة المدعومة */
export type SilverPurity = "999" | "925";

/** نسبة الفضة الخالصة حسب العيار */
export const SILVER_PURITY_RATIO: Record<SilverPurity, number> = {
  "999": 1.0,
  "925": 0.925,
};

/** حالة القرض — هل يُرجح سداده؟ */
export type LoanLikelihood = "likely" | "unlikely";

/** غرض العقار */
export type RealEstatePurpose = "investment" | "trade";

// ─── Asset Entries ─────────────────────────────────────

export interface CashEntry {
  id: string;
  label: string;
  amount: number;
}

export interface StockEntry {
  id: string;
  label: string;
  marketValue: number;
}

export interface CertificateEntry {
  id: string;
  label: string;
  totalValue: number;
  spendsReturnsOnly: boolean;
}

export interface GoldEntry {
  id: string;
  label: string;
  weightGrams: number;
  purity: GoldPurity;
}

export interface SilverEntry {
  id: string;
  label: string;
  weightGrams: number;
  purity: SilverPurity;
}

export interface RealEstateEntry {
  id: string;
  label: string;
  value: number;
  purpose: RealEstatePurpose;
  paidAmount?: number;
}

export interface LoanGivenEntry {
  id: string;
  label: string;
  amount: number;
  likelihood: LoanLikelihood;
}

export interface CommercialEntry {
  id: string;
  label: string;
  value: number;
}

export interface DebtEntry {
  id: string;
  label: string;
  amount: number;
}

// ─── Aggregated Input / Output ─────────────────────────

export interface ZakatInput {
  yearType: YearType;
  nisabDate: Date;
  currency: string;
  assets: {
    cash: CashEntry[];
    stocks: StockEntry[];
    certificates: CertificateEntry[];
    gold: GoldEntry[];
    silver: SilverEntry[];
    realEstate: RealEstateEntry[];
    loansGiven: LoanGivenEntry[];
    commercial: CommercialEntry[];
    debts: DebtEntry[];
  };
}

export interface AssetBreakdown {
  category: string;
  label: string;
  amount: number;
}

/**
 * Formerly `SpecialCase` (single value | null). Renamed to `SpecialCaseKey`
 * and moved to an array (`ZakatResult.specialCases`) so multiple flags can
 * coexist (e.g. silver_only + unlikely_loans_push_above_nisab).
 */
export type SpecialCaseKey =
  | "returns_only"
  | "silver_only"
  | "real_estate_only"
  | "unlikely_loans_push_above_nisab";

export interface ZakatResult {
  totalZakatableWealth: number;
  totalDebts: number;
  netZakatableWealth: number;
  nisabThreshold: number;
  isAboveNisab: boolean;
  zakatRate: number;
  zakatDue: number;
  potentialZakat: number | null;
  specialCases: SpecialCaseKey[];
  breakdown: AssetBreakdown[];
}
