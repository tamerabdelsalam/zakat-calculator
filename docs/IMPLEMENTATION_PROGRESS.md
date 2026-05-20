# Implementation Progress

### Phase 1 — Foundation ✅

- [x] Next.js 16 + TypeScript + Tailwind v4 scaffold
- [x] ESLint flat config (core-web-vitals + typescript + prettier)
- [x] Prettier configuration
- [x] PostCSS with @tailwindcss/postcss
- [x] tsconfig with strict mode and @/* alias
- [x] GitHub Actions CI (lint → typecheck → build)
- [x] Arabic RTL root layout (Cairo font, dir=rtl, lang=ar)
- [x] shadcn/ui components.json (base-nova, RTL enabled)
- [x] Theme provider (next-themes)
- [x] globals.css with shadcn tokens
- [x] Cursor rules (RTL, routes, components, prices, domain)
- [x] AGENTS.md
- [x] Zakat domain types and calculation engine
- [x] Price data layer (types, daily snapshot, fetcher, API route)
- [x] Formatters (currency, number, weight, date)
- [x] Zakat rules reference documentation
- [x] .env.example
- [x] .gitignore
- [x] Landing page placeholder
- [x] continue-from-plan command + progress script

### Phase 2 — Calculation Engine

- [x] Complete all 5 special cases in calculator
- [x] Zod validation schemas (with Arabic error messages)
- [x] Vitest setup and unit tests
- [x] Silver auto-conversion between purities

### Phase 3 — Price Integration

- [x] GoldAPI.io integration
- [x] ExchangeRate-API integration
- [x] Historical gold price for nisab date
- [x] Prices-unavailable / error state in UI (Arabic) when /api/prices returns 503

### Phase 4 — UI: Calculator Wizard

#### 4.1 App Shell
- [x] Header with logo, language toggle (AR/EN), dark mode toggle
- [x] Price bar (live gold/silver in user's currency)
- [x] Footer
- [x] Mobile-first responsive layout

#### 4.2 Wizard Framework
- [x] Wizard state management (React Context + useReducer)
- [x] Wizard stepper component (step indicator, back/forward)
- [x] Keyboard navigation and focus management between steps
- [x] Step 1: Currency selector — v1: عملة واحدة للمعالج والنتائج (افتراضي EGP؛ تحذير عند التغيير بعد الإدخال)
- [x] Step 2: Year type selector (Hijri/Gregorian)
- [x] Step 3: Nisab date picker (default: one year ago)
- [x] Step 4: Asset type checklist (9 types, multi-select cards with icons)

#### 4.3 Asset Entry Forms
- [x] Cash & bank balances form
- [x] Stocks & funds form
- [ ] Bank certificates form (with returns-only toggle)
- [ ] Physical gold form (purity selector: 24/21/18/14K)
- [ ] Physical silver form (purity selector: 999/925, auto-convert)
- [ ] Real estate form (with installment handling)
- [ ] Loans given form (with likelihood toggle)
- [ ] Commercial assets form
- [ ] Debts form
- [ ] Inline validation with Arabic error messages
- [ ] Running total in sticky bottom bar
- [ ] Progress indicator for remaining asset types
- [ ] *(متابعة)* عملة اختيارية لكل أصل/سطر: القائمة تُعاد افتراضياً لعملة الخطوة ١، والتحويل للعملة الرئيسية عبر أسعار اللقطة (بدون طلب API لكل سطر)
  - أُضيف CNY إلى `SUPPORTED_CURRENCIES` + `CURRENCY_LABELS` وتم إعادة بناء `price-snapshot.json` ✅
  - الأساس الجاهز للتوصيل عند بناء نماذج الإدخال:
    - `src/lib/prices/convert.ts` — دالة `convertAmount` نقية (بدون fetch)
    - `src/components/shared/currency-select.tsx` — قائمة منسدلة بحث مدعومة بـ Base UI (تُستخدم في الخطوة ١، وتُعاد استخدامها في الأسطر)
    - `src/components/shared/use-snapshot-rates.ts` — hook يجلب جدول أسعار الصرف مرة واحدة

### Phase 5 — UI: Results & Polish

#### 5.1 Results Display
- [ ] Results card with per-category breakdown
- [ ] Nisab status indicator (above/below)
- [ ] Special case messages (Arabic)
- [ ] Potential zakat display (special case 5)
- [ ] Religious disclaimer
- [ ] Privacy statement ("بياناتك لا تغادر جهازك")
- [ ] Reset wizard ("ابدأ من جديد") button

#### 5.2 App Polish
- [ ] Dark mode toggle
- [ ] Animations with framer-motion
- [ ] Local storage persistence (save/restore wizard state)
- [ ] Print/export results

#### 5.3 Guide Page
- [ ] Zakat rules explanation page (Arabic content from reference)
- [ ] Per-asset-type help sections

### Phase 6 — Production

- [ ] Arabic SEO metadata
- [ ] OG images
- [ ] Accessibility audit (keyboard, screen reader, contrast)
- [ ] Vercel deployment
- [ ] Error monitoring
