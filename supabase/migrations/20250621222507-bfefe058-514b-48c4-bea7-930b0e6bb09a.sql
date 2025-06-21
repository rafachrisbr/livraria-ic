
-- Criar tabela para registrar movimentações de estoque
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Política para visualizar movimentações (todos os administradores podem ver)
CREATE POLICY "Administrators can view stock movements" 
  ON public.stock_movements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.administrators 
      WHERE administrators.user_id = auth.uid()
    )
  );

-- Política para inserir movimentações (todos os administradores podem inserir)
CREATE POLICY "Administrators can insert stock movements" 
  ON public.stock_movements 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.administrators 
      WHERE administrators.user_id = auth.uid()
    )
  );

-- Função para registrar movimentação de estoque
CREATE OR REPLACE FUNCTION public.register_stock_movement(
  p_product_id UUID,
  p_movement_type TEXT,
  p_quantity INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock INTEGER;
  new_stock_value INTEGER;
BEGIN
  -- Verificar se o usuário é administrador
  IF NOT EXISTS (
    SELECT 1 FROM public.administrators 
    WHERE administrators.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem movimentar estoque';
  END IF;

  -- Obter estoque atual
  SELECT stock_quantity INTO current_stock 
  FROM public.products 
  WHERE id = p_product_id;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;

  -- Calcular novo estoque
  IF p_movement_type = 'entry' THEN
    new_stock_value := current_stock + p_quantity;
  ELSIF p_movement_type = 'exit' THEN
    new_stock_value := current_stock - p_quantity;
    IF new_stock_value < 0 THEN
      RAISE EXCEPTION 'Estoque insuficiente para esta saída';
    END IF;
  ELSE
    RAISE EXCEPTION 'Tipo de movimentação inválido';
  END IF;

  -- Atualizar estoque do produto
  UPDATE public.products 
  SET stock_quantity = new_stock_value 
  WHERE id = p_product_id;

  -- Registrar movimentação
  INSERT INTO public.stock_movements (
    product_id, movement_type, quantity, previous_stock, new_stock, reason, user_id
  ) VALUES (
    p_product_id, p_movement_type, p_quantity, current_stock, new_stock_value, p_reason, auth.uid()
  );

  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id, details
  ) VALUES (
    auth.uid(), 
    'STOCK_MOVEMENT', 
    'stock_movements', 
    p_product_id,
    jsonb_build_object(
      'movement_type', p_movement_type,
      'quantity', p_quantity,
      'previous_stock', current_stock,
      'new_stock', new_stock_value,
      'reason', p_reason
    )
  );

  RETURN TRUE;
END;
$$;

-- Trigger para registrar movimentações automáticas nas vendas
CREATE OR REPLACE FUNCTION public.register_sale_stock_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  -- Obter informações do produto
  SELECT stock_quantity, name INTO current_stock, product_name
  FROM public.products 
  WHERE id = NEW.product_id;

  -- Registrar movimentação de saída
  INSERT INTO public.stock_movements (
    product_id, movement_type, quantity, previous_stock, new_stock, reason, user_id
  ) VALUES (
    NEW.product_id, 
    'exit', 
    NEW.quantity, 
    current_stock + NEW.quantity, -- Estoque antes da venda
    current_stock, -- Estoque após a venda
    'Venda - ' || product_name,
    NEW.administrator_id
  );

  RETURN NEW;
END;
$$;

-- Criar trigger para vendas
CREATE TRIGGER trigger_register_sale_stock_movement
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.register_sale_stock_movement();
