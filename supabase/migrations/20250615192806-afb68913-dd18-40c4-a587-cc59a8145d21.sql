
-- Adicionar novos campos à tabela audit_logs para capturar mais informações
ALTER TABLE public.audit_logs 
ADD COLUMN ip_address inet,
ADD COLUMN user_agent text,
ADD COLUMN old_values jsonb,
ADD COLUMN new_values jsonb;

-- Atualizar a função log_audit_action para aceitar os novos parâmetros
CREATE OR REPLACE FUNCTION public.log_audit_action(
  p_action_type text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id, details,
    old_values, new_values, ip_address, user_agent
  )
  VALUES (
    auth.uid(), p_action_type, p_table_name, p_record_id, p_details,
    p_old_values, p_new_values, p_ip_address, p_user_agent
  );
END;
$$;

-- Criar triggers automáticos para capturar mudanças nas tabelas principais

-- Função genérica para triggers de auditoria
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_type text;
  old_data jsonb;
  new_data jsonb;
  record_id uuid;
BEGIN
  -- Determinar o tipo de ação
  IF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
    record_id := OLD.id;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    record_id := NEW.id;
  ELSIF TG_OP = 'INSERT' THEN
    action_type := 'INSERT';
    old_data := NULL;
    new_data := to_jsonb(NEW);
    record_id := NEW.id;
  END IF;

  -- Inserir log de auditoria
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id,
    old_values, new_values
  )
  VALUES (
    auth.uid(), action_type, TG_TABLE_NAME, record_id,
    old_data, new_data
  );

  -- Retornar o registro apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Criar triggers para todas as tabelas principais
CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER sales_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER categories_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER administrators_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.administrators
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER promotions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Criar função para registrar eventos de autenticação
CREATE OR REPLACE FUNCTION public.log_auth_event(
  p_event_type text,
  p_details jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, details,
    ip_address, user_agent
  )
  VALUES (
    auth.uid(), p_event_type, 'auth', p_details,
    p_ip_address, p_user_agent
  );
END;
$$;

-- Adicionar índices para melhorar performance das consultas
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Comentários para documentar as mudanças
COMMENT ON COLUMN public.audit_logs.ip_address IS 'Endereço IP do usuário que executou a ação';
COMMENT ON COLUMN public.audit_logs.user_agent IS 'User agent do navegador/dispositivo usado';
COMMENT ON COLUMN public.audit_logs.old_values IS 'Valores anteriores do registro (para UPDATE e DELETE)';
COMMENT ON COLUMN public.audit_logs.new_values IS 'Novos valores do registro (para INSERT e UPDATE)';
