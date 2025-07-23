
-- Limpeza do banco de dados mantendo apenas usuários e administradores
-- Sequência: movimentações de estoque -> produtos -> categorias -> logs de auditoria

-- 1. Limpar movimentações de estoque
DELETE FROM public.stock_movements;

-- 2. Limpar produtos (isso também limpa vendas e associações produto-promoção automaticamente)
DELETE FROM public.products;

-- 3. Limpar categorias
DELETE FROM public.categories;

-- 4. Limpar logs de auditoria
DELETE FROM public.audit_logs;

-- 5. Verificar o estado final das tabelas
SELECT 'users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'administrators', COUNT(*) FROM public.administrators
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'categories', COUNT(*) FROM public.categories
UNION ALL
SELECT 'stock_movements', COUNT(*) FROM public.stock_movements
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs
UNION ALL
SELECT 'sales', COUNT(*) FROM public.sales
UNION ALL
SELECT 'promotions', COUNT(*) FROM public.promotions
UNION ALL
SELECT 'product_promotions', COUNT(*) FROM public.product_promotions
ORDER BY table_name;
