
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  isTransitioning: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

// Configurações dos ambientes
const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
  production: {
    url: "https://qrelbbzrktjadfkrimzw.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZWxiYnpya3RqYWRma3JpbXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDcxNzQsImV4cCI6MjA2NTUyMzE3NH0.gVISB0NGBRPDR4_U_zQoE5N5wllA3cmkROpbpsJ2Wo0"
  },
  test: {
    url: "https://llxkpxifcaykjmdxymrk.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGtweGlmY2F5a2ptZHh5bXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODYwMTgsImV4cCI6MjA2NTY2MjAxOH0.NuhBjxHiw_9SNlKwSw-ddqxhqissq-t4oqUDgl5xe3o"
  }
};

const createSupabaseClient = (config: EnvironmentConfig) => {
  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [environment, setEnvironmentState] = useState<Environment>(() => {
    const saved = localStorage.getItem('environment');
    return (saved as Environment) || 'production';
  });

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database>>(() => {
    const config = ENVIRONMENTS[environment];
    return createSupabaseClient(config);
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  const setEnvironment = useCallback(async (env: Environment) => {
    if (env === environment) return;
    
    setIsTransitioning(true);
    console.log(`Iniciando mudança para ambiente: ${env}`);
    
    try {
      // Salvar ambiente no localStorage
      localStorage.setItem('environment', env);
      
      // Criar novo cliente Supabase
      const config = ENVIRONMENTS[env];
      const newClient = createSupabaseClient(config);

      // Atualizar estado
      setEnvironmentState(env);
      setSupabaseClient(newClient);
      
      console.log(`Cliente Supabase atualizado para ${env}: ${config.url}`);
      
      // Pequena pausa para garantir que a mudança foi processada
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Erro ao trocar ambiente:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [environment]);

  // Sinalizar para o AuthProvider quando o ambiente mudar
  useEffect(() => {
    // Disparar evento customizado para notificar mudança de ambiente
    window.dispatchEvent(new CustomEvent('environmentChanged', { 
      detail: { environment, supabaseClient } 
    }));
  }, [environment, supabaseClient]);

  const value = {
    environment,
    setEnvironment,
    supabaseClient,
    isTestMode: environment === 'test',
    isTransitioning
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
