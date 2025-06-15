
-- Limpar vendas
DELETE FROM public.sales;

-- Limpar associações produto/promoção
DELETE FROM public.product_promotions;

-- Limpar promoções
DELETE FROM public.promotions;

-- Limpar produtos
DELETE FROM public.products;

-- Limpar administradores
DELETE FROM public.administrators;

-- Limpar logs de auditoria
DELETE FROM public.audit_logs;

-- (Opcional) Limpar categorias, se necessário
-- DELETE FROM public.categories;

-- Resumo de contagens após limpeza
SELECT 'sales' as table_name, COUNT(*) as count FROM public.sales
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'product_promotions', COUNT(*) FROM public.product_promotions
UNION ALL
SELECT 'promotions', COUNT(*) FROM public.promotions
UNION ALL
SELECT 'administrators', COUNT(*) FROM public.administrators
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs;
