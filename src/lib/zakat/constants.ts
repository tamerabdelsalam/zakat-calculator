/** نصاب الذهب: ٨٥ جرام عيار ٢١ */
export const GOLD_NISAB_GRAMS = 85;
export const GOLD_NISAB_PURITY = "21K" as const;

/** نصاب الفضة: ٥٩٥ جرام عيار ٩٢٥ */
export const SILVER_NISAB_GRAMS = 595;
export const SILVER_NISAB_PURITY = "925" as const;

/** أسماء أنواع الأصول بالعربية */
export const ASSET_LABELS = {
  cash: "النقد والأرصدة البنكية",
  stocks: "الأسهم والصناديق",
  certificates: "الشهادات البنكية",
  gold: "الذهب العيني",
  silver: "الفضة العينية",
  realEstate: "العقارات",
  loansGiven: "الأموال المُقرضة للغير",
  commercial: "الأصول التجارية (عروض التجارة)",
  debts: "الديون (أموال مستحقة عليك)",
} as const;

/** أسماء العملات بالعربية */
export const CURRENCY_LABELS: Record<string, string> = {
  EGP: "جنيه مصري",
  SAR: "ريال سعودي",
  AED: "درهم إماراتي",
  KWD: "دينار كويتي",
  QAR: "ريال قطري",
  BHD: "دينار بحريني",
  OMR: "ريال عماني",
  JOD: "دينار أردني",
  USD: "دولار أمريكي",
  EUR: "يورو",
  GBP: "جنيه إسترليني",
  TRY: "ليرة تركية",
  PKR: "روبية باكستانية",
  IDR: "روبية إندونيسية",
  INR: "روبية هندية",
  MYR: "رينغيت ماليزي",
  CNY: "يوان صيني",
};

/** قائمة العملات المدعومة */
export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_LABELS);
