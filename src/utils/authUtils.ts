import { supabase } from '@/integrations/supabase/client';

export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const performCleanSignOut = async () => {
  try {
    // Clean up auth state
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log('Sign out warning:', err);
    }
    
    // Force page reload for a clean state
    window.location.href = '/';
  } catch (error) {
    console.error('Sign out error:', error);
    // Force reload even on error
    window.location.href = '/';
  }
};

// Adicionar função para limpar cache completo em produção
export const clearProductionCache = () => {
  try {
    // Limpar localStorage
    localStorage.clear();
    
    // Limpar sessionStorage
    sessionStorage.clear();
    
    // Limpar cache do service worker se existir
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
    
    console.log('Production cache cleared successfully');
  } catch (error) {
    console.error('Error clearing production cache:', error);
  }
};

// Função para preparar sistema para produção
export const prepareForProduction = () => {
  clearProductionCache();
  
  // Remover flags de desenvolvimento
  sessionStorage.removeItem('justLoggedIn');
  sessionStorage.removeItem('developmentMode');
  localStorage.removeItem('debug');
  
  console.log('System prepared for production');
};
