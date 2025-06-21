
import { useState, useEffect } from 'react';
import { formatDateToBrazil } from '@/utils/dateUtils';

export const CurrentDateTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="text-xs text-slate-500 hidden sm:block">
      {formatTime(currentTime)}
    </div>
  );
};
