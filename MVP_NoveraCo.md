# 🚀 PROMPT COMPLETO — MVP NOVERA CO. FINANCIAL & MANAGEMENT PLATFORM

**Versão:** 1.0  
**Domínio:** [www.norecaco.com.br](http://www.norecaco.com.br)  
**Objetivo:** Plataforma interna de gestão financeira, precificação e SEO para a Loja Novera Co.

---

## 📋 CONTEXTO DO PROJETO

Você é um engenheiro de software sênior full-stack responsável por construir um MVP completo de uma plataforma de gestão interna para a **Novera Co.**, loja de e-commerce que vende produtos têxteis (toalhas, roupões, lençóis, tapetes e difusores) nas plataformas **Mercado Livre**, **Shopee**, **Amazon** e **Site Próprio**.

A plataforma será acessível via **ícone/botão de acesso restrito** no site `www.norecaco.com.br`, redirecionando para uma aplicação web separada (ex: `app.norecaco.com.br` ou `/admin`).

---

## 🏗️ STACK TECNOLÓGICA

### Frontend

- **Framework:** Next.js 14+ (App Router)  
- **UI:** shadcn/ui \+ Tailwind CSS  
- **Gráficos:** Recharts ou Chart.js  
- **Estado:** Zustand ou React Query (TanStack Query)  
- **Formulários:** React Hook Form \+ Zod

### Backend

- **Runtime:** Node.js com Next.js API Routes (server-side only)  
- **ORM:** Prisma  
- **Banco de Dados:** Supabase (PostgreSQL)  
- **Autenticação:** Supabase Auth (JWT \+ Row Level Security)  
- **Cache:** Redis (Upstash) para rate limiting e cache de API

### Infraestrutura & Segurança

- **Hosting:** Vercel (frontend \+ API Routes) ou Railway  
- **Secrets:** Variáveis de ambiente no servidor — NUNCA expostas ao cliente  
- **CORS:** Configurado apenas para domínios autorizados  
- **Rate Limiting:** Upstash Redis \+ middleware Next.js  
- **Logs:** Pino.js (server-side apenas)

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### Requisitos

- Login com e-mail \+ senha (Supabase Auth)  
- Suporte futuro a 2FA (preparar estrutura)  
- JWT com refresh token automático  
- Row Level Security (RLS) no Supabase para isolar dados por usuário/organização  
- Middleware de autenticação em todas as rotas protegidas  
- Sessão expira em 8 horas de inatividade

### Tela de Login

\- Logo da Novera Co.

\- Campo: E-mail

\- Campo: Senha (com toggle show/hide)

\- Botão: Entrar

\- Link: Esqueci minha senha

\- Sem opção de cadastro público (apenas admin cria usuários)

### Roles de Usuário

\- ADMIN: acesso total

\- OPERADOR: acesso a Vendas e Precificação (sem configurações)

\- VISUALIZADOR: somente leitura (relatórios)

---

## 🎨 LAYOUT DA APLICAÇÃO

### Estrutura Geral

┌─────────────────────────────────────────────────────┐

│ HEADER: Logo | Breadcrumb | Notificações | Avatar    │

├──────────────┬──────────────────────────────────────┤

│              │                                      │

│   SIDEBAR    │         CONTEÚDO PRINCIPAL           │

│              │                                      │

│ • Dashboard  │                                      │

│ • Precific.  │                                      │

│ • Vendas     │                                      │

│ • SEO        │                                      │

│ • Configurar │                                      │

│              │                                      │

└──────────────┴──────────────────────────────────────┘

### Sidebar (itens)

1. 🏠 Dashboard (visão geral)  
2. 💰 Painel de Precificação  
3. 📊 Painel de Vendas  
4. 🔍 Painel de SEO  
5. ⚙️ Configurações (apenas ADMIN)  
6. 🚪 Sair

---

## 💰 MÓDULO 1 — PAINEL DE PRECIFICAÇÃO

### Objetivo

Calcular o preço de venda ideal por produto e por plataforma, mantendo histórico de todas as precificações realizadas.

### Modelo de Dados (Supabase)

\-- Produtos

CREATE TABLE products (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  sku TEXT NOT NULL UNIQUE,

  name TEXT NOT NULL,

  description TEXT,

  cost\_price DECIMAL(10,2) NOT NULL,

  created\_at TIMESTAMPTZ DEFAULT NOW(),

  updated\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- Configurações por Plataforma

CREATE TABLE platform\_configs (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  platform TEXT NOT NULL, \-- 'mercado\_livre' | 'shopee' | 'amazon' | 'site\_proprio'

  commission\_rate DECIMAL(5,2) NOT NULL, \-- ex: 16.5

  fixed\_fee DECIMAL(10,2) DEFAULT 0,

  tax\_rate DECIMAL(5,2) DEFAULT 0,

  description TEXT,

  is\_active BOOLEAN DEFAULT TRUE,

  created\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- Precificações (histórico)

CREATE TABLE pricings (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  product\_id UUID REFERENCES products(id),

  platform TEXT NOT NULL,

  cost\_price DECIMAL(10,2) NOT NULL,

  shipping\_cost DECIMAL(10,2) DEFAULT 0,

  commission\_rate DECIMAL(5,2) NOT NULL,

  fixed\_fee DECIMAL(10,2) DEFAULT 0,

  tax\_rate DECIMAL(5,2) DEFAULT 0,

  desired\_margin DECIMAL(5,2) NOT NULL,

  suggested\_price DECIMAL(10,2) NOT NULL,

  net\_profit DECIMAL(10,2) NOT NULL,

  net\_margin\_percent DECIMAL(5,2) NOT NULL,

  notes TEXT,

  created\_by UUID REFERENCES auth.users(id),

  created\_at TIMESTAMPTZ DEFAULT NOW()

);

### Fórmula de Precificação

Baseada na planilha `Planilha_Precificacao_Atualizada.xlsx`:

Preço de Venda \= (Custo \+ Frete \+ Taxa Fixa) / (1 \- Comissão% \- Imposto% \- Margem%)

Lucro Líquido \= Preço de Venda × Margem%

Margem Real % \= Lucro Líquido / Preço de Venda × 100

### Interface

#### Calculadora de Preços

┌─ NOVA PRECIFICAÇÃO ─────────────────────────────────┐

│ Produto: \[Buscar por nome ou SKU\]                   │

│ Plataforma: \[Mercado Livre ▼\]                       │

│                                                     │

│ Custo do Produto: R$ \[\_\_\_\_\_\_\]                       │

│ Frete/Logística: R$ \[\_\_\_\_\_\_\]                        │

│ Comissão da Plataforma: \[16.5\] %                    │

│ Taxa Fixa: R$ \[1.50\]                                │

│ Impostos: \[0\] %                                     │

│ Margem de Lucro Desejada: \[12.5\] %                  │

│                                                     │

│ ┌─ RESULTADO ──────────────────────────────────┐   │

│ │ Preço Sugerido:    R$ 135,75                 │   │

│ │ Lucro Líquido:     R$ 16,97                  │   │

│ │ Margem Real:       12,5%                     │   │

│ └──────────────────────────────────────────────┘   │

│                                                     │

│ \[Salvar Precificação\] \[Comparar Plataformas\]        │

└─────────────────────────────────────────────────────┘

#### Comparador de Plataformas

Exibir side-by-side o preço e lucro para ML, Shopee, Amazon e Site Próprio com um único input de custo.

#### Histórico de Precificações

- Tabela com filtros: Produto, Plataforma, Período  
- Colunas: Data | Produto | SKU | Plataforma | Custo | Preço Sugerido | Margem | Criado por  
- Exportar para CSV/Excel  
- Ver detalhes de uma precificação específica  
- Clonar precificação para nova entrada

#### Configurações de Plataforma (admin)

- Cadastrar/editar comissões padrão por plataforma  
- Histórico de alterações de taxas

### Dados Pré-carregados (seed)

Importar da planilha os seguintes produtos e configurações padrão:

**Produtos:** | SKU | Nome | |-----|------| | 102ATELIE | Jogo de Toalha Completo 5 Pçs \- Ateliê | | 800CLASS00 | Jogo de Toalha Completo 5 Pçs \- Class Branco | | 800NOBLES00 | Jogo de Toalha Completo 5 Pçs \- Noblesse | | 800PARIS00 | Jogo de Toalha Completo 5 Pçs \- Paris Branco | | 800PREMIUM5 | Jogo de Toalha Simples 5 Pçs Premium 290g | | 800ROUPAO00 | Roupão de Banho Adulto Felpudo 100% Algodão | | 102CCAPEZINHO | Kit 5 Pçs Tapete Toalha de Piso Pézinho 400g | | 102CCABLOOM | Toalha de Banho Bloom 350g 150x75cm | | CCABEACH00 | Toalha de Banho para Praia e Piscina Beach | | 101VED53037 | Xale para Sofá Manta Grid Jacquard | | VED52321 | Jogo de Lençol 4 Pçs Casal Padrão Versatile | | 102CCABOSSA | Kit 2 Pçs Toalha de Banho Bossa 340g | | 800LINEA00 | Kit 2 Pçs Toalha de Banho Linea 260g | | CCABEACH2P00 | Kit 2 Pçs Toalha de Banho para Praia Beach | | 107SDAREF12 | Refil para Difusor Classic Aroma Premium 100ml | | 107SDA25 | Difusor Classic Frasco de Vidro 100ml |

**Taxas padrão por plataforma:** | Plataforma | Comissão | Taxa Fixa | Frete incluso | |------------|----------|-----------|---------------| | Mercado Livre (Clássico) | 16,5% | R$ 1,50 | Não | | Mercado Livre (Premium) | 11,5% | R$ 1,50 | Não | | Shopee | 20,0% | R$ 4,00 | Sim (seller paga) | | Amazon | 15,0% | R$ 2,00 | Não | | Site Próprio | 0% | 0 | Configurável |

---

## 📊 MÓDULO 2 — PAINEL DE VENDAS

### Objetivo

Lançar e acompanhar vendas de todas as plataformas, com dashboard financeiro completo.

### Modelo de Dados

\-- Pedidos/Vendas

CREATE TABLE orders (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  external\_id TEXT, \-- ID do pedido na plataforma

  platform TEXT NOT NULL,

  order\_date TIMESTAMPTZ NOT NULL,

  status TEXT NOT NULL, \-- 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado' | 'devolvido'

  customer\_name TEXT,

  customer\_city TEXT,

  customer\_state TEXT,

  gross\_revenue DECIMAL(10,2) NOT NULL,

  platform\_fee DECIMAL(10,2) DEFAULT 0,

  shipping\_cost DECIMAL(10,2) DEFAULT 0,

  product\_cost DECIMAL(10,2) DEFAULT 0,

  taxes DECIMAL(10,2) DEFAULT 0,

  net\_profit DECIMAL(10,2) GENERATED ALWAYS AS 

    (gross\_revenue \- platform\_fee \- shipping\_cost \- product\_cost \- taxes) STORED,

  net\_margin DECIMAL(5,2) GENERATED ALWAYS AS 

    (CASE WHEN gross\_revenue \> 0 

     THEN ((gross\_revenue \- platform\_fee \- shipping\_cost \- product\_cost \- taxes) / gross\_revenue \* 100\)

     ELSE 0 END) STORED,

  notes TEXT,

  source TEXT DEFAULT 'manual', \-- 'manual' | 'selle7' | 'bling'

  created\_by UUID REFERENCES auth.users(id),

  created\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- Itens do Pedido

CREATE TABLE order\_items (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  order\_id UUID REFERENCES orders(id) ON DELETE CASCADE,

  product\_id UUID REFERENCES products(id),

  sku TEXT,

  product\_name TEXT NOT NULL,

  quantity INTEGER NOT NULL,

  unit\_price DECIMAL(10,2) NOT NULL,

  unit\_cost DECIMAL(10,2) DEFAULT 0,

  total\_price DECIMAL(10,2) NOT NULL

);

### Dashboard de Vendas

#### KPIs Principais (cards no topo)

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐

│ Receita  │ │  Lucro   │ │ Margem   │ │  Pedidos │

│ Bruta    │ │ Líquido  │ │ Média    │ │  Total   │

│ R$12.540 │ │ R$ 3.210 │ │  25,6%   │ │   147    │

└──────────┘ └──────────┘ └──────────┘ └──────────┘

#### Gráficos

1. **Linha:** Receita x Lucro por mês (últimos 12 meses)  
2. **Pizza/Donut:** Distribuição de vendas por plataforma (ML, Shopee, Amazon, Site)  
3. **Barras:** Top 10 produtos mais vendidos (por receita e por quantidade)  
4. **Barras empilhadas:** Margem de lucro por plataforma  
5. **Linha:** Ticket médio por plataforma ao longo do tempo  
6. **Mapa calor:** Vendas por estado (preparar estrutura, implementar v2)

#### Filtros Globais

- Período: Hoje | Esta semana | Este mês | Este ano | Personalizado  
- Plataforma: Todas | ML | Shopee | Amazon | Site  
- Status: Todos | Pago | Entregue | Cancelado

#### Tabela de Pedidos

- Colunas: Data | Pedido | Plataforma | Cliente | Receita | Custo | Lucro | Margem% | Status | Ações  
- Paginação (25/50/100 por página)  
- Busca por ID, cliente ou produto  
- Exportar para CSV/Excel

#### Lançamento Manual de Venda

Formulário:

\- Plataforma (select)

\- Data do pedido

\- ID externo do pedido (opcional)

\- Produtos (adicionar múltiplos itens com qty e preço)

\- Custo total do produto

\- Taxa da plataforma (auto-preenchida)

\- Frete cobrado

\- Observações

### Integração com Selle7 / Bling (preparar estrutura)

// /lib/integrations/selle7.ts

interface Selle7Config {

  apiKey: string;          // Armazenada SOMENTE no servidor

  storeId: string;

  baseUrl: string;

}

// Endpoints a implementar:

// GET /api/integrations/selle7/orders?status=\&dateFrom=\&dateTo=

// POST /api/integrations/selle7/sync  (sincronização manual)

// GET /api/integrations/selle7/status (verificar conexão)

// /lib/integrations/bling.ts  

interface BlingConfig {

  apiKey: string;          // Armazenada SOMENTE no servidor

  clientId: string;

  clientSecret: string;

}

// Endpoints a implementar:

// GET /api/integrations/bling/orders

// POST /api/integrations/bling/sync

**Nota:** As integrações devem ser configuradas na tela de Configurações pelo admin, com as chaves armazenadas apenas no banco de dados (criptografadas) e nunca expostas ao frontend.

---

## 🔍 MÓDULO 3 — PAINEL DE SEO

### Objetivo

Monitorar e gerenciar estratégias de SEO/SEM para os anúncios nas plataformas e site próprio.

### Modelo de Dados

\-- Campanhas de SEO/Anúncios

CREATE TABLE seo\_campaigns (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  name TEXT NOT NULL,

  platform TEXT NOT NULL,

  type TEXT NOT NULL, \-- 'seo\_organico' | 'produto\_patrocinado' | 'ads'

  status TEXT DEFAULT 'ativo', \-- 'ativo' | 'pausado' | 'encerrado'

  budget DECIMAL(10,2),

  spent DECIMAL(10,2) DEFAULT 0,

  impressions INTEGER DEFAULT 0,

  clicks INTEGER DEFAULT 0,

  conversions INTEGER DEFAULT 0,

  revenue DECIMAL(10,2) DEFAULT 0,

  start\_date DATE,

  end\_date DATE,

  notes TEXT,

  created\_by UUID REFERENCES auth.users(id),

  created\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- Keywords / Palavras-chave

CREATE TABLE seo\_keywords (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  keyword TEXT NOT NULL,

  platform TEXT NOT NULL,

  product\_id UUID REFERENCES products(id),

  search\_volume INTEGER,

  competition TEXT, \-- 'baixa' | 'media' | 'alta'

  current\_position INTEGER,

  target\_position INTEGER,

  monthly\_searches INTEGER,

  notes TEXT,

  last\_checked TIMESTAMPTZ,

  created\_at TIMESTAMPTZ DEFAULT NOW()

);

\-- Análises de Título/Descrição (histórico)

CREATE TABLE seo\_content\_audits (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  product\_id UUID REFERENCES products(id),

  platform TEXT NOT NULL,

  current\_title TEXT,

  suggested\_title TEXT,

  current\_description TEXT,

  suggested\_description TEXT,

  score INTEGER, \-- 0-100

  issues JSONB,  \-- array de problemas encontrados

  created\_by UUID REFERENCES auth.users(id),

  created\_at TIMESTAMPTZ DEFAULT NOW()

);

### Interface do Painel SEO

#### Aba 1 — Visão Geral

- KPIs: Total de campanhas ativas | Impressões mês | Cliques mês | ROAS médio  
- Gráfico: Impressões x Cliques x Conversões por período  
- Tabela de campanhas com performance

#### Aba 2 — Palavras-chave

- Adicionar/editar keywords por produto e plataforma  
- Volume de busca estimado  
- Posição atual e meta  
- Status de rastreamento (ativo/pausado)  
- Histórico de posições (preparar estrutura)

#### Aba 3 — Análise de Conteúdo (IA)

- Input: Título atual e descrição do produto  
- Output (via API Claude/GPT): Sugestões de título otimizado, descrição melhorada, tags recomendadas  
- Score de qualidade do anúncio (0-100)  
- Checklist de boas práticas por plataforma:  
    
  Mercado Livre: Título 60 chars | Fotos HD | Ficha técnica completa | Reviews  
    
  Shopee: Hashtags | Vouchers | Transmissões ao vivo  
    
  Amazon: A+ Content | Backend keywords | Reviews verificados

#### Aba 4 — Integrações (preparar estrutura)

Conectar APIs (futuro):

\[ \] Mercado Livre Advertising API

\[ \] Shopee Open Platform API

\[ \] Amazon SP-API / Advertising API

\[ \] Google Analytics 4

\[ \] Google Search Console

---

## 🔒 SEGURANÇA — BOAS PRÁTICAS

### Autenticação & Autorização

// middleware.ts (Next.js)

// \- Verificar JWT em todas as rotas /dashboard/\*

// \- Rate limiting: 100 req/min por IP

// \- Rate limiting: 10 tentativas de login por hora por IP

// \- Blacklist de tokens (logout invalidation)

### Proteção de Dados

// NUNCA fazer isso:

// ❌ Retornar API keys no response

// ❌ Logar dados sensíveis

// ❌ Usar chaves de API no frontend (NEXT\_PUBLIC\_\*)

// SEMPRE fazer isso:

// ✅ API keys apenas em variáveis de ambiente server-side

// ✅ Sanitizar inputs com Zod antes de processar

// ✅ Usar prepared statements (Prisma previne SQL injection)

// ✅ HTTPS obrigatório

// ✅ Headers de segurança (CSP, HSTS, X-Frame-Options)

### Configuração de Headers (next.config.js)

const securityHeaders \= \[

  { key: 'X-DNS-Prefetch-Control', value: 'on' },

  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  { key: 'X-Content-Type-Options', value: 'nosniff' },

  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },

  { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },

\];

### Supabase RLS (Row Level Security)

\-- Usuários só veem dados da sua organização

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own org data" ON orders

  FOR ALL USING (auth.uid() \= created\_by OR 

                 auth.jwt() \-\>\> 'role' \= 'admin');

### Auditoria

\-- Log de ações críticas

CREATE TABLE audit\_logs (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  user\_id UUID REFERENCES auth.users(id),

  action TEXT NOT NULL,  \-- 'login' | 'create\_pricing' | 'export\_data' etc.

  table\_name TEXT,

  record\_id UUID,

  old\_values JSONB,

  new\_values JSONB,

  ip\_address INET,

  user\_agent TEXT,

  created\_at TIMESTAMPTZ DEFAULT NOW()

);

---

## 🌐 INTEGRAÇÃO COM [www.norecaco.com.br](http://www.norecaco.com.br)

### Opção Recomendada: Botão Flutuante ou Ícone no Header

No site principal `www.norecaco.com.br`, adicionar um dos seguintes elementos:

**Opção A — Ícone no header (discreto):**

\<\!-- No header do site Wix/WordPress/outro \--\>

\<a href="https://app.norecaco.com.br" 

   target="\_blank"

   rel="noopener noreferrer"

   title="Acesso Restrito \- Gestão"

   style="position: absolute; top: 10px; right: 10px; opacity: 0.4;"\>

  🔒

\</a\>

**Opção B — Botão no rodapé:**

\<a href="https://app.norecaco.com.br" class="admin-access"\>

  Área Administrativa

\</a\>

**Opção C — URL direta (sem indicação visual no site):**  
Acesse diretamente via `app.norecaco.com.br` sem nenhum link público.

**Recomendação de segurança:** Não linkar publicamente o painel admin. Use URL direta ou link apenas no footer com opacity baixa.

---

## 📁 ESTRUTURA DE PASTAS DO PROJETO

novera-co-app/

├── app/

│   ├── (auth)/

│   │   └── login/

│   │       └── page.tsx

│   ├── (dashboard)/

│   │   ├── layout.tsx          \# Sidebar \+ Header

│   │   ├── page.tsx            \# Dashboard overview

│   │   ├── precificacao/

│   │   │   ├── page.tsx        \# Lista de precificações

│   │   │   ├── nova/

│   │   │   │   └── page.tsx    \# Calculadora

│   │   │   └── \[id\]/

│   │   │       └── page.tsx    \# Detalhes

│   │   ├── vendas/

│   │   │   ├── page.tsx        \# Dashboard de vendas

│   │   │   ├── lancamentos/

│   │   │   │   └── page.tsx    \# Lançar venda

│   │   │   └── \[id\]/

│   │   │       └── page.tsx    \# Detalhes do pedido

│   │   ├── seo/

│   │   │   ├── page.tsx        \# Visão geral SEO

│   │   │   ├── keywords/

│   │   │   │   └── page.tsx

│   │   │   ├── campanhas/

│   │   │   │   └── page.tsx

│   │   │   └── conteudo/

│   │   │       └── page.tsx    \# Análise com IA

│   │   └── configuracoes/

│   │       └── page.tsx        \# Configs e integrações

├── api/

│   ├── auth/

│   │   ├── login/route.ts

│   │   └── logout/route.ts

│   ├── products/

│   │   └── route.ts

│   ├── pricings/

│   │   └── route.ts

│   ├── orders/

│   │   └── route.ts

│   ├── seo/

│   │   └── route.ts

│   └── integrations/

│       ├── selle7/route.ts     \# Stub para futura integração

│       └── bling/route.ts      \# Stub para futura integração

├── components/

│   ├── ui/                     \# shadcn components

│   ├── layout/

│   │   ├── Sidebar.tsx

│   │   └── Header.tsx

│   ├── pricing/

│   │   ├── PricingCalculator.tsx

│   │   ├── PlatformComparator.tsx

│   │   └── PricingHistoryTable.tsx

│   ├── sales/

│   │   ├── SalesDashboard.tsx

│   │   ├── OrdersTable.tsx

│   │   └── SalesForm.tsx

│   └── seo/

│       ├── CampaignTable.tsx

│       └── KeywordTracker.tsx

├── lib/

│   ├── supabase/

│   │   ├── client.ts           \# Client-side (limitado)

│   │   └── server.ts           \# Server-side (pleno acesso)

│   ├── integrations/

│   │   ├── selle7.ts

│   │   └── bling.ts

│   ├── pricing/

│   │   └── calculator.ts       \# Lógica de precificação

│   └── validations/

│       └── schemas.ts          \# Schemas Zod

├── middleware.ts                \# Auth \+ Rate limiting

├── .env.local                   \# NUNCA comitar no git

└── next.config.js

---

## 🚀 ORDEM DE DESENVOLVIMENTO (MVP)

### Fase 1 — Fundação (Semana 1-2)

- [ ] Setup Next.js \+ Supabase \+ shadcn/ui  
- [ ] Schema do banco de dados \+ migrations  
- [ ] Sistema de autenticação (login/logout/middleware)  
- [ ] Layout base (sidebar \+ header)  
- [ ] Seed de produtos e configurações de plataforma

### Fase 2 — Precificação (Semana 3-4)

- [ ] Calculadora de preços  
- [ ] Comparador de plataformas  
- [ ] Histórico de precificações  
- [ ] CRUD de produtos  
- [ ] Exportação CSV

### Fase 3 — Vendas (Semana 5-6)

- [ ] Dashboard de vendas com KPIs  
- [ ] Formulário de lançamento manual  
- [ ] Tabela de pedidos com filtros  
- [ ] Gráficos (receita, margem, por plataforma)  
- [ ] Exportação de relatórios

### Fase 4 — SEO & Polimento (Semana 7-8)

- [ ] Painel SEO (campanhas e keywords)  
- [ ] Stubs de integração Selle7/Bling  
- [ ] Stubs de APIs de plataformas  
- [ ] Testes de segurança  
- [ ] Deploy e configuração de domínio  
- [ ] Documentação de uso

---

## 📦 VARIÁVEIS DE AMBIENTE (.env.local)

\# Supabase (NUNCA use NEXT\_PUBLIC\_ para secrets)

SUPABASE\_URL=https://xxx.supabase.co

SUPABASE\_ANON\_KEY=xxx          \# Pode ser público (RLS protege)

SUPABASE\_SERVICE\_ROLE\_KEY=xxx  \# APENAS server-side, NUNCA expor

\# Integrações (stubs para futuro)

SELLE7\_API\_KEY=

SELLE7\_STORE\_ID=

BLING\_CLIENT\_ID=

BLING\_CLIENT\_SECRET=

\# Redis (rate limiting)

UPSTASH\_REDIS\_REST\_URL=

UPSTASH\_REDIS\_REST\_TOKEN=

\# App

NEXTAUTH\_SECRET=xxx\_random\_32\_chars

NEXTAUTH\_URL=https://app.norecaco.com.br

---

## ✅ CHECKLIST DE ENTREGA DO MVP

### Funcionalidades

- [ ] Login seguro com e-mail/senha  
- [ ] Calculadora de precificação com todas as plataformas  
- [ ] Histórico de precificações com filtros e exportação  
- [ ] Dashboard de vendas com KPIs e gráficos  
- [ ] Lançamento manual de pedidos  
- [ ] Tabela de pedidos com filtros e busca  
- [ ] Painel SEO (campanhas e keywords)  
- [ ] Área de configurações (taxas, integrações)  
- [ ] Estrutura preparada para APIs Selle7/Bling

### Segurança

- [ ] Autenticação JWT via Supabase Auth  
- [ ] RLS ativado em todas as tabelas  
- [ ] Rate limiting no login e APIs  
- [ ] Headers de segurança configurados  
- [ ] Nenhum secret no frontend  
- [ ] HTTPS obrigatório  
- [ ] Log de auditoria de ações críticas

### Qualidade

- [ ] Validação de inputs com Zod  
- [ ] Tratamento de erros em todas as APIs  
- [ ] Loading states em todas as ações  
- [ ] Responsivo (mobile-friendly)  
- [ ] Feedback visual de sucesso/erro

---

*Prompt gerado para: Novera Co. | Domínio: [www.norecaco.com.br](http://www.norecaco.com.br)*  
*Baseado na planilha: Planilha\_Precificacao\_Atualizada.xlsx*  
