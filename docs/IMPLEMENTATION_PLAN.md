# Implementation Plan

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (PostCSS, CSS-first) |
| UI Components | shadcn/ui (base-nova), lucide-react |
| Motion | framer-motion |
| Theming | next-themes |
| Validation | Zod |
| Formatting | Intl APIs (ar-SA locale) |
| CI | GitHub Actions (lint → typecheck → build) |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public pages (calculator, guide)
│   ├── api/prices/         # Price data endpoint
│   ├── layout.tsx          # Root: Arabic font, RTL, theme
│   └── globals.css         # Tailwind v4 theme tokens
├── components/
│   ├── ui/                 # shadcn primitives
│   ├── layout/             # Header, Footer (language toggle, dark mode)
│   ├── calculator/         # Domain: wizard steps, forms, results
│   ├── shared/             # ThemeToggle, PriceBar, LanguageToggle
│   └── providers/          # ThemeProvider
└── lib/
    ├── zakat/              # Pure calculation engine
    │   ├── types.ts        # All interfaces & constants
    │   ├── calculator.ts   # Main calculation
    │   ├── nisab.ts        # Nisab threshold logic
    │   └── constants.ts    # Arabic labels, currencies
    ├── prices/             # Price data layer
    │   ├── fetcher.ts      # API integration
    │   ├── cache.ts        # Server-side caching
    │   └── types.ts        # Price interfaces
    ├── formatters.ts       # Intl-based formatting
    ├── schemas.ts          # Zod validation schemas
    └── utils.ts            # cn() utility
```

## Calculator UX Flow

The calculator uses a **sequential wizard** pattern. Only calculation-relevant
inputs are wizard steps; app-level preferences (language, dark mode) live in
the header.

```
Header:  حاسبة الزكاة                           🌙  🌐 AR ▾

Step 1 — العملة
         Currency selector (EGP default). Locks denomination for all
         subsequent steps. Changing later warns and clears entered values.

Step 2 — نوع السنة
         هجرية (٢.٥٪) / ميلادية (٢.٥٧٧٪)

Step 3 — تاريخ بلوغ النصاب
         Date picker (default: one year ago).
         Triggers gold price lookup at that date for nisab calculation.

Step 4 — أنواع الأصول (checklist)
         Multi-select cards for all 9 asset types with icons and
         one-line Arabic descriptions. User checks which types they own.
         Unchecked types are explicitly absent — enables special case
         detection (silver-only, real-estate-only, returns-only).

Steps 5–N — إدخال الأصول (sequential forms)
         One form per checked asset type, in order.
         Each supports multiple entries ("أضف إدخالاً").
         Running total shown in sticky bottom bar.
         Progress indicator shows remaining asset types.
         Back/forward navigation between steps.

Final — النتيجة
         Results card: total zakatable wealth, nisab status,
         zakat due, potential zakat (special case 5), breakdown
         per asset category. Includes religious disclaimer and
         "ابدأ من جديد" reset button.
```

### Why checklist-then-forms?

- **Accuracy:** Special cases (silver-only, real-estate-only, returns-only)
  depend on the *absence* of other asset types. A checklist makes absence
  explicit — the engine knows exactly what's present and what isn't.
- **UX:** Users see all 9 types at the checklist (nothing hidden), but only
  fill forms for what they own (no overwhelm). Better than a single long
  scrollable form or a tedious yes/no interrogation.

### App-level settings (not wizard steps)

- **Language** (AR default, EN optional) — header toggle, not a step
- **Dark mode** — header toggle

## Design Principles

### Mobile-first responsive design

The primary audience will use this on phones. Every wizard step, form, and
results view must work well on 375px screens. Design mobile layout first,
then enhance for desktop. Use Tailwind responsive prefixes (`sm:`, `md:`)
to add desktop enhancements.

### Wizard state management

Wizard state (currency, year type, nisab date, selected asset types, all
entered values) is managed via React Context + `useReducer`. The reducer
handles step transitions, asset entry CRUD, and reset. State shape mirrors
`ZakatInput` from `lib/zakat/types.ts`. Local storage sync is a separate
concern layered on top.

### Privacy — client-side calculations

All zakat calculations run in the browser. No financial data is sent to the
server. The only server call is `/api/prices` for gold/silver/currency rates.
Display a visible trust signal: "بياناتك لا تغادر جهازك" (your data stays
on your device).

### Accessibility

- Keyboard navigation between wizard steps (Enter to advance, Escape to go back)
- Focus management: auto-focus first input when entering a new step
- ARIA labels on all form controls (Arabic)
- Screen-reader announcements on step transitions and results
- Sufficient color contrast in both light and dark themes

### Validation UX

- Inline Arabic error messages below invalid fields
- Prevent negative values and non-numeric input
- Validate on blur, not on every keystroke
- Show summary of errors before allowing "التالي" (next)
- All error text in Arabic (e.g. "أدخل قيمة صحيحة", "هذا الحقل مطلوب")

### Religious disclaimer

Display on the results page and the landing page:

> هذه الحاسبة تغطي الحالات العامة والشائعة.
> يرجى التواصل مع جهة أو دار فتوى شرعية حتى تتحقق من شروط وضوابط الزكاة الواجبة.

This is stronger than the Thndr wording — it explicitly directs users to
an official fatwa authority rather than a generic "qualified scholar".

## Phases

### Phase 1: Foundation ✅
- [x] Project scaffold (Next.js 16, TypeScript, Tailwind v4)
- [x] Mirror portfolio-blog configs (ESLint, Prettier, PostCSS, CI)
- [x] Arabic RTL setup (Cairo font, dir=rtl, lang=ar)
- [x] shadcn/ui configuration
- [x] Cursor rules & AGENTS.md
- [x] Documentation structure
- [x] Domain types & calculation engine scaffold
- [x] Price data layer scaffold

### Phase 2: Calculation Engine
- [ ] Complete calculator with all 9 asset types
- [ ] Implement all 5 special cases
- [ ] Zod validation schemas for all inputs (with Arabic error messages)
- [ ] Unit tests with Vitest
- [ ] Gold/silver purity conversion with auto-calculation

### Phase 3: Price Integration
- [ ] GoldAPI integration (gold & silver prices)
- [ ] ExchangeRate-API integration (currency rates)
- [ ] Server-side caching with TTL
- [ ] Fallback handling with user warnings
- [ ] Historical price lookup for nisab date

### Phase 4: UI — Calculator Wizard
- [ ] App shell: Header with language toggle, dark mode, price bar
- [ ] Wizard state management (React Context + useReducer)
- [ ] Wizard stepper component with back/forward navigation
- [ ] Step 1: Currency selector (EGP default, warns on change)
- [ ] Step 2: Year type selector (Hijri/Gregorian)
- [ ] Step 3: Nisab date picker
- [ ] Step 4: Asset type checklist (9 types, multi-select cards)
- [ ] Step 5–N: Asset entry forms (one per checked type)
  - [ ] Cash & bank balances form
  - [ ] Stocks & funds form
  - [ ] Bank certificates form (with returns-only toggle)
  - [ ] Physical gold form (purity selector: 24/21/18/14K)
  - [ ] Physical silver form (purity selector: 999/925, auto-convert)
  - [ ] Real estate form (with installment handling)
  - [ ] Loans given form (with likelihood toggle)
  - [ ] Commercial assets form
  - [ ] Debts form
- [ ] Inline validation with Arabic error messages
- [ ] Running total in sticky bottom bar
- [ ] Progress indicator
- [ ] Mobile-first responsive layout for all steps
- [ ] Keyboard navigation and focus management between steps

### Phase 5: UI — Results & Polish
- [ ] Results card with per-category breakdown
- [ ] Nisab status indicator (above/below)
- [ ] Special case messages (Arabic)
- [ ] Potential zakat display (special case 5)
- [ ] Religious disclaimer on results page
- [ ] Privacy statement ("بياناتك لا تغادر جهازك")
- [ ] Reset wizard ("ابدأ من جديد") button
- [ ] Price bar with live gold/silver in user's currency
- [ ] Dark mode toggle
- [ ] Animations with framer-motion
- [ ] Local storage persistence (save/restore wizard state)
- [ ] Print/export results
- [ ] Guide page (zakat rules explanation, per-asset-type help)

### Phase 6: Production
- [ ] Arabic SEO metadata
- [ ] OG images
- [ ] Accessibility audit (keyboard, screen reader, contrast)
- [ ] PWA setup (optional)
- [ ] Vercel deployment
- [ ] Error monitoring
- [ ] Analytics

## Domain Reference

Full zakat rules: [docs/zakat-rules-reference.md](./zakat-rules-reference.md)
