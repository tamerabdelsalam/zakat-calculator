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
│   ├── layout/             # Header, Footer
│   ├── calculator/         # Domain: forms, stepper, results
│   ├── shared/             # ThemeToggle, PriceBar
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
- [ ] Zod validation schemas for all inputs
- [ ] Unit tests with Vitest
- [ ] Gold/silver purity conversion with auto-calculation

### Phase 3: Price Integration
- [ ] GoldAPI integration (gold & silver prices)
- [ ] ExchangeRate-API integration (currency rates)
- [ ] Server-side caching with TTL
- [ ] Fallback handling with user warnings
- [ ] Historical price lookup for nisab date

### Phase 4: UI — Calculator Form
- [ ] Multi-step form with stepper
- [ ] Asset entry forms (9 sections)
- [ ] Currency selector with Arabic labels
- [ ] Gold/silver purity selectors
- [ ] Year type selector (Hijri/Gregorian)
- [ ] Nisab date picker
- [ ] Real-time running total

### Phase 5: UI — Results & Polish
- [ ] Results card with breakdown
- [ ] Nisab status indicator
- [ ] Potential zakat display (special case 5)
- [ ] Price bar with live gold/silver/currency
- [ ] Dark mode
- [ ] Animations with framer-motion
- [ ] Local storage persistence
- [ ] Print/export results

### Phase 6: Production
- [ ] SEO & metadata (Arabic)
- [ ] OG images
- [ ] PWA setup (optional)
- [ ] Vercel deployment
- [ ] Error monitoring
- [ ] Analytics

## Domain Reference

Full zakat rules: [docs/zakat-rules-reference.md](./zakat-rules-reference.md)
