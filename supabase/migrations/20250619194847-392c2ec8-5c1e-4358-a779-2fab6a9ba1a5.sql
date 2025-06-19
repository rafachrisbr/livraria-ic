
-- Limpar banco de dados para produção mantendo apenas o usuário Rafael
-- Esta operação é irreversível!

-- Limpar todas as vendas
DELETE FROM public.sales;

-- Limpar todas as promoções de produtos
DELETE FROM public.product_promotions;

-- Limpar todas as promoções
DELETE FROM public.promotions;

-- Limpar todos os produtos
DELETE FROM public.products;

-- Limpar todos os logs de auditoria
DELETE FROM public.audit_logs;

-- Limpar todas as categorias
DELETE FROM public.categories;

-- Limpar administradores EXCETO o Rafael
DELETE FROM public.administrators 
WHERE email != 'rafael.christiano@yahoo.com.br';

-- Limpar usuários de auth EXCETO o Rafael
DELETE FROM auth.users 
WHERE email != 'rafael.christiano@yahoo.com.br';

-- Garantir que o Rafael está registrado como administrador
INSERT INTO public.administrators (user_id, email, name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', 'Rafael Christiano')
FROM auth.users
WHERE email = 'rafael.christiano@yahoo.com.br'
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, administrators.name);

-- Inserir categorias básicas para produção
INSERT INTO public.categories (id, name, description) VALUES 
(gen_random_uuid(), 'Livros', 'Livros religiosos e espirituais'),
(gen_random_uuid(), 'Artigos Religiosos', 'Objetos e artigos para devoção'),
(gen_random_uuid(), 'Terços e Rosários', 'Terços, rosários e instrumentos de oração'),
(gen_random_uuid(), 'Imagens e Quadros', 'Imagens sacras e quadros religiosos');

-- Verificar resultado final
SELECT 
  'users' as table_name, 
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM auth.users
UNION ALL
SELECT 
  'administrators' as table_name, 
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails  
FROM public.administrators
UNION ALL
SELECT 'products', COUNT(*), 'N/A' FROM public.products
UNION ALL
SELECT 'sales', COUNT(*), 'N/A' FROM public.sales
UNION ALL
SELECT 'categories', COUNT(*), 'N/A' FROM public.categories
UNION ALL
SELECT 'audit_logs', COUNT(*), 'N/A' FROM public.audit_logs;
