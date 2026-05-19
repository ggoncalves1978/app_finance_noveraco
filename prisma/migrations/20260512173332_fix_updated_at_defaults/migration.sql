-- Prisma gerencia updated_at no ORM, mas triggers e seeds SQL direto precisam de um DEFAULT.
-- Adiciona DEFAULT NOW() às colunas updated_at que são NOT NULL sem default.

ALTER TABLE organizations ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE users        ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE products     ALTER COLUMN updated_at SET DEFAULT NOW();

-- Remove o usuário fake criado pelo seed (UUID fixo não corresponde a nenhum auth.users).
-- O trigger recriará o usuário corretamente quando o admin for cadastrado no Supabase Auth.
DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001';

-- Recria o trigger incluindo updated_at explicitamente
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_org_id uuid;
  v_role   public.user_role;
BEGIN
  SELECT id INTO v_org_id FROM public.organizations ORDER BY created_at LIMIT 1;

  -- Primeiro usuário da org vira ADMIN; demais OPERADOR
  IF (SELECT COUNT(*) FROM public.users WHERE organization_id = v_org_id) = 0 THEN
    v_role := 'ADMIN';
  ELSE
    v_role := 'OPERADOR';
  END IF;

  INSERT INTO public.users (id, organization_id, email, name, role, updated_at)
  VALUES (
    NEW.id,
    v_org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_role,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
