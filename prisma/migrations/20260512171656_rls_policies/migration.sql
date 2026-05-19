-- ─── Row Level Security — Novera Co. ─────────────────────────────────────────
-- Estratégia: isolamento por organization_id.
-- service_role (usado no servidor) bypassa RLS automaticamente.
-- Políticas abaixo se aplicam ao anon key / JWT de usuário autenticado.

-- ─── Habilitar RLS em todas as tabelas ───────────────────────────────────────

ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_configs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_campaigns       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords        ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_audits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- ─── Funções helper (SECURITY DEFINER evita recursão no RLS) ─────────────────

CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- ─── organizations ────────────────────────────────────────────────────────────

CREATE POLICY "org_select" ON organizations
  FOR SELECT USING (id = get_user_org_id());

CREATE POLICY "org_update" ON organizations
  FOR UPDATE USING (id = get_user_org_id() AND get_user_role() = 'ADMIN');

-- ─── users ────────────────────────────────────────────────────────────────────

CREATE POLICY "users_select" ON users
  FOR SELECT USING (organization_id = get_user_org_id());

-- Somente admin cria usuários (server-side usa service_role e bypassa)
CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (
    organization_id = get_user_org_id()
    AND get_user_role() = 'ADMIN'
  );

-- Admin edita qualquer membro; usuário edita apenas a si mesmo
CREATE POLICY "users_update" ON users
  FOR UPDATE USING (
    organization_id = get_user_org_id()
    AND (id = auth.uid() OR get_user_role() = 'ADMIN')
  );

-- Somente admin exclui; não pode se auto-excluir
CREATE POLICY "users_delete" ON users
  FOR DELETE USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'ADMIN'
    AND id <> auth.uid()
  );

-- ─── products ─────────────────────────────────────────────────────────────────

CREATE POLICY "products_select" ON products
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('ADMIN', 'OPERADOR')
  );

CREATE POLICY "products_update" ON products
  FOR UPDATE USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('ADMIN', 'OPERADOR')
  );

CREATE POLICY "products_delete" ON products
  FOR DELETE USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'ADMIN'
  );

-- ─── platform_configs ─────────────────────────────────────────────────────────

CREATE POLICY "platform_configs_select" ON platform_configs
  FOR SELECT USING (organization_id = get_user_org_id());

-- Somente admin altera taxas de plataforma
CREATE POLICY "platform_configs_write" ON platform_configs
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'ADMIN'
  );

-- ─── pricings ─────────────────────────────────────────────────────────────────

CREATE POLICY "pricings_select" ON pricings
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "pricings_insert" ON pricings
  FOR INSERT WITH CHECK (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('ADMIN', 'OPERADOR')
    AND created_by = auth.uid()
  );

-- Precificações são imutáveis após criação (histórico); só admin pode alterar
CREATE POLICY "pricings_update" ON pricings
  FOR UPDATE USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'ADMIN'
  );

CREATE POLICY "pricings_delete" ON pricings
  FOR DELETE USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'ADMIN'
  );

-- ─── orders ───────────────────────────────────────────────────────────────────

CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('ADMIN', 'OPERADOR')
    AND created_by = auth.uid()
  );

CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('ADMIN', 'OPERADOR')
  );

CREATE POLICY "orders_delete" ON orders
  FOR DELETE USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'ADMIN'
  );

-- ─── order_items ──────────────────────────────────────────────────────────────
-- Acesso delegado ao pedido pai (sem organization_id próprio)

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE organization_id = get_user_org_id())
  );

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders
      WHERE organization_id = get_user_org_id()
        AND get_user_role() IN ('ADMIN', 'OPERADOR')
    )
  );

CREATE POLICY "order_items_update" ON order_items
  FOR UPDATE USING (
    order_id IN (
      SELECT id FROM orders
      WHERE organization_id = get_user_org_id()
        AND get_user_role() IN ('ADMIN', 'OPERADOR')
    )
  );

CREATE POLICY "order_items_delete" ON order_items
  FOR DELETE USING (
    order_id IN (
      SELECT id FROM orders
      WHERE organization_id = get_user_org_id()
        AND get_user_role() = 'ADMIN'
    )
  );

-- ─── seo_campaigns ────────────────────────────────────────────────────────────

CREATE POLICY "seo_campaigns_select" ON seo_campaigns
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "seo_campaigns_write" ON seo_campaigns
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('ADMIN', 'OPERADOR')
  );

-- ─── seo_keywords ─────────────────────────────────────────────────────────────

CREATE POLICY "seo_keywords_select" ON seo_keywords
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "seo_keywords_write" ON seo_keywords
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('ADMIN', 'OPERADOR')
  );

-- ─── seo_content_audits ───────────────────────────────────────────────────────

CREATE POLICY "seo_content_audits_select" ON seo_content_audits
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "seo_content_audits_write" ON seo_content_audits
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('ADMIN', 'OPERADOR')
  );

-- ─── audit_logs ───────────────────────────────────────────────────────────────
-- Admin lê todos os logs da org; operador/visualizador vê apenas os próprios.
-- INSERT bloqueado para cliente — apenas service_role (server-side) pode inserir.

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    CASE get_user_role()
      WHEN 'ADMIN' THEN
        user_id IN (SELECT id FROM users WHERE organization_id = get_user_org_id())
      ELSE
        user_id = auth.uid()
    END
  );

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (false);
