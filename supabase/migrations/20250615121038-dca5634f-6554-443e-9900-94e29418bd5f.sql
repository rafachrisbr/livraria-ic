
-- Limpar todas as vendas
DELETE FROM public.sales;

-- Limpar todos os produtos
DELETE FROM public.products;

-- Reiniciar as sequências se houverem (para IDs limpos)
-- Como usamos UUID, não há sequências para reiniciar

-- Verificar se há dados restantes
SELECT 'sales' as table_name, COUNT(*) as count FROM public.sales
UNION ALL
SELECT 'products' as table_name, COUNT(*) as count FROM public.products
UNION ALL
SELECT 'administrators' as table_name, COUNT(*) as count FROM public.administrators;
