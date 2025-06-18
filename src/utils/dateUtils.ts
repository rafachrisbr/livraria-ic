
// Utilitários para formatação de datas com timezone do Brasil
export const formatDateToBrazil = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDateOnlyToBrazil = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatTimeToBrazil = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Função para garantir que sempre usamos o timezone correto
export const getBrazilCurrentTime = () => {
  return new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
};
