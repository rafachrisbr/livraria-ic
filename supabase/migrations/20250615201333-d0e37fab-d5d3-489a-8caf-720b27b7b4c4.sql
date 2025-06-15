
-- Modificar a função de trigger de auditoria para lidar com contextos sem usuário autenticado
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
  current_user_id uuid;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Se não há usuário autenticado, não registrar auditoria
  -- Isso evita erros durante operações do sistema como criação de usuário
  IF current_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

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

  -- Inserir log de auditoria apenas se há usuário autenticado
  INSERT INTO public.audit_logs (
    user_id, action_type, table_name, record_id,
    old_values, new_values
  )
  VALUES (
    current_user_id, action_type, TG_TABLE_NAME, record_id,
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

-- Comentário para documentar a mudança
COMMENT ON FUNCTION public.audit_trigger_function() IS 'Função de trigger de auditoria que só registra logs quando há usuário autenticado, evitando erros durante operações do sistema';
