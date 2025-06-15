
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAuthAudit = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const logAuthEvent = async (action: string) => {
      try {
        // Get IP address
        let ipAddress = 'unknown';
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        } catch (ipError) {
          console.warn('Could not get IP address:', ipError);
        }

        await supabase.from('audit_logs').insert({
          action_type: action,
          table_name: 'auth',
          details: { email: user.email },
          user_id: user.id,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error('Error logging auth event:', error);
      }
    };

    // Log sign in event only once
    logAuthEvent('SIGN_IN');
  }, [user?.id]); // Only depend on user ID to avoid multiple calls
};
