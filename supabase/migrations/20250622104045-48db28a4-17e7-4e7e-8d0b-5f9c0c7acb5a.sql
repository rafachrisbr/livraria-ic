
-- Corrigir a função delete_all_sales para usar WHERE TRUE
CREATE OR REPLACE FUNCTION public.delete_all_sales()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
  current_user_email TEXT;
  sale_record RECORD;
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

  -- Restaurar estoque produto por produto usando FOR loop
  FOR sale_record IN 
    SELECT product_id, SUM(quantity) as total_quantity 
    FROM public.sales 
    GROUP BY product_id
  LOOP
    UPDATE public.products 
    SET stock_quantity = stock_quantity + sale_record.total_quantity
    WHERE id = sale_record.product_id;
  END LOOP;

  -- Contar quantas vendas serão deletadas
  SELECT COUNT(*) INTO deleted_count FROM public.sales;

  -- Deletar todas as vendas com WHERE TRUE
  DELETE FROM public.sales WHERE TRUE;

  RETURN deleted_count;
END;
$$;

-- Corrigir a função delete_all_products para usar WHERE TRUE
CREATE OR REPLACE FUNCTION public.delete_all_products()
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
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode deletar todos os produtos';
  END IF;

  -- Log da operação antes de deletar
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, details
  ) VALUES (
    auth.uid(), 
    'DELETE_ALL_PRODUCTS', 
    'products',
    jsonb_build_object('operation', 'delete_all_products', 'timestamp', now())
  );

  -- Contar quantos produtos serão deletados
  SELECT COUNT(*) INTO deleted_count FROM public.products;

  -- Deletar vendas relacionadas primeiro com WHERE TRUE
  DELETE FROM public.sales WHERE product_id IN (SELECT id FROM public.products);
  
  -- Deletar relacionamentos de promoções com WHERE TRUE
  DELETE FROM public.product_promotions WHERE product_id IN (SELECT id FROM public.products);
  
  -- Deletar todos os produtos com WHERE TRUE
  DELETE FROM public.products WHERE TRUE;

  RETURN deleted_count;
END;
$$;

-- Corrigir a função delete_all_categories para usar WHERE TRUE
CREATE OR REPLACE FUNCTION public.delete_all_categories()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
  current_user_email TEXT;
  products_count INTEGER;
BEGIN
  -- Verificar se o usuário atual é o Rafael
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'rafael.christiano@yahoo.com.br' THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode deletar todas as categorias';
  END IF;

  -- Verificar se existem produtos em qualquer categoria
  SELECT COUNT(*) INTO products_count FROM public.products;
  
  IF products_count > 0 THEN
    RAISE EXCEPTION 'Não é possível deletar categorias enquanto houver produtos cadastrados. Delete todos os produtos primeiro.';
  END IF;

  -- Log da operação antes de deletar
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, details
  ) VALUES (
    auth.uid(), 
    'DELETE_ALL_CATEGORIES', 
    'categories',
    jsonb_build_object('operation', 'delete_all_categories', 'timestamp', now())
  );

  -- Contar quantas categorias serão deletadas
  SELECT COUNT(*) INTO deleted_count FROM public.categories;

  -- Deletar todas as categorias com WHERE TRUE
  DELETE FROM public.categories WHERE TRUE;

  RETURN deleted_count;
END;
$$;
