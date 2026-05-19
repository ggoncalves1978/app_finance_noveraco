# SKILL: database-schema-novera

## 📋 Descrição
Design completo do banco de dados PostgreSQL (Supabase) para MVP Novera Co.
Inclui schemas, índices, constraints, RLS policies e seed data baseado na planilha de precificação.

---

## 🗄️ Estrutura de Tabelas

### 1. **organizations** (multi-tenancy preparado)
```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. **users** (extensão do auth.users do Supabase)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'operador', 
    -- 'admin' | 'operador' | 'visualizador'
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE INDEX idx_users_organization_id ON public.users(organization_id);
CREATE INDEX idx_users_email ON public.users(email);
```

### 3. **products** (catálogo de produtos)
```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cost_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, sku)
);

CREATE INDEX idx_products_organization_id ON public.products(organization_id);
CREATE INDEX idx_products_sku ON public.products(organization_id, sku);
```

### 4. **platform_configs** (configurações por plataforma)
```sql
CREATE TABLE public.platform_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  platform TEXT NOT NULL,
    -- 'mercado_livre' | 'shopee' | 'amazon' | 'site_proprio'
  commission_rate DECIMAL(5, 2) NOT NULL,
    -- ex: 16.5 para 16,5%
  fixed_fee DECIMAL(10, 2) DEFAULT 0,
    -- ex: 1.50 para taxa fixa de R$ 1,50
  tax_rate DECIMAL(5, 2) DEFAULT 0,
    -- impostos adicionais %
  shipping_included BOOLEAN DEFAULT FALSE,
    -- verdadeiro se frete já está no preço (Shopee)
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, platform)
);

CREATE INDEX idx_platform_configs_organization_id ON public.platform_configs(organization_id);
```

### 5. **pricings** (histórico de precificações)
```sql
CREATE TABLE public.pricings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  platform TEXT NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  commission_rate DECIMAL(5, 2) NOT NULL,
  fixed_fee DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  desired_margin DECIMAL(5, 2) NOT NULL,
  suggested_price DECIMAL(10, 2) NOT NULL,
  net_profit DECIMAL(10, 2) NOT NULL,
  net_margin_percent DECIMAL(5, 2) NOT NULL,
  notes TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_margin CHECK (desired_margin >= 5 AND desired_margin <= 100),
  CONSTRAINT valid_price CHECK (suggested_price > 0)
);

CREATE INDEX idx_pricings_organization_id ON public.pricings(organization_id);
CREATE INDEX idx_pricings_product_id ON public.pricings(product_id);
CREATE INDEX idx_pricings_platform ON public.pricings(platform);
CREATE INDEX idx_pricings_created_at ON public.pricings(created_at DESC);
CREATE INDEX idx_pricings_org_product_platform ON public.pricings(organization_id, product_id, platform);
```

### 6. **orders** (pedidos/vendas)
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  external_id TEXT,
    -- ID do pedido na plataforma (ML, Shopee, etc)
  platform TEXT NOT NULL,
  order_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
    -- 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado' | 'devolvido'
  customer_name TEXT,
  customer_email TEXT,
  customer_city TEXT,
  customer_state TEXT,
  gross_revenue DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  product_cost DECIMAL(10, 2) DEFAULT 0,
  taxes DECIMAL(10, 2) DEFAULT 0,
  net_profit DECIMAL(10, 2) GENERATED ALWAYS AS 
    (gross_revenue - platform_fee - shipping_cost - product_cost - taxes) STORED,
  net_margin DECIMAL(5, 2) GENERATED ALWAYS AS 
    (CASE WHEN gross_revenue > 0 
     THEN ROUND(((gross_revenue - platform_fee - shipping_cost - product_cost - taxes) / gross_revenue * 100)::numeric, 2)
     ELSE 0 END) STORED,
  notes TEXT,
  source TEXT DEFAULT 'manual',
    -- 'manual' | 'selle7' | 'bling'
  source_sync_id TEXT,
    -- ID de sincronização (rastrear se veio de integrações)
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, external_id, platform),
  CONSTRAINT valid_revenue CHECK (gross_revenue >= 0),
  CONSTRAINT valid_status CHECK (status IN ('pendente', 'pago', 'enviado', 'entregue', 'cancelado', 'devolvido'))
);

CREATE INDEX idx_orders_organization_id ON public.orders(organization_id);
CREATE INDEX idx_orders_platform ON public.orders(platform);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_order_date ON public.orders(order_date DESC);
CREATE INDEX idx_orders_org_platform_status ON public.orders(organization_id, platform, status);
```

### 7. **order_items** (itens do pedido)
```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  sku TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_price CHECK (unit_price > 0 AND total_price > 0)
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
```

### 8. **seo_campaigns** (campanhas de SEO/Ads)
```sql
CREATE TABLE public.seo_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
    -- 'mercado_livre' | 'shopee' | 'amazon' | 'google_ads' | 'site_proprio'
  type TEXT NOT NULL,
    -- 'seo_organico' | 'produto_patrocinado' | 'ads'
  status TEXT DEFAULT 'ativo',
    -- 'ativo' | 'pausado' | 'encerrado'
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_campaigns_organization_id ON public.seo_campaigns(organization_id);
CREATE INDEX idx_seo_campaigns_platform ON public.seo_campaigns(platform);
CREATE INDEX idx_seo_campaigns_status ON public.seo_campaigns(status);
```

### 9. **seo_keywords** (palavras-chave)
```sql
CREATE TABLE public.seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL,
  keyword TEXT NOT NULL,
  platform TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id),
  search_volume INTEGER,
  competition TEXT,
    -- 'baixa' | 'media' | 'alta'
  current_position INTEGER,
  target_position INTEGER,
  monthly_searches INTEGER,
  notes TEXT,
  last_checked TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_keywords_organization_id ON public.seo_keywords(organization_id);
CREATE INDEX idx_seo_keywords_campaign_id ON public.seo_keywords(campaign_id);
CREATE INDEX idx_seo_keywords_keyword ON public.seo_keywords(keyword);
```

### 10. **seo_content_audits** (auditoria de conteúdo)
```sql
CREATE TABLE public.seo_content_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  platform TEXT NOT NULL,
  current_title TEXT,
  suggested_title TEXT,
  current_description TEXT,
  suggested_description TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  issues JSONB,
    -- array de { field: string, issue: string, severity: 'low'|'medium'|'high' }
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_audits_organization_id ON public.seo_content_audits(organization_id);
CREATE INDEX idx_seo_audits_product_id ON public.seo_content_audits(product_id);
```

### 11. **audit_logs** (log de auditoria)
```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
    -- 'login' | 'create_pricing' | 'export_data' | 'update_order' | etc
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
```

---

## 🔐 Row Level Security (RLS)

### Habilitar RLS em todas as tabelas
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_content_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

### Políticas de RLS

#### Padrão: Usuário acessa só dados da sua organização
```sql
-- users
CREATE POLICY "Users see own organization" ON public.users
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- products (mesmo padrão para todas as tabelas de dados)
CREATE POLICY "Users see products of own org" ON public.products
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- orders
CREATE POLICY "Users see orders of own org" ON public.orders
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- pricings
CREATE POLICY "Users see pricings of own org" ON public.pricings
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- seo_campaigns
CREATE POLICY "Users see campaigns of own org" ON public.seo_campaigns
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- seo_keywords
CREATE POLICY "Users see keywords of own org" ON public.seo_keywords
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- audit_logs
CREATE POLICY "Users see logs of own org" ON public.audit_logs
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );
```

---

## 📊 Seed Data (Produtos + Configurações)

### Script SQL para inserir dados iniciais
```sql
-- 1. Criar organização
INSERT INTO public.organizations (id, name, slug, website)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Novera Co.', 'novera-co', 'https://www.norecaco.com.br')
ON CONFLICT (slug) DO NOTHING;

-- 2. Criar usuário admin
INSERT INTO public.users (id, organization_id, email, full_name, role, is_active)
VALUES (
  auth.uid(),  -- você precisa estar logado
  '00000000-0000-0000-0000-000000000001'::uuid,
  auth.email(),
  'Admin Novera',
  'admin',
  TRUE
)
ON CONFLICT (organization_id, email) DO NOTHING;

-- 3. Configurar plataformas padrão
INSERT INTO public.platform_configs (organization_id, platform, commission_rate, fixed_fee, tax_rate, shipping_included, description)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'mercado_livre', 16.5, 1.50, 0, FALSE, 'Mercado Livre - Clássico'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'mercado_livre_premium', 11.5, 1.50, 0, FALSE, 'Mercado Livre - Premium'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'shopee', 20.0, 4.0, 0, TRUE, 'Shopee - Frete incluso'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'amazon', 15.0, 2.0, 0, FALSE, 'Amazon'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'site_proprio', 0, 0, 0, FALSE, 'Site Próprio')
ON CONFLICT (organization_id, platform) DO NOTHING;

-- 4. Inserir produtos (baseado na planilha)
INSERT INTO public.products (organization_id, sku, name, description, cost_price)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, '102ATELIE', 'Jogo de Toalha Completo 5 Pçs de Banho, Rosto e Piso Ateliê', 'Premium', 73.83),
  ('00000000-0000-0000-0000-000000000001'::uuid, '800CLASS00', 'Jogo de Toalha Completo 5 Pçs de Banho, Rosto e Piso Class Branco', 'Qualidade Premium', 136.72),
  ('00000000-0000-0000-0000-000000000001'::uuid, '800NOBLES00', 'Jogo de Toalha Completo 5 Pçs de Banho, Rosto e Piso Noblesse', 'Luxo', 83.34),
  ('00000000-0000-0000-0000-000000000001'::uuid, '800PARIS00', 'Jogo de Toalha Completo 5 Pçs de Banho, Rosto e Piso Paris Branco', 'Sofisticado', 104.10),
  ('00000000-0000-0000-0000-000000000001'::uuid, '800PREMIUM5', 'Jogo de Toalha Simples 5 Pçs Banho e Rosto Premium 290g', 'Premium', 47.30),
  ('00000000-0000-0000-0000-000000000001'::uuid, '800ROUPAO00', 'Roupão de Banho Adulto Felpudo 100% Algodão', 'Confortável', 58.22),
  ('00000000-0000-0000-0000-000000000001'::uuid, '102CCAPEZINHO', 'Kit 5 Pçs Tapete Toalha de Piso Pézinho 400g 70x45cm', 'Decorativo', 38.35),
  ('00000000-0000-0000-0000-000000000001'::uuid, '102CCABLOOM', 'Toalha de Banho Bloom 350g 150x75cm', 'Linha Bloom', 33.18),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CCABEACH00', 'Toalha de Banho para Praia e Piscina Beach', 'Praia', 36.35),
  ('00000000-0000-0000-0000-000000000001'::uuid, '101VED53037', 'Xale para Sofá Manta Grid Jacquard 2,10m x 1,35m', 'Decorativo', 38.00),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'VED52321', 'Jogo de Lençol 4 Pçs Casal Padrão Versatile', 'Cama', 64.00),
  ('00000000-0000-0000-0000-000000000001'::uuid, '102CCABOSSA', 'Kit 2 Pçs Toalha de Banho Bossa 340g 130x62cm', 'Elegante', 40.51),
  ('00000000-0000-0000-0000-000000000001'::uuid, '800LINEA00', 'Kit 2 Pçs Toalha de Banho Linea 260g 125x65cm', 'Moderna', 24.23),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CCABEACH2P00', 'Kit 2 Pçs Toalha de Banho para Praia Beach', 'Praia', 72.71),
  ('00000000-0000-0000-0000-000000000001'::uuid, '107SDAREF12', 'Refil para Difusor de Ambiente Classic 100ml', 'Refil', 17.00),
  ('00000000-0000-0000-0000-000000000001'::uuid, '107SDA25', 'Difusor Classic Frasco Vidro 100ml', 'Aroma', 31.00)
ON CONFLICT (organization_id, sku) DO NOTHING;
```

---

## 🛠️ Prisma Schema (alternativa)

Se preferir usar Prisma ORM, aqui está o schema equivalente:

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Organization
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  website   String?
  logoUrl   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users               User[]
  products            Product[]
  platformConfigs     PlatformConfig[]
  pricings            Pricing[]
  orders              Order[]
  seoCampaigns        SeoCampaign[]
  seoKeywords         SeoKeyword[]
  seoContentAudits    SeoContentAudit[]
  auditLogs           AuditLog[]

  @@index([slug])
}

// User
model User {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  email           String
  fullName        String?
  role            String   @default("operador") // 'admin' | 'operador' | 'visualizador'
  isActive        Boolean  @default(true)
  lastLogin       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  pricings     Pricing[]
  orders       Order[]
  auditLogs    AuditLog[]

  @@unique([organizationId, email])
  @@index([organizationId])
  @@index([email])
}

// Product
model Product {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  sku             String
  name            String
  description     String?
  costPrice       Decimal  @db.Decimal(10, 2)
  imageUrl        String?
  isActive        Boolean  @default(true)
  notes           String?
  createdById     String?
  createdBy       User?    @relation(fields: [createdById], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  pricings     Pricing[]
  orderItems   OrderItem[]
  seoKeywords  SeoKeyword[]
  seoAudits    SeoContentAudit[]

  @@unique([organizationId, sku])
  @@index([organizationId])
  @@index([sku])
}

// Platform Config
model PlatformConfig {
  id                String   @id @default(cuid())
  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  platform          String // 'mercado_livre' | 'shopee' | 'amazon' | 'site_proprio'
  commissionRate    Decimal  @db.Decimal(5, 2)
  fixedFee          Decimal  @default(0) @db.Decimal(10, 2)
  taxRate           Decimal  @default(0) @db.Decimal(5, 2)
  shippingIncluded  Boolean  @default(false)
  description       String?
  isActive          Boolean  @default(true)
  createdById       String?
  createdBy         User?    @relation(fields: [createdById], references: [id])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([organizationId, platform])
  @@index([organizationId])
}

// Pricing
model Pricing {
  id                String   @id @default(cuid())
  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  productId         String
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  platform          String
  costPrice         Decimal  @db.Decimal(10, 2)
  shippingCost      Decimal  @default(0) @db.Decimal(10, 2)
  commissionRate    Decimal  @db.Decimal(5, 2)
  fixedFee          Decimal  @default(0) @db.Decimal(10, 2)
  taxRate           Decimal  @default(0) @db.Decimal(5, 2)
  desiredMargin     Decimal  @db.Decimal(5, 2)
  suggestedPrice    Decimal  @db.Decimal(10, 2)
  netProfit         Decimal  @db.Decimal(10, 2)
  netMarginPercent  Decimal  @db.Decimal(5, 2)
  notes             String?
  isPublished       Boolean  @default(false)
  publishedAt       DateTime?
  createdById       String
  createdBy         User     @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdAt         DateTime @default(now())

  @@index([organizationId])
  @@index([productId])
  @@index([platform])
  @@index([createdAt])
}

// Order
model Order {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  externalId      String?
  platform        String
  orderDate       DateTime
  status          String   @default("pendente")
  customerName    String?
  customerEmail   String?
  customerCity    String?
  customerState   String?
  grossRevenue    Decimal  @db.Decimal(10, 2)
  platformFee     Decimal  @default(0) @db.Decimal(10, 2)
  shippingCost    Decimal  @default(0) @db.Decimal(10, 2)
  productCost     Decimal  @default(0) @db.Decimal(10, 2)
  taxes           Decimal  @default(0) @db.Decimal(10, 2)
  netProfit       Decimal  @db.Decimal(10, 2) // GENERATED ALWAYS AS
  netMargin       Decimal  @db.Decimal(5, 2)  // GENERATED ALWAYS AS
  notes           String?
  source          String   @default("manual")
  sourceSyncId    String?
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  items OrderItem[]

  @@unique([organizationId, externalId, platform])
  @@index([organizationId])
  @@index([platform])
  @@index([status])
  @@index([createdAt])
}

// Order Item
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String?
  product     Product? @relation(fields: [productId], references: [id])
  sku         String?
  productName String
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  unitCost    Decimal  @default(0) @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)

  @@index([orderId])
  @@index([productId])
}

// SEO Campaign
model SeoCampaign {
  id            String   @id @default(cuid())
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name          String
  platform      String
  type          String
  status        String   @default("ativo")
  budget        Decimal? @db.Decimal(10, 2)
  spent         Decimal  @default(0) @db.Decimal(10, 2)
  impressions   BigInt   @default(0)
  clicks        BigInt   @default(0)
  conversions   Int      @default(0)
  revenue       Decimal  @default(0) @db.Decimal(10, 2)
  startDate     DateTime
  endDate       DateTime?
  notes         String?
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  keywords SeoKeyword[]

  @@index([organizationId])
  @@index([platform])
  @@index([status])
}

// SEO Keyword
model SeoKeyword {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  campaignId      String?
  campaign        SeoCampaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)
  keyword         String
  platform        String
  productId       String?
  product         Product? @relation(fields: [productId], references: [id])
  searchVolume    Int?
  competition     String?
  currentPosition Int?
  targetPosition  Int?
  monthlySearches Int?
  notes           String?
  lastChecked     DateTime?
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([organizationId])
  @@index([campaignId])
  @@index([keyword])
}

// SEO Content Audit
model SeoContentAudit {
  id                String   @id @default(cuid())
  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  productId         String
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  platform          String
  currentTitle      String?
  suggestedTitle    String?
  currentDescription String?
  suggestedDescription String?
  score             Int?
  issues            Json?
  createdById       String
  createdBy         User     @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdAt         DateTime @default(now())

  @@index([organizationId])
  @@index([productId])
}

// Audit Log
model AuditLog {
  id          String   @id @default(cuid())
  organizationId String
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action      String
  tableName   String?
  recordId    String?
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([organizationId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

---

## 🚀 Como Usar

### 1. **No Supabase (direto)**
- Vá para SQL Editor no painel Supabase
- Cole os schemas SQL das tabelas
- Execute os seed data

### 2. **Com Prisma (recomendado)**
- Copie o schema acima para `prisma/schema.prisma`
- Rode `npx prisma migrate dev --name init`
- Seed automático com `prisma/seed.ts`

### 3. **Migração pós-MVP**
- Schemas estão prontos para crescer (relations, índices otimizados)
- RLS protege dados automaticamente
- Audit logs rastreiam tudo

---

## 📝 Notas Importantes

- **Multi-tenancy**: Estrutura preparada para múltiplas organizações
- **RLS**: Todos os dados são filtrados por `organization_id` automaticamente
- **Índices**: Otimizados para queries comuns (filtros por plataforma, período, etc)
- **Constraints**: Validações de negócio no DB (margem entre 5-100%, preço > 0, etc)
- **Generated columns**: `net_profit` e `net_margin` são calculados automaticamente
- **Seed data**: 16 produtos reais da planilha anexada

---

## 🔗 Dependências

- Supabase (PostgreSQL 14+)
- Prisma (opcional, mas recomendado)
- Node.js 18+

---

*Última atualização: 2025-05-08*
