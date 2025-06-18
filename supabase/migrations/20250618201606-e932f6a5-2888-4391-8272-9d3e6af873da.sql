
-- Limpar banco de dados de produção mantendo apenas o usuário Rafael
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

-- Inserir categorias básicas para o ambiente de produção
INSERT INTO public.categories (id, name, description) VALUES 
(gen_random_uuid(), 'Livros', 'Livros religiosos e espirituais'),
(gen_random_uuid(), 'Artigos Religiosos', 'Objetos e artigos para devoção');
