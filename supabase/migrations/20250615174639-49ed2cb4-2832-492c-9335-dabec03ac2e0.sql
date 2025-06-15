
-- Habilitar RLS nas tabelas
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_promotions ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela promotions
CREATE POLICY "Qualquer usuário pode ver promoções ativas"
  ON public.promotions
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins podem inserir promoções"
  ON public.promotions
  FOR INSERT
  WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar promoções"
  ON public.promotions
  FOR UPDATE
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins podem remover promoções"
  ON public.promotions
  FOR DELETE
  USING (is_user_admin(auth.uid()));

-- Políticas para a tabela product_promotions
CREATE POLICY "Qualquer usuário pode ver associação produto/promoção"
  ON public.product_promotions
  FOR SELECT
  USING (true);

CREATE POLICY "Admins podem inserir product_promotions"
  ON public.product_promotions
  FOR INSERT
  WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar product_promotions"
  ON public.product_promotions
  FOR UPDATE
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins podem remover product_promotions"
  ON public.product_promotions
  FOR DELETE
  USING (is_user_admin(auth.uid()));
