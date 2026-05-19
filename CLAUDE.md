# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal financial management platform for **Novera Co.**, a Brazilian e-commerce seller. The app covers three core modules: product pricing, sales tracking, and SEO/campaign management. The project is currently in **Fase 2 — Precificação (em andamento)**.

## Implementation Progress

### Fase 1 — Fundação (Semana 1–2)
- [x] **Passo 1** — Scaffold Next.js 16 + shadcn/ui + TailwindCSS (concluído 2026-05-08)
  - Next.js 16.2.6 + React 19 + TypeScript scaffolded
  - shadcn/ui 4.7 inicializado (`components/ui/button.tsx`)
  - Todas as dependências instaladas: Prisma, Supabase, TanStack Query, Zustand, React Hook Form, Zod, Recharts, Upstash Redis, Pino
  - `next.config.ts` com headers de segurança (CSP, HSTS, X-Frame-Options)
  - `prisma/schema.prisma` configurado com PostgreSQL (Supabase)
  - `.env.local` criado com placeholders (requer credenciais Supabase reais)
  - Servidor de dev funcional em `localhost:3000`
- [x] **Passo 2** — Configurar Supabase (concluído 2026-05-16)
- [x] **Passo 3** — Schema do banco de dados + migrations (11 tabelas) (concluído 2026-05-16)
- [x] **Passo 4** — Ativar RLS em todas as tabelas (concluído 2026-05-16)
- [x] **Passo 5** — Sistema de autenticação (login/logout/proxy middleware) (concluído 2026-05-16)
- [x] **Passo 6** — Layout base (Sidebar + Header) (concluído 2026-05-16)
- [x] **Passo 7** — Seed de produtos e configurações de plataforma (concluído 2026-05-16)

### Fase 2 — Precificação (Semana 3–4) — em andamento
### Fase 3 — Vendas (Semana 5–6) — pendente
### Fase 4 — SEO & Deploy (Semana 7–8) — pendente

## Technology Stack

- **Framework**: Next.js 16.2.6 (App Router, server components, API routes)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **ORM**: Prisma
- **Auth**: Supabase Auth with JWT (httpOnly cookies, 8-hour expiry)
- **UI**: shadcn/ui + TailwindCSS
- **Forms**: React Hook Form + Zod
- **State/Data**: TanStack Query or Zustand
- **Charts**: Recharts or Chart.js
- **Rate Limiting/Cache**: Upstash Redis
- **Hosting**: Vercel

## Development Commands

```bash
npm run dev             # Start dev server at localhost:3000
npm run build           # Production build
npm run lint            # ESLint
npm run type-check      # TypeScript check
npm test                # Jest unit tests
npx prisma migrate dev  # Run DB migrations
npx prisma db seed      # Seed with Novera Co. data
npx prisma studio       # Visual DB browser
```

## Architecture

```
app/
├── (auth)/login/          → Login page (Supabase Auth)
├── (dashboard)/
│   ├── layout.tsx         → Sidebar + Header shell
│   ├── page.tsx           → Overview dashboard
│   ├── precificacao/      → Pricing calculator + history
│   ├── vendas/            → Sales KPIs + order entry
│   ├── seo/               → Campaigns, keywords, content
│   └── configuracoes/     → Admin settings
api/
├── auth/                  → Login/logout routes
├── pricings/calculate/    → Pricing calculation endpoint
├── pricings/compare/      → Multi-platform comparison
└── orders/                → Order CRUD
lib/
├── auth/                  → JWT handling, RBAC (admin/operador/visualizador)
├── pricing/               → PricingCalculator class
└── validations/           → Zod schemas
middleware.ts              → JWT verification + redirect logic
prisma/schema.prisma       → 11-table schema
```

### Pricing Formula

```
Price = (Cost + Freight + Fixed Fee) / (1 - Commission% - Tax% - Margin%)
```

Supports four platforms: Mercado Livre, Shopee, Amazon, Site Próprio. Margin must be between 5–100%.

### Database Schema (11 tables)

`organizations` → `users` (RBAC) → `products` → `pricings` (pricing history)  
`platform_configs` → pricing per platform  
`orders` → `order_items` (sales tracking)  
`seo_campaigns` → `seo_keywords`, `seo_content_audits`  
`audit_logs` → all critical actions

All tables use RLS so users only access their own organization's data.

### Security Model

- JWT in httpOnly cookies (no localStorage)
- Row Level Security on all Supabase tables
- Rate limiting on auth routes (10 attempts/hour via Upstash Redis)
- Audit logging on all write operations
- CSP + HSTS + X-Frame-Options headers in `next.config.js`
- All DB access via Prisma (prepared statements, no raw interpolation)

## Key Reference Documents

| File | Purpose |
|------|---------|
| `MVP_NoveraCo.md` | Complete requirements, stack decisions, DB schema, security spec, deployment checklist (~1000 lines) |
| `skills/database-schema-novera/SKILL.md` | Full SQL schema with RLS policies, indexes, seed data (16 products) |
| `skills/seguranca-autenticacao-novera/SKILL.md` | Auth middleware, RBAC, rate limiting, security headers |
| `skills/modulo-precificacao-builder/SKILL.md` | PricingCalculator class, API routes, React components, unit tests |
| `skills/README.md` | 4-week implementation roadmap |
| `skills/COMO_USAR.md` | Quick-start guide and prompt templates for building each module |

## Seed Data

The database seed includes 1 org (Novera Co.), 1 admin user, 5 platform configs, and 16 real products (e.g., `102ATELIE`, `800CLASS00`, `800NOBLES00`, `CCABEACH00`). Product codes come from the existing pricing spreadsheet used by the business.
