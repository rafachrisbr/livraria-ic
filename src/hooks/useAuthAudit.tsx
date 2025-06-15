
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthAudit = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          const getUserIP = async () => {
            try {
              const response = await fetch('https://api.ipify.org?format=json');
              const data = await response.json();
              return data.ip;
            } catch {
              return null;
            }
          };

          const userAgent = navigator.userAgent;
          const ipAddress = await getUserIP();

          if (event === 'SIGNED_IN' && session?.user) {
            await supabase.rpc('log_auth_event', {
              p_event_type: 'LOGIN',
              p_details: {
                email: session.user.email,
                login_method: 'email',
                success: true
              },
              p_ip_address: ipAddress,
              p_user_agent: userAgent
            });
          } else if (event === 'SIGNED_OUT') {
            await supabase.rpc('log_auth_event', {
              p_event_type: 'LOGOUT',
              p_details: {
                success: true
              },
              p_ip_address: ipAddress,
              p_user_agent: userAgent
            });
          } else if (event === 'PASSWORD_RECOVERY') {
            await supabase.rpc('log_auth_event', {
              p_event_type: 'PASSWORD_RECOVERY',
              p_details: {
                email: session?.user?.email,
                success: true
              },
              p_ip_address: ipAddress,
              p_user_agent: userAgent
            });
          }
        } catch (error) {
          console.error('Error logging auth event:', error);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
};
