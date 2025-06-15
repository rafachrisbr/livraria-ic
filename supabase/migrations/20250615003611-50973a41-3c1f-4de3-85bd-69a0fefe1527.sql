
-- Criar tabela de administradores
CREATE TABLE public.administrators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar enum para categorias de produtos
CREATE TYPE public.product_category AS ENUM ('livros', 'artigos_religiosos');

-- Criar enum para meio de pagamento
CREATE TYPE public.payment_method AS ENUM ('dinheiro', 'cartao_debito', 'cartao_credito', 'pix', 'outros');

-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category product_category NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de vendas
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products NOT NULL,
  administrator_id UUID REFERENCES public.administrators NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  notes TEXT,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para administradores
CREATE POLICY "Administradores podem ver seus próprios dados" 
  ON public.administrators 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Administradores podem inserir seus próprios dados" 
  ON public.administrators 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar políticas RLS para produtos (todos os administradores podem acessar)
CREATE POLICY "Administradores podem visualizar produtos" 
  ON public.products 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem criar produtos" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem atualizar produtos" 
  ON public.products 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem deletar produtos" 
  ON public.products 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

-- Criar políticas RLS para vendas (todos os administradores podem acessar)
CREATE POLICY "Administradores podem visualizar vendas" 
  ON public.sales 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem criar vendas" 
  ON public.sales 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem atualizar vendas" 
  ON public.sales 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

CREATE POLICY "Administradores podem deletar vendas" 
  ON public.sales 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.administrators WHERE user_id = auth.uid()));

-- Criar função trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para produtos
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Inserir alguns produtos de exemplo
INSERT INTO public.products (name, category, description, price, stock_quantity) VALUES
('Bíblia Sagrada - Edição Popular', 'livros', 'Bíblia Sagrada tradicional com capa dura', 45.00, 25),
('Missal Dominical', 'livros', 'Missal para acompanhar as missas dominicais', 35.00, 3),
('Vida de Santos - Coleção', 'livros', 'Coleção completa com vidas dos santos', 68.00, 15),
('Terço de Madeira', 'artigos_religiosos', 'Terço tradicional feito em madeira', 15.00, 30),
('Escapulário do Carmo', 'artigos_religiosos', 'Escapulário tradicional do Carmo', 8.00, 50),
('Rosário Cristal', 'artigos_religiosos', 'Rosário em cristal para oração', 25.00, 2),
('Medalha São Bento', 'artigos_religiosos', 'Medalha de São Bento banhada a ouro', 12.00, 5);
