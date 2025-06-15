
-- 1. Tabela de promoções
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Relação produto <-> promoção (um produto pode estar em várias promoções, e uma promoção pode ter vários produtos)
CREATE TABLE public.product_promotions (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, promotion_id)
);

-- 3. Adicionar campo para rastrear em qual promoção a venda foi feita
ALTER TABLE public.sales
ADD COLUMN promotion_id UUID REFERENCES public.promotions(id);

-- 4. Otimização: índice para buscas rápidas
CREATE INDEX idx_product_promotions_promotion_id ON public.product_promotions(promotion_id);
CREATE INDEX idx_product_promotions_product_id ON public.product_promotions(product_id);

-- 5. Atualizar triggers de updated_at (se houver), caso necessário
-- (não obrigatório neste momento)

-- 6. (Opcional) Políticas de RLS podem ser implementadas depois deste primeiro passo.
