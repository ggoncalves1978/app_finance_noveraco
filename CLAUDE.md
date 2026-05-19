# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal financial management platform for **Novera Co.**, a Brazilian e-commerce seller. The app covers three core modules: product pricing, sales tracking, and SEO/campaign management. The project is currently in **Fase 3 — Vendas (em andamento)**.

## Implementation Progress

### Fase 1 — Fundação (Semana 1–2) ✅ Concluída
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

### Fase 2 — Precificação (Semana 3–4) ✅ Concluída (2026-05-19)
- [x] **Dashboard de Precificação** — Página overview com KPI cards (total, lucro médio, margem média, lucro total)
- [x] **Calculadora de Precificação** — Form com live preview, suporte a 5 plataformas, validação de margem (5-100%)
- [x] **Tabela de Histórico** — CRUD completo (criar, ler, editar, deletar), paginação (50 itens/página)
- [x] **Clonagem de Precificação** — Duplicar precificações existentes com um clique
- [x] **Exportação CSV** — Baixar tabela completa com formatação de moeda
- [x] **Comparação Multi-Plataforma** — Side-by-side cards coloridos mostrando preço/lucro/margem por plataforma
- [x] **UX Enhancements** — Error handling, validações em português, loading states, visual feedback
- [x] **Commit Fase 2** — Concluído em commit 875950f

### Fase 3 — Vendas (Semana 5–6) 🚀 Em Andamento (iniciado 2026-05-19)
- [x] **Dashboard de KPIs** — 4 cards: Receita Bruta, Lucro Líquido, Margem Média, Total de Pedidos (mês atual)
- [x] **Gráficos** — Receita vs Lucro (6 meses) + Distribuição por Plataforma (pie chart)
- [x] **Tabela de Pedidos** — Colunas: data, ID, plataforma, produtos, cliente, receita, lucro, margem, status, ações
- [x] **Filtros Avançados** — Plataforma, Status, Date range, Busca por ID/Cliente, display de filtros ativos
- [x] **Status Management** — Alterar status (Pendente → Pago → Enviado → Entregue → etc.) com confirmação
- [x] **Operações CRUD** — Delete pedidos com confirmação, update status, paginação (25 itens/página)
- [x] **UX Enhancements** — Grid responsivo para filtros, cards com gradients, ícones semânticos
- [x] **Commit Fase 3** — Concluído em commit 3ffdf76

### Fase 4 — SEO & Deploy (Semana 7–8) — Pendente

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
├── (auth)/
│   ├── login/             → Login page (Supabase Auth)
│   ├── login/esqueci-senha/ → Password recovery
│   └── layout.tsx         → Auth layout
├── (dashboard)/
│   ├── layout.tsx         → Sidebar + Header shell
│   ├── page.tsx           → Overview dashboard (redirect)
│   ├── dashboard/
│   │   ├── page.tsx       → Dashboard overview
│   │   ├── precificacao/  → Pricing module (Fase 2)
│   │   │   ├── page.tsx   → Pricing overview with KPIs
│   │   │   ├── nova/      → Create new pricing
│   │   │   ├── [id]/editar/ → Edit pricing
│   │   │   └── comparar/  → Multi-platform comparison
│   │   ├── vendas/        → Sales module (Fase 3)
│   │   │   ├── page.tsx   → Sales dashboard with KPIs + charts + orders table
│   │   │   └── novo/      → Create new order
│   │   └── seo/           → SEO module (Fase 4 - pending)
│   └── layout.tsx         → Dashboard layout with sidebar
api/
├── auth/logout/           → Logout route
├── pricings/              → Pricing CRUD
│   ├── route.ts           → GET list, POST create
│   ├── calculate/         → POST calculate pricing
│   ├── compare/           → POST compare platforms
│   └── [id]/route.ts      → GET, PATCH, DELETE
└── orders/                → Order CRUD
    ├── route.ts           → GET list (with filters), POST create
    └── [id]/route.ts      → GET, PATCH (status), DELETE
lib/
├── auth/
│   ├── session.ts         → JWT handling, get current user
│   └── roles.ts           → RBAC checks (admin/operador/visualizador)
├── pricing/
│   └── calculator.ts      → PricingCalculator class with formula
├── supabase/              → Supabase client setup
├── prisma.ts              → Prisma client singleton
└── validations/           → Zod schemas for forms
components/
├── layout/
│   ├── Sidebar.tsx        → Navigation sidebar
│   └── Header.tsx         → Top header bar
├── pricing/ (Fase 2)
│   ├── PricingCalculator.tsx → Main form with live preview
│   ├── PricingHistoryTable.tsx → Table with CRUD + clone + CSV export
│   ├── PlatformComparison.tsx → Side-by-side platform comparison
│   ├── PricingStats.tsx   → KPI cards
│   └── ProductSearchDialog.tsx → Product search
├── vendas/ (Fase 3)
│   ├── KpiCards.tsx       → KPI cards with gradients
│   ├── RevenueChart.tsx   → Line chart (6 months)
│   ├── PlatformChart.tsx  → Pie chart (platform distribution)
│   ├── OrdersTable.tsx    → Table with filters + status update + delete
│   ├── OrderForm.tsx      → Create/edit order form
│   └── (others)           → Additional sales components
└── ui/                    → shadcn/ui components
middleware.ts              → JWT verification + redirect logic
prisma/schema.prisma       → 11-table schema with RLS
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

The database seed includes:
- 1 organization (Novera Co.)
- 1 admin user (email: admin@novera.com, can be customized)
- 5 platform configs (Mercado Livre Clássico, Mercado Livre Premium, Shopee, Amazon, Site Próprio)
- 16 real products with SKUs from existing business spreadsheet:
  - Examples: `102ATELIE`, `800CLASS00`, `800NOBLES00`, `CCABEACH00`, etc.

## Feature Summary

### Fase 2 — Precificação ✅
**Available Routes:**
- `GET/POST /api/pricings` — List and create pricings
- `POST /api/pricings/calculate` — Calculate pricing with formula
- `POST /api/pricings/compare` — Compare platforms with same product cost
- `PATCH/DELETE /api/pricings/[id]` — Update and delete
- `GET /dashboard/precificacao` — Overview with KPIs
- `GET /dashboard/precificacao/nova` — Create new pricing
- `GET /dashboard/precificacao/comparar` — Platform comparison
- `GET /dashboard/precificacao/[id]/editar` — Edit pricing

**Features:**
- Real-time price calculation with formula: `Price = (Cost + Freight + Fixed Fee) / (1 - Commission% - Tax% - Margin%)`
- Live preview while typing
- Platform auto-fill of commission/fee/tax rates
- Clone existing pricings
- Edit and delete operations
- CSV export of pricing history
- Multi-platform comparison (side-by-side cards with best platform indicator)
- Dashboard KPI cards showing statistics

### Fase 3 — Vendas 🚀
**Available Routes:**
- `GET/POST /api/orders` — List (with filters) and create orders
- `PATCH /api/orders/[id]` — Update order status
- `DELETE /api/orders/[id]` — Delete order
- `GET /dashboard/vendas` — Sales dashboard (KPIs + charts + orders table)
- `GET /dashboard/vendas/novo` — Create new order

**Features:**
- Dashboard KPIs (Receita Bruta, Lucro Líquido, Margem Média, Volume)
- Charts: Revenue trend (6 months) + Platform distribution
- Orders table with pagination (25 items/page)
- Advanced filtering: Platform, Status, Date range, Search (ID/Customer)
- Status management: Click badge to change status
- Delete with confirmation dialog
- Color-coded status badges
- Active filters display with one-click clear

## Code Patterns & Guidelines

### Form Handling
Use `react-hook-form` + `zod` for validation:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})
```

### API Routes
Always check auth first:
```typescript
const { data: { user } } = await supabase.auth.getUser()
const profile = await prisma.user.findUnique({ where: { id: user.id } })
```

### Components
- Use `'use client'` for interactive components
- Use server components by default for data fetching
- Pass serializable data props only (no functions/Date objects)

### Database
- All queries filtered by `organizationId` for multi-tenancy
- Use Prisma's include/select for relationships
- Numbers stored as Decimal, convert to Number for frontend

### Styling
- Use Tailwind CSS + shadcn/ui components
- Grid layouts for responsiveness: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Color semantics: green for profit, red for loss, blue for revenue, purple for margins

## Recent Changes (2026-05-19)

**Commits:**
- `875950f` — Complete Phase 2: Pricing Module with Enhanced UX
- `3ffdf76` — Start Phase 3: Sales Module with KPIs and Order Management

**Key Improvements:**
- Enhanced KPI cards with gradients and semantic icons
- Improved filter UI with responsive grid layout
- Added active filters display for better UX
- Better loading states and error handling
- Color-coded components for quick visual scanning
