
-- Adicionar manualmente o usuário atual como administrador
INSERT INTO public.administrators (user_id, email, name)
VALUES ('b6f92e99-9330-420f-a815-d0fecef9d542', 'rafael.christiano@yahoo.com.br', 'Rafael Christiano')
ON CONFLICT (user_id) DO NOTHING;

-- Remover o trigger antigo que dependia da confirmação de email
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Modificar a função para funcionar no INSERT (signup) ao invés de UPDATE (confirmação)
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir novo usuário como administrador automaticamente no momento do signup
  INSERT INTO public.administrators (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Criar novo trigger para executar a função quando um usuário fizer signup
CREATE TRIGGER on_auth_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_admin();

-- Comentário para documentar a mudança
COMMENT ON FUNCTION public.handle_new_user_admin() IS 'Função para automaticamente registrar usuários no signup como administradores';
