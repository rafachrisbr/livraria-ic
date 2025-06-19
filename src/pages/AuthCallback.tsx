
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        
        // Processar o callback de autenticação
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, marking as just logged in and redirecting to welcome...');
          // Marcar que o usuário acabou de confirmar email/fazer login
          sessionStorage.setItem('justLoggedIn', 'true');
          // Aguardar um pouco para garantir que o estado seja atualizado
          setTimeout(() => {
            navigate('/welcome');
          }, 1000);
        } else {
          console.log('No session found, redirecting to login...');
          navigate('/');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-blue-600">Processando Confirmação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Confirmando sua conta...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
