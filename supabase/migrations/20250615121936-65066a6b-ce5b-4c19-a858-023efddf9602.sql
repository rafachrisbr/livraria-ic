
-- Criar tabela de auditoria
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todos os logs de auditoria (apenas administradores)
CREATE POLICY "Administrators can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- Política para permitir inserção de logs de auditoria
CREATE POLICY "Users can create audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar função para registrar logs de auditoria
CREATE OR REPLACE FUNCTION public.log_audit_action(
  p_action_type text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, details)
  VALUES (auth.uid(), p_action_type, p_table_name, p_record_id, p_details);
END;
$$;
