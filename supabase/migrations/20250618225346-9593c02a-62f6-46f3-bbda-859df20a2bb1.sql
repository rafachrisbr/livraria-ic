
-- Adicionar campos para armazenar dados históricos das promoções na tabela sales
ALTER TABLE public.sales 
ADD COLUMN promotion_name TEXT,
ADD COLUMN promotion_discount_type TEXT,
ADD COLUMN promotion_discount_value NUMERIC;

-- Migrar dados existentes: copiar informações das promoções para as vendas que já têm promotion_id
UPDATE public.sales 
SET 
  promotion_name = p.name,
  promotion_discount_type = p.discount_type,
  promotion_discount_value = p.discount_value
FROM public.promotions p 
WHERE sales.promotion_id = p.id 
  AND sales.promotion_name IS NULL;

-- Criar índice para melhorar performance de consultas
CREATE INDEX idx_sales_promotion_id ON public.sales(promotion_id) WHERE promotion_id IS NOT NULL;
