
import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const useSupabase = () => {
  // Usar diretamente o cliente de produção
  const supabaseClient = useMemo(() => {
    return createClient<Database>(
      "https://qrelbbzrktjadfkrimzw.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZWxiYnpya3RqYWRma3JpbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDcxNzQsImV4cCI6MjA2NTUyMzE3NH0.gVISB0NGBRPDR4_U_zQoE5N5wllA3cmkROpbpsJ2Wo0",
      {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );
  }, []);
  
  return supabaseClient;
};
