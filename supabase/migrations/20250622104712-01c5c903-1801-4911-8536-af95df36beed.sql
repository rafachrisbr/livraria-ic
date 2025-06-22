
-- Criar função para deletar todos os logs de auditoria com validação de palavra-chave
CREATE OR REPLACE FUNCTION public.delete_all_audit_logs(confirmation_keyword text)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
  current_user_email TEXT;
BEGIN
  -- Verificar se o usuário atual é o Rafael
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF current_user_email != 'rafael.christiano@yahoo.com.br' THEN
    RAISE EXCEPTION 'Acesso negado: apenas o super administrador pode deletar todos os logs';
  END IF;

  -- Verificar palavra-chave de confirmação
  IF confirmation_keyword != 'deletare' THEN
    RAISE EXCEPTION 'Palavra-chave de confirmação incorreta. Digite "deletare" para confirmar a operação.';
  END IF;

  -- Contar quantos logs serão deletados
  SELECT COUNT(*) INTO deleted_count FROM public.audit_logs;

  -- Log da operação antes de deletar (irônico, mas importante para rastreabilidade)
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, details
  ) VALUES (
    auth.uid(), 
    'DELETE_ALL_AUDIT_LOGS', 
    'audit_logs',
    jsonb_build_object(
      'operation', 'delete_all_audit_logs', 
      'timestamp', now(),
      'logs_deleted_count', deleted_count,
      'confirmation_keyword_used', confirmation_keyword
    )
  );

  -- Deletar todos os logs EXCETO o log que acabamos de criar
  DELETE FROM public.audit_logs 
  WHERE action_type != 'DELETE_ALL_AUDIT_LOGS' 
     OR created_at < now() - interval '1 second';

  RETURN deleted_count;
END;
$$;
