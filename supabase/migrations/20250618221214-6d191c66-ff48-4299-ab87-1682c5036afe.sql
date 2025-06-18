
-- Alterar o timezone padrão do banco para o horário de Brasília
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- Definir o timezone para a sessão atual também
SET timezone TO 'America/Sao_Paulo';

-- Verificar se a alteração foi aplicada
SHOW timezone;

-- Testar as funções de data/hora com o novo timezone
SELECT 
  NOW() as horario_atual_brasilia,
  CURRENT_TIMESTAMP as timestamp_atual,
  EXTRACT(timezone_hour FROM NOW()) as offset_horas,
  EXTRACT(timezone FROM NOW()) as timezone_info;
