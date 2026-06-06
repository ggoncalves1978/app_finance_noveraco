# CLAUDE.md — Novera Co. Financial Platform

Internal financial management platform. Stack: Next.js 16 + Supabase + Prisma + shadcn/ui + TailwindCSS + Vercel.

## Current Status
- ✅ Fase 1 — Fundação (auth, layout, seed)
- ✅ Fase 2 — Precificação (calculator, history, comparison, CSV export)
- ✅ Fase 3 — Vendas (KPIs, charts, orders CRUD, filters)
- 🚀 Fase 4 — SEO & Deploy (SEO panel done; AI content analysis, integrations, deploy pending)

## Dev Commands
```bash
npm run dev / build / lint / type-check
npx prisma migrate dev | db seed | studio
```

## Architecture
```
app/(auth)/login          → Supabase Auth
app/(dashboard)/
  dashboard/precificacao/ → Fase 2 (pricing)
  dashboard/vendas/       → Fase 3 (sales)
  dashboard/seo/          → Fase 4 (SEO)
api/pricings/             → CRUD + calculate + compare
api/orders/               → CRUD + status update
lib/pricing/calculator.ts → PricingCalculator
middleware.ts             → JWT verify + redirect
prisma/schema.prisma      → 11 tables + RLS
```

## Key Patterns

**Auth** — always check first in API routes:
```typescript
const { data: { user } } = await supabase.auth.getUser()
const profile = await prisma.user.findUnique({ where: { id: user.id } })
```

**Forms** — `react-hook-form` + `zod` resolver  
**Components** — `'use client'` for interactive; server components for data fetching  
**DB** — all queries filtered by `organizationId`; Decimal → Number for frontend  
**Styling** — Tailwind + shadcn/ui; green=profit, red=loss, blue=revenue, purple=margins

## Pricing Formula
```
Price = (Cost + Freight + Fixed Fee) / (1 - Commission% - Tax% - Margin%)
```
Margin: 5–100%. Platforms: Mercado Livre, Shopee, Amazon, Site Próprio.

## Security
- JWT in httpOnly cookies (8h expiry)
- RLS on all Supabase tables
- Rate limiting on auth (10/h via Upstash Redis)
- Audit logs on all writes
- CSP + HSTS + X-Frame-Options in `next.config.ts`

## Seed Data
1 org (Novera Co.) · 1 admin (admin@novera.com) · 5 platform configs · 16 products (SKUs: `102ATELIE`, `800CLASS00`, `800NOBLES00`, `CCABEACH00`, etc.)

## Reference Docs
See `REFERENCE.md` for: full DB schema, complete API routes, component inventory, phase details, and skill file locations.
