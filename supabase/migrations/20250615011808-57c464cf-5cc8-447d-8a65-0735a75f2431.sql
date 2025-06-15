
-- Corrigir a função handle_updated_at para ter search_path imutável
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Adicionar comentário para documentar a função
COMMENT ON FUNCTION public.handle_updated_at() IS 'Função para atualizar automaticamente o campo updated_at';
