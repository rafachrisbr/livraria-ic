
-- Inserir o usuário atual como administrador (usando o email da sessão de login)
INSERT INTO public.administrators (user_id, email, name)
SELECT 
  '8ba38b91-0c12-4de1-9022-d06d08b12f98'::uuid,
  'rafael.christiano@yahoo.com.br',
  'Rafael Christiano'
ON CONFLICT (email) DO NOTHING;

-- Criar função para automaticamente adicionar usuários como administradores
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir novo usuário como administrador automaticamente
  INSERT INTO public.administrators (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um usuário confirmar o email
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_admin();

-- Comentários para documentar as funções
COMMENT ON FUNCTION public.handle_new_user_admin() IS 'Função para automaticamente registrar usuários confirmados como administradores';
