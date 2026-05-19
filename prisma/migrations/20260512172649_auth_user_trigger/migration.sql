-- Trigger: sincroniza auth.users → public.users automaticamente
-- Quando um novo usuário é criado no Supabase Auth, cria o registro na tabela users.
-- O primeiro usuário da organização recebe role ADMIN; os demais OPERADOR.

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
  -- Usa a única organização existente (app single-tenant)
  SELECT id INTO v_org_id FROM public.organizations ORDER BY created_at LIMIT 1;

  -- Primeiro usuário da org vira ADMIN; demais, OPERADOR
  IF (SELECT COUNT(*) FROM public.users WHERE organization_id = v_org_id) = 0 THEN
    v_role := 'ADMIN';
  ELSE
    v_role := 'OPERADOR';
  END IF;

  INSERT INTO public.users (id, organization_id, email, name, role)
  VALUES (
    NEW.id,
    v_org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Remove trigger anterior se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
