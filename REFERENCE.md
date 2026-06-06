# REFERENCE.md — Novera Co. Detailed Reference

Consulte este arquivo quando precisar de detalhes específicos não cobertos pelo CLAUDE.md.

---

## Database Schema (11 tables)

```
organizations → users (RBAC: admin/operador/visualizador)
             → products → pricings → platform_configs
             → orders → order_items
             → seo_campaigns → seo_keywords → seo_content_audits
             → audit_logs
```

All tables: RLS enabled, filtered by `organizationId`.  
Numbers stored as `Decimal` in Prisma — convert to `Number` for frontend.

---

## Full API Routes

### Precificação (Fase 2)
| Method | Route | Action |
|--------|-------|--------|
| GET/POST | `/api/pricings` | List / Create |
| POST | `/api/pricings/calculate` | Calculate with formula |
| POST | `/api/pricings/compare` | Compare platforms |
| GET/PATCH/DELETE | `/api/pricings/[id]` | Read / Update / Delete |

### Vendas (Fase 3)
| Method | Route | Action |
|--------|-------|--------|
| GET/POST | `/api/orders` | List (with filters) / Create |
| PATCH/DELETE | `/api/orders/[id]` | Update status / Delete |

### Auth
| Method | Route | Action |
|--------|-------|--------|
| POST | `/api/auth/logout` | Logout |

---

## Dashboard Routes
- `/dashboard/precificacao` — KPI overview
- `/dashboard/precificacao/nova` — Create pricing
- `/dashboard/precificacao/comparar` — Platform comparison
- `/dashboard/precificacao/[id]/editar` — Edit pricing
- `/dashboard/vendas` — Sales KPIs + charts + orders table
- `/dashboard/vendas/novo` — Create order

---

## Component Inventory

### Precificação (`components/pricing/`)
- `PricingCalculator.tsx` — Form with live preview
- `PricingHistoryTable.tsx` — CRUD + clone + CSV export
- `PlatformComparison.tsx` — Side-by-side platform cards
- `PricingStats.tsx` — KPI cards
- `ProductSearchDialog.tsx` — Product search

### Vendas (`components/vendas/`)
- `KpiCards.tsx` — KPI cards with gradients
- `RevenueChart.tsx` — Line chart (6 months)
- `PlatformChart.tsx` — Pie chart
- `OrdersTable.tsx` — Filters + status update + delete + pagination (25/page)
- `OrderForm.tsx` — Create/edit order

### Layout (`components/layout/`)
- `Sidebar.tsx`, `Header.tsx`

---

## Phase Feature Details

### Fase 2 — Precificação ✅
- Live price preview while typing
- Platform auto-fill (commission/fee/tax)
- Clone existing pricings
- CSV export
- Multi-platform comparison (best platform indicator)
- Pagination: 50 items/page

### Fase 3 — Vendas ✅
- KPIs: Receita Bruta, Lucro Líquido, Margem Média, Total de Pedidos (mês atual)
- Charts: Revenue vs Lucro (6 months) + Distribuição por Plataforma
- Filters: Plataforma, Status, Date range, Busca por ID/Cliente
- Status flow: Pendente → Pago → Enviado → Entregue (+ others)
- Active filters display with one-click clear
- Pagination: 25 items/page

### Fase 4 — SEO 🚀 (parcial)
Completed:
- KPI cards (campanhas ativas, impressões, cliques, ROAS)
- 6-month metrics chart
- Campaigns table CRUD
- Keywords table CRUD
- Toast notifications

Pending:
- AI content analysis (title/description suggestions)
- Selle7 / Bling integration stubs
- Security testing
- Deploy + domain config

---

## Skill Files (project-local)
| File | Purpose |
|------|---------|
| `MVP_NoveraCo.md` | Full requirements, stack decisions, security spec, deploy checklist |
| `skills/database-schema-novera/SKILL.md` | Full SQL + RLS policies + indexes + seed |
| `skills/seguranca-autenticacao-novera/SKILL.md` | Auth middleware, RBAC, rate limiting |
| `skills/modulo-precificacao-builder/SKILL.md` | PricingCalculator class, API routes, tests |
| `skills/README.md` | 4-week roadmap |
| `skills/COMO_USAR.md` | Quick-start + prompt templates |

---

## Recent Commits
| Hash | Description | Date |
|------|-------------|------|
| `16e70ea` | Update CLAUDE.md phases 2+3 | 2026-05-19 |
| `3ffdf76` | Fase 3: Sales Module | 2026-05-19 |
| `875950f` | Fase 2: Pricing Module | 2026-05-19 |
