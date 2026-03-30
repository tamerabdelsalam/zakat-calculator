# حاسبة الزكاة — Zakat Calculator

احسب زكاة أموالك بسهولة ودقة — تغطي جميع أنواع الأصول مع أسعار الذهب والفضة والعملات المحدّثة يومياً.

## Tech Stack

- **Next.js 16** (App Router, React Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (PostCSS, CSS-first config)
- **shadcn/ui** (base-nova style)
- **Arabic-first** (`lang="ar"`, `dir="rtl"`, Cairo font)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run verify` | Run lint + typecheck + build (mirrors CI) |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

See `.env.example` for all available variables.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public pages
│   ├── api/prices/         # Price data endpoint
│   └── layout.tsx          # Root layout (Arabic, RTL)
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── calculator/         # Zakat calculator forms & results
│   ├── layout/             # Header, Footer
│   └── shared/             # Reusable widgets
└── lib/
    ├── zakat/              # Calculation engine (pure functions)
    ├── prices/             # Price data fetching & caching
    └── formatters.ts       # Arabic number/currency formatting
```

## Documentation

See [docs/](./docs/) for implementation plan, progress tracking, and zakat rules reference.

## CI

GitHub Actions runs on push/PR to `main`: lint → typecheck → build.
