
-- Criar tabela de categorias dinâmicas
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna de estoque mínimo na tabela de produtos
ALTER TABLE public.products 
ADD COLUMN minimum_stock INTEGER NOT NULL DEFAULT 5;

-- Modificar a tabela products para usar referência de categoria
ALTER TABLE public.products 
DROP COLUMN category;

ALTER TABLE public.products 
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Habilitar RLS para categorias
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias (todos os administradores podem acessar)
CREATE POLICY "Administradores podem visualizar categorias" 
  ON public.categories 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem criar categorias" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem atualizar categorias" 
  ON public.categories 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem deletar categorias" 
  ON public.categories 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

-- Inserir categorias padrão
INSERT INTO public.categories (name, description) VALUES
('Livros', 'Livros religiosos e espirituais'),
('Artigos Religiosos', 'Objetos e artigos para devoção');

-- Atualizar produtos existentes para usar as novas categorias
UPDATE public.products 
SET category_id = (SELECT id FROM public.categories WHERE name = 'Livros')
WHERE name LIKE '%Bíblia%' OR name LIKE '%Missal%' OR name LIKE '%Santos%';

UPDATE public.products 
SET category_id = (SELECT id FROM public.categories WHERE name = 'Artigos Religiosos')
WHERE category_id IS NULL;

-- Tornar category_id obrigatório
ALTER TABLE public.products 
ALTER COLUMN category_id SET NOT NULL;

-- Criar trigger para atualizar updated_at em categorias
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
