
-- Corrigir a função get_all_users() para retornar dados no formato correto
CREATE OR REPLACE FUNCTION public.get_all_users()
 RETURNS TABLE(id uuid, email text, created_at timestamp with time zone, last_sign_in_at timestamp with time zone, is_admin boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    au.email::text,
    au.created_at,
    au.last_sign_in_at,
    EXISTS(SELECT 1 FROM public.administrators WHERE administrators.user_id = au.id) as is_admin
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_product_by_id(product_id_to_delete uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_email TEXT;
  product_name TEXT;
BEGIN
  -- Verificar se o usuário atual é o Rafael
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'rafael.christiano@yahoo.com.br' THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode deletar produtos';
  END IF;

  -- Obter nome do produto para logs
  SELECT name INTO product_name FROM public.products WHERE id = product_id_to_delete;

  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id, details
  ) VALUES (
    auth.uid(), 
    'DELETE_PRODUCT', 
    'products', 
    product_id_to_delete,
    jsonb_build_object('deleted_product_name', product_name)
  );

  -- Deletar vendas relacionadas ao produto
  DELETE FROM public.sales WHERE product_id = product_id_to_delete;
  
  -- Deletar relacionamentos de promoções
  DELETE FROM public.product_promotions WHERE product_id = product_id_to_delete;
  
  -- Deletar o produto
  DELETE FROM public.products WHERE id = product_id_to_delete;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao deletar produto: %', SQLERRM;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_category_by_id(category_id_to_delete uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_email TEXT;
  category_name TEXT;
  products_count INTEGER;
BEGIN
  -- Verificar se o usuário atual é o Rafael
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'rafael.christiano@yahoo.com.br' THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode deletar categorias';
  END IF;

  -- Verificar se existem produtos na categoria
  SELECT COUNT(*) INTO products_count FROM public.products WHERE category_id = category_id_to_delete;
  
  IF products_count > 0 THEN
    RAISE EXCEPTION 'Não é possível deletar categoria com produtos associados. Mova ou delete os produtos primeiro.';
  END IF;

  -- Obter nome da categoria para logs
  SELECT name INTO category_name FROM public.categories WHERE id = category_id_to_delete;

  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id, details
  ) VALUES (
    auth.uid(), 
    'DELETE_CATEGORY', 
    'categories', 
    category_id_to_delete,
    jsonb_build_object('deleted_category_name', category_name)
  );

  -- Deletar a categoria
  DELETE FROM public.categories WHERE id = category_id_to_delete;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao deletar categoria: %', SQLERRM;
END;
$function$;
