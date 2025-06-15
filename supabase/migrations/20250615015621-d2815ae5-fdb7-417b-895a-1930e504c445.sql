
-- Limpar todas as vendas
DELETE FROM public.sales;

-- Limpar todos os produtos
DELETE FROM public.products;

-- Limpar todos os administradores
DELETE FROM public.administrators;

-- Reinserir os produtos de exemplo
INSERT INTO public.products (name, category, description, price, stock_quantity) VALUES
('Bíblia Sagrada - Edição Popular', 'livros', 'Bíblia Sagrada tradicional com capa dura', 45.00, 25),
('Missal Dominical', 'livros', 'Missal para acompanhar as missas dominicais', 35.00, 3),
('Vida de Santos - Coleção', 'livros', 'Coleção completa com vidas dos santos', 68.00, 15),
('Terço de Madeira', 'artigos_religiosos', 'Terço tradicional feito em madeira', 15.00, 30),
('Escapulário do Carmo', 'artigos_religiosos', 'Escapulário tradicional do Carmo', 8.00, 50),
('Rosário Cristal', 'artigos_religiosos', 'Rosário em cristal para oração', 25.00, 2),
('Medalha São Bento', 'artigos_religiosos', 'Medalha de São Bento banhada a ouro', 12.00, 5);
