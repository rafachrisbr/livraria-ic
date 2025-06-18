
import { useMemo } from 'react';
import { useEnvironment } from '@/contexts/EnvironmentContext';

export const useSupabase = () => {
  const { supabaseClient } = useEnvironment();
  
  // Memoizar o cliente para evitar re-renders desnecessários
  return useMemo(() => supabaseClient, [supabaseClient]);
};
