
-- Adicionar função para listar todos os usuários (apenas para super admin)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é o Rafael
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'rafael.christiano@yahoo.com.br'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode executar esta função';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    EXISTS(SELECT 1 FROM public.administrators WHERE administrators.user_id = au.id) as is_admin
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Adicionar função para deletar usuário (apenas para super admin)
CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id_to_delete UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_email TEXT;
  target_user_email TEXT;
BEGIN
  -- Verificar se o usuário atual é o Rafael
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'rafael.christiano@yahoo.com.br' THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode deletar usuários';
  END IF;

  -- Verificar se está tentando deletar a si mesmo
  IF user_id_to_delete = auth.uid() THEN
    RAISE EXCEPTION 'Não é possível deletar sua própria conta';
  END IF;

  -- Obter email do usuário a ser deletado para logs
  SELECT email INTO target_user_email FROM auth.users WHERE id = user_id_to_delete;

  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id, details
  ) VALUES (
    auth.uid(), 
    'DELETE_USER', 
    'auth.users', 
    user_id_to_delete,
    jsonb_build_object('deleted_user_email', target_user_email)
  );

  -- Deletar dados relacionados primeiro
  DELETE FROM public.administrators WHERE user_id = user_id_to_delete;
  
  -- Deletar o usuário (isso irá cascatear para outras tabelas)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao deletar usuário: %', SQLERRM;
END;
$$;

-- Adicionar função para deletar todas as vendas (apenas para super admin)
CREATE OR REPLACE FUNCTION public.delete_all_sales()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
  current_user_email TEXT;
BEGIN
  -- Verificar se o usuário atual é o Rafael
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'rafael.christiano@yahoo.com.br' THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode deletar todas as vendas';
  END IF;

  -- Log da operação antes de deletar
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, details
  ) VALUES (
    auth.uid(), 
    'DELETE_ALL_SALES', 
    'sales',
    jsonb_build_object('operation', 'delete_all_sales', 'timestamp', now())
  );

  -- Restaurar estoque para todos os produtos vendidos
  UPDATE public.products 
  SET stock_quantity = stock_quantity + (
    SELECT COALESCE(SUM(s.quantity), 0) 
    FROM public.sales s 
    WHERE s.product_id = products.id
  );

  -- Contar quantas vendas serão deletadas
  SELECT COUNT(*) INTO deleted_count FROM public.sales;

  -- Deletar todas as vendas
  DELETE FROM public.sales;

  RETURN deleted_count;
END;
$$;
