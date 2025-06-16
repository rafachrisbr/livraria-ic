
import { useEnvironment } from '@/contexts/EnvironmentContext';

export const useSupabase = () => {
  const { supabaseClient } = useEnvironment();
  return supabaseClient;
};
