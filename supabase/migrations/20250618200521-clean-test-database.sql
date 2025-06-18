
-- Limpar banco de dados de teste
DELETE FROM public.sales;
DELETE FROM public.product_promotions;
DELETE FROM public.promotions;
DELETE FROM public.products;
DELETE FROM public.audit_logs;
DELETE FROM public.categories;

-- Inserir categorias básicas para o ambiente de teste
INSERT INTO public.categories (id, name, description) VALUES 
(gen_random_uuid(), 'Livros', 'Livros religiosos e espirituais'),
(gen_random_uuid(), 'Artigos Religiosos', 'Objetos e artigos para devoção');
