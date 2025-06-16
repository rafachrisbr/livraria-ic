
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Environment = 'production' | 'test';

interface EnvironmentConfig {
  url: string;
  anonKey: string;
}

interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  supabaseClient: SupabaseClient<Database>;
  isTestMode: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

// Configurações dos ambientes
const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
  production: {
    url: "https://qrelbbzrktjadfkrimzw.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZWxiYnpya3RqYWRma3JpbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDcxNzQsImV4cCI6MjA2NTUyMzE3NH0.gVISB0NGBRPDR4_U_zQoE5N5wllA3cmkROpbpsJ2Wo0"
  },
  test: {
    // Por enquanto usando o mesmo projeto, mas você pode criar um projeto separado
    url: "https://qrelbbzrktjadfkrimzw.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZWxiYnpya3RqYWRma3JpbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDcxNzQsImV4cCI6MjA2NTUyMzE3NH0.gVISB0NGBRPDR4_U_zQoE5N5wllA3cmkROpbpsJ2Wo0"
  }
};

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [environment, setEnvironmentState] = useState<Environment>(() => {
    const saved = localStorage.getItem('environment');
    return (saved as Environment) || 'production';
  });

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database>>(() => {
    const config = ENVIRONMENTS[environment];
    return createClient<Database>(config.url, config.anonKey);
  });

  const setEnvironment = (env: Environment) => {
    setEnvironmentState(env);
    localStorage.setItem('environment', env);
    
    // Criar novo cliente Supabase
    const config = ENVIRONMENTS[env];
    const newClient = createClient<Database>(config.url, config.anonKey);
    setSupabaseClient(newClient);
  };

  useEffect(() => {
    // Atualizar cliente quando ambiente mudar
    const config = ENVIRONMENTS[environment];
    const newClient = createClient<Database>(config.url, config.anonKey);
    setSupabaseClient(newClient);
  }, [environment]);

  const value = {
    environment,
    setEnvironment,
    supabaseClient,
    isTestMode: environment === 'test'
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};
