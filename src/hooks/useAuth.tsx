
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabase } from '@/hooks/useSupabase';
import { cleanupAuthState } from '@/utils/authUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      
      const { data: adminData, error } = await supabase
        .from('administrators')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        const adminStatus = !!adminData;
        console.log('Admin status:', adminStatus);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Timeout de segurança para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Safety timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 8000); // 8 segundos

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }

        if (mounted) {
          console.log('Initial session:', initialSession?.user?.email || 'No session');
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            // Aguardar um pouco antes de verificar admin para evitar problemas
            setTimeout(() => {
              if (mounted) {
                checkAdminStatus(initialSession.user.id);
              }
            }, 500);
          } else {
            setIsAdmin(false);
          }
          
          // Dar um tempo mínimo para loading
          setTimeout(() => {
            if (mounted) {
              setLoading(false);
              clearTimeout(safetyTimeout);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Aguardar um pouco antes de verificar admin
          setTimeout(() => {
            if (mounted) {
              checkAdminStatus(session.user.id);
            }
          }, 500);
        } else {
          setIsAdmin(false);
        }
        
        // Dar um tempo mínimo para loading
        setTimeout(() => {
          if (mounted) {
            setLoading(false);
            clearTimeout(safetyTimeout);
          }
        }, 1000);
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting sign in for:', email);
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      console.log('Attempting sign up for:', email);
      
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`,
          data: {
            name: name || '',
            email: email
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        setLoading(false);
        return { error };
      }
      
      console.log('Sign up successful for:', data.user?.email);
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      cleanupAuthState();
      
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
      
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Sign out error:', error);
      setLoading(false);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
