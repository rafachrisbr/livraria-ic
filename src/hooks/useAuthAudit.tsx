
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAuthAudit = () => {
  const { user } = useAuth();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (!user || hasLoggedRef.current) return;

    const logAuthEvent = async () => {
      try {
        hasLoggedRef.current = true;
        
        let ipAddress = 'unknown';
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        } catch (ipError) {
          console.warn('Could not get IP address:', ipError);
        }

        await supabase.from('audit_logs').insert({
          action_type: 'SIGN_IN',
          table_name: 'auth',
          details: { email: user.email },
          user_id: user.id,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
        });
        
        console.log('Auth audit logged successfully');
      } catch (error) {
        console.error('Error logging auth event:', error);
      }
    };

    logAuthEvent();

    // Cleanup on unmount or user change
    return () => {
      if (!user) {
        hasLoggedRef.current = false;
      }
    };
  }, [user?.id]);
};
