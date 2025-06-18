
-- Função para deletar todas as categorias (apenas se não houver produtos)
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

  -- Deletar todas as categorias
  DELETE FROM public.categories;

  RETURN deleted_count;
END;
$$;

-- Função para deletar todos os produtos
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

  -- Restaurar estoque não é necessário pois vamos deletar tudo
  -- Contar quantos produtos serão deletados
  SELECT COUNT(*) INTO deleted_count FROM public.products;

  -- Deletar vendas relacionadas aos produtos
  DELETE FROM public.sales WHERE product_id IN (SELECT id FROM public.products);
  
  -- Deletar relacionamentos de promoções
  DELETE FROM public.product_promotions WHERE product_id IN (SELECT id FROM public.products);
  
  -- Deletar todos os produtos
  DELETE FROM public.products;

  RETURN deleted_count;
END;
$$;

-- Função para atualizar categoria
CREATE OR REPLACE FUNCTION public.update_category_by_id(
  category_id_to_update UUID,
  new_name TEXT,
  new_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_email TEXT;
  old_category_data JSONB;
BEGIN
  -- Verificar se o usuário atual é o Rafael
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'rafael.christiano@yahoo.com.br' THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode atualizar categorias';
  END IF;

  -- Obter dados antigos para log
  SELECT to_jsonb(categories) INTO old_category_data FROM public.categories WHERE id = category_id_to_update;

  -- Atualizar a categoria
  UPDATE public.categories 
  SET 
    name = new_name,
    description = new_description,
    updated_at = now()
  WHERE id = category_id_to_update;

  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id, details, old_values
  ) VALUES (
    auth.uid(), 
    'UPDATE_CATEGORY', 
    'categories', 
    category_id_to_update,
    jsonb_build_object('updated_fields', jsonb_build_object('name', new_name, 'description', new_description)),
    old_category_data
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar categoria: %', SQLERRM;
END;
$$;

-- Função para atualizar produto
CREATE OR REPLACE FUNCTION public.update_product_by_id(
  product_id_to_update UUID,
  new_name TEXT,
  new_price NUMERIC,
  new_description TEXT DEFAULT NULL,
  new_product_code TEXT DEFAULT NULL,
  new_category_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_email TEXT;
  old_product_data JSONB;
BEGIN
  -- Verificar se o usuário atual é o Rafael
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'rafael.christiano@yahoo.com.br' THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode atualizar produtos';
  END IF;

  -- Obter dados antigos para log
  SELECT to_jsonb(products) INTO old_product_data FROM public.products WHERE id = product_id_to_update;

  -- Atualizar o produto
  UPDATE public.products 
  SET 
    name = COALESCE(new_name, name),
    price = COALESCE(new_price, price),
    description = COALESCE(new_description, description),
    product_code = COALESCE(new_product_code, product_code),
    category_id = COALESCE(new_category_id, category_id),
    updated_at = now()
  WHERE id = product_id_to_update;

  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id, details, old_values
  ) VALUES (
    auth.uid(), 
    'UPDATE_PRODUCT', 
    'products', 
    product_id_to_update,
    jsonb_build_object('updated_fields', jsonb_build_object(
      'name', new_name, 
      'price', new_price, 
      'description', new_description,
      'product_code', new_product_code,
      'category_id', new_category_id
    )),
    old_product_data
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar produto: %', SQLERRM;
END;
$$;

-- Corrigir a função delete_all_sales para evitar erro de UPDATE sem WHERE
CREATE OR REPLACE FUNCTION public.delete_all_sales()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
  current_user_email TEXT;
  product_record RECORD;
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

  -- Restaurar estoque para todos os produtos vendidos usando um loop
  FOR product_record IN 
    SELECT product_id, SUM(quantity) as total_quantity 
    FROM public.sales 
    GROUP BY product_id
  LOOP
    UPDATE public.products 
    SET stock_quantity = stock_quantity + product_record.total_quantity
    WHERE id = product_record.product_id;
  END LOOP;

  -- Contar quantas vendas serão deletadas
  SELECT COUNT(*) INTO deleted_count FROM public.sales;

  -- Deletar todas as vendas
  DELETE FROM public.sales;

  RETURN deleted_count;
END;
$$;
