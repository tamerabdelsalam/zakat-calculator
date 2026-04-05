import { describe, expect, it } from "vitest";
import {
  cashEntrySchema,
  stockEntrySchema,
  certificateEntrySchema,
  goldEntrySchema,
  silverEntrySchema,
  realEstateEntrySchema,
  loanGivenEntrySchema,
  commercialEntrySchema,
  debtEntrySchema,
  zakatInputSchema,
} from "./schemas";

describe("cashEntrySchema", () => {
  it("accepts valid cash entry", () => {
    const result = cashEntrySchema.safeParse({
      id: "c1",
      label: "نقد",
      amount: 1000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = cashEntrySchema.safeParse({
      id: "c1",
      label: "نقد",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = cashEntrySchema.safeParse({
      id: "c1",
      label: "نقد",
      amount: -100,
    });
    expect(result.success).toBe(false);
  });

  it("produces Arabic error messages", () => {
    const result = cashEntrySchema.safeParse({
      id: "",
      label: "",
      amount: -1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("مطلوب") || m.includes("أكبر من صفر"))).toBe(true);
    }
  });
});

describe("stockEntrySchema", () => {
  it("accepts valid stock entry", () => {
    const result = stockEntrySchema.safeParse({
      id: "s1",
      label: "أسهم",
      marketValue: 5000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing marketValue", () => {
    const result = stockEntrySchema.safeParse({ id: "s1", label: "أسهم" });
    expect(result.success).toBe(false);
  });
});

describe("certificateEntrySchema", () => {
  it("accepts valid certificate entry", () => {
    const result = certificateEntrySchema.safeParse({
      id: "cert1",
      label: "شهادة",
      totalValue: 10000,
      spendsReturnsOnly: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing spendsReturnsOnly", () => {
    const result = certificateEntrySchema.safeParse({
      id: "cert1",
      label: "شهادة",
      totalValue: 10000,
    });
    expect(result.success).toBe(false);
  });
});

describe("goldEntrySchema", () => {
  it("accepts valid gold entry with 21K purity", () => {
    const result = goldEntrySchema.safeParse({
      id: "g1",
      label: "ذهب",
      weightGrams: 50,
      purity: "21K",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid purity", () => {
    const result = goldEntrySchema.safeParse({
      id: "g1",
      label: "ذهب",
      weightGrams: 50,
      purity: "10K",
    });
    expect(result.success).toBe(false);
  });
});

describe("silverEntrySchema", () => {
  it("accepts valid silver entry", () => {
    const result = silverEntrySchema.safeParse({
      id: "sv1",
      label: "فضة",
      weightGrams: 100,
      purity: "925",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid purity", () => {
    const result = silverEntrySchema.safeParse({
      id: "sv1",
      label: "فضة",
      weightGrams: 100,
      purity: "800",
    });
    expect(result.success).toBe(false);
  });
});

describe("realEstateEntrySchema", () => {
  it("accepts entry with optional paidAmount", () => {
    const result = realEstateEntrySchema.safeParse({
      id: "re1",
      label: "عقار",
      value: 500000,
      purpose: "investment",
      paidAmount: 200000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts entry without paidAmount", () => {
    const result = realEstateEntrySchema.safeParse({
      id: "re1",
      label: "عقار",
      value: 500000,
      purpose: "trade",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid purpose", () => {
    const result = realEstateEntrySchema.safeParse({
      id: "re1",
      label: "عقار",
      value: 500000,
      purpose: "personal",
    });
    expect(result.success).toBe(false);
  });
});

describe("loanGivenEntrySchema", () => {
  it("accepts valid loan entry", () => {
    const result = loanGivenEntrySchema.safeParse({
      id: "l1",
      label: "قرض",
      amount: 3000,
      likelihood: "likely",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid likelihood", () => {
    const result = loanGivenEntrySchema.safeParse({
      id: "l1",
      label: "قرض",
      amount: 3000,
      likelihood: "maybe",
    });
    expect(result.success).toBe(false);
  });
});

describe("commercialEntrySchema", () => {
  it("accepts valid commercial entry", () => {
    const result = commercialEntrySchema.safeParse({
      id: "com1",
      label: "بضاعة",
      value: 20000,
    });
    expect(result.success).toBe(true);
  });
});

describe("debtEntrySchema", () => {
  it("accepts valid debt entry", () => {
    const result = debtEntrySchema.safeParse({
      id: "d1",
      label: "دين",
      amount: 5000,
    });
    expect(result.success).toBe(true);
  });
});

describe("zakatInputSchema", () => {
  it("accepts a complete valid input", () => {
    const result = zakatInputSchema.safeParse({
      yearType: "hijri",
      nisabDate: "2025-01-01",
      currency: "EGP",
      assets: {
        cash: [{ id: "c1", label: "نقد", amount: 10000 }],
        stocks: [],
        certificates: [],
        gold: [],
        silver: [],
        realEstate: [],
        loansGiven: [],
        commercial: [],
        debts: [],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nisabDate).toBeInstanceOf(Date);
    }
  });

  it("rejects unsupported currency", () => {
    const result = zakatInputSchema.safeParse({
      yearType: "hijri",
      nisabDate: "2025-01-01",
      currency: "XYZ",
      assets: {
        cash: [],
        stocks: [],
        certificates: [],
        gold: [],
        silver: [],
        realEstate: [],
        loansGiven: [],
        commercial: [],
        debts: [],
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("العملة غير مدعومة");
    }
  });

  it("rejects invalid yearType", () => {
    const result = zakatInputSchema.safeParse({
      yearType: "lunar",
      nisabDate: "2025-01-01",
      currency: "EGP",
      assets: {
        cash: [],
        stocks: [],
        certificates: [],
        gold: [],
        silver: [],
        realEstate: [],
        loansGiven: [],
        commercial: [],
        debts: [],
      },
    });
    expect(result.success).toBe(false);
  });

  it("coerces string dates to Date objects", () => {
    const result = zakatInputSchema.safeParse({
      yearType: "gregorian",
      nisabDate: "2025-06-15",
      currency: "SAR",
      assets: {
        cash: [],
        stocks: [],
        certificates: [],
        gold: [],
        silver: [],
        realEstate: [],
        loansGiven: [],
        commercial: [],
        debts: [],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nisabDate).toBeInstanceOf(Date);
    }
  });

  it("validates nested asset entries", () => {
    const result = zakatInputSchema.safeParse({
      yearType: "hijri",
      nisabDate: "2025-01-01",
      currency: "EGP",
      assets: {
        cash: [{ id: "c1", label: "نقد", amount: -100 }],
        stocks: [],
        certificates: [],
        gold: [],
        silver: [],
        realEstate: [],
        loansGiven: [],
        commercial: [],
        debts: [],
      },
    });
    expect(result.success).toBe(false);
  });
});
