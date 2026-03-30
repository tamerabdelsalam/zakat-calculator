<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Zakat Calculator — Agent Context

## Language & Direction
- Primary language: **Arabic** (`lang="ar"`, `dir="rtl"`)
- All user-facing text must be in Arabic
- Use **logical CSS properties** (start/end, not left/right)

## Domain
- This is a **zakat (Islamic alms) calculator** based on the Thndr specification
- Calculation rules are in `docs/zakat-rules-reference.md`
- Nine asset types, five special cases, purity-aware gold/silver
- Nisab threshold depends on gold price at the date wealth reached nisab

## Architecture
- Calculation engine: `src/lib/zakat/` — pure functions, no framework dependencies
- Price data: `src/lib/prices/` — server-side fetching with caching
- UI components: `src/components/calculator/` — domain forms and results
- Route handlers: `src/app/api/` — price data endpoints
