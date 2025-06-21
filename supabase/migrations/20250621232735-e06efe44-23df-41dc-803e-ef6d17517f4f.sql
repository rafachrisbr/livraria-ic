
-- Limpar dados do banco mantendo apenas o usuário rafael.christiano@yahoo.com.br

-- 1. Deletar vendas (isso vai limpar as referências para promoções)
DELETE FROM public.sales;

-- 2. Deletar associações produto-promoção
DELETE FROM public.product_promotions;

-- 3. Deletar promoções
DELETE FROM public.promotions;

-- 4. Deletar produtos
DELETE FROM public.products;

-- 5. Deletar categorias
DELETE FROM public.categories;

-- 6. Deletar movimentações de estoque
DELETE FROM public.stock_movements;

-- 7. Deletar logs de auditoria
DELETE FROM public.audit_logs;

-- 8. Deletar administradores exceto o rafael.christiano@yahoo.com.br
DELETE FROM public.administrators 
WHERE email != 'rafael.christiano@yahoo.com.br';

-- 9. Deletar usuários exceto o rafael.christiano@yahoo.com.br
DELETE FROM auth.users 
WHERE email != 'rafael.christiano@yahoo.com.br';

-- 10. Corrigir a foreign key constraint para permitir exclusão de promoções
-- Remover a constraint atual
ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_promotion_id_fkey;

-- Recriar a constraint com ON DELETE SET NULL para permitir exclusão de promoções
ALTER TABLE public.sales 
ADD CONSTRAINT sales_promotion_id_fkey 
FOREIGN KEY (promotion_id) 
REFERENCES public.promotions(id) 
ON DELETE SET NULL;
