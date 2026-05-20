import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "./zakat/constants";

// ─── Shared helpers ────────────────────────────────────

const requiredString = (field: string) =>
  z.string({ required_error: `${field} مطلوب` }).min(1, `${field} مطلوب`);

const positiveNumber = (field: string) =>
  z
    .number({ required_error: `${field} مطلوب` })
    .positive(`${field} يجب أن يكون أكبر من صفر`);

const nonNegativeNumber = (field: string) =>
  z
    .number({ required_error: `${field} مطلوب` })
    .nonnegative(`${field} يجب أن يكون صفر أو أكثر`);

// ─── Asset Entry Schemas ───────────────────────────────

export const cashEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  amount: positiveNumber("المبلغ"),
  currency: z.string().optional(),
});

export const stockEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  marketValue: positiveNumber("القيمة السوقية"),
  currency: z.string().optional(),
});

export const certificateEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  totalValue: positiveNumber("القيمة الإجمالية"),
  spendsReturnsOnly: z.boolean({
    required_error: "يرجى تحديد إذا كنت تنفق العوائد فقط",
  }),
  currency: z.string().optional(),
});

export const goldEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  weightGrams: positiveNumber("الوزن بالجرام"),
  purity: z.enum(["24K", "21K", "18K", "14K"], {
    required_error: "يرجى اختيار عيار الذهب",
    message: "عيار الذهب غير صالح",
  }),
});

export const silverEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  weightGrams: positiveNumber("الوزن بالجرام"),
  purity: z.enum(["999", "925"], {
    required_error: "يرجى اختيار عيار الفضة",
    message: "عيار الفضة غير صالح",
  }),
});

export const realEstateEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  value: positiveNumber("قيمة العقار"),
  purpose: z.enum(["investment", "trade"], {
    required_error: "يرجى تحديد غرض العقار",
    message: "غرض العقار غير صالح",
  }),
  paidAmount: nonNegativeNumber("المبلغ المدفوع").optional(),
});

export const loanGivenEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  amount: positiveNumber("مبلغ القرض"),
  likelihood: z.enum(["likely", "unlikely"], {
    required_error: "يرجى تحديد احتمالية السداد",
    message: "احتمالية السداد غير صالحة",
  }),
});

export const commercialEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  value: positiveNumber("قيمة الأصل التجاري"),
});

export const debtEntrySchema = z.object({
  id: requiredString("المعرّف"),
  label: requiredString("الوصف"),
  amount: positiveNumber("مبلغ الدين"),
});

// ─── Top-level Input Schema ────────────────────────────

export const zakatInputSchema = z.object({
  yearType: z.enum(["hijri", "gregorian"], {
    required_error: "يرجى اختيار نوع السنة",
    message: "نوع السنة غير صالح",
  }),
  nisabDate: z.coerce.date({
    required_error: "يرجى تحديد تاريخ بلوغ النصاب",
    message: "التاريخ غير صالح",
  }),
  currency: z
    .string({ required_error: "يرجى اختيار العملة" })
    .refine((val) => SUPPORTED_CURRENCIES.includes(val), {
      message: "العملة غير مدعومة",
    }),
  assets: z.object({
    cash: z.array(cashEntrySchema),
    stocks: z.array(stockEntrySchema),
    certificates: z.array(certificateEntrySchema),
    gold: z.array(goldEntrySchema),
    silver: z.array(silverEntrySchema),
    realEstate: z.array(realEstateEntrySchema),
    loansGiven: z.array(loanGivenEntrySchema),
    commercial: z.array(commercialEntrySchema),
    debts: z.array(debtEntrySchema),
  }),
});

// ─── Inferred Types ────────────────────────────────────

export type CashEntryInput = z.infer<typeof cashEntrySchema>;
export type StockEntryInput = z.infer<typeof stockEntrySchema>;
export type CertificateEntryInput = z.infer<typeof certificateEntrySchema>;
export type GoldEntryInput = z.infer<typeof goldEntrySchema>;
export type SilverEntryInput = z.infer<typeof silverEntrySchema>;
export type RealEstateEntryInput = z.infer<typeof realEstateEntrySchema>;
export type LoanGivenEntryInput = z.infer<typeof loanGivenEntrySchema>;
export type CommercialEntryInput = z.infer<typeof commercialEntrySchema>;
export type DebtEntryInput = z.infer<typeof debtEntrySchema>;
export type ZakatInputParsed = z.infer<typeof zakatInputSchema>;
