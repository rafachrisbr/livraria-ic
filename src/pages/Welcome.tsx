
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useEnvironment } from '@/contexts/EnvironmentContext';

const Welcome = () => {
  const { user } = useAuth();
  const { environment, isTestMode } = useEnvironment();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md space-y-6">
        {/* FSSPX Logo */}
        <div className="text-center">
          <img 
            src="/lovable-uploads/018fdea3-20af-48a3-a8a4-6b13b4c8c6f7.png" 
            alt="Fraternidade Sacerdotal São Pio X"
            className="mx-auto h-12 sm:h-16 w-auto object-contain mb-4"
          />
        </div>

        <Card className="text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 opacity-5">
            <img 
              src="/lovable-uploads/6b0b2f9b-b8cf-4b64-8bf8-cb6b0b71c55b.png" 
              alt="Imaculada Conceição"
              className="h-32 w-auto object-contain"
            />
          </div>
          
          <CardHeader className="relative z-10">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 sm:h-16 w-12 sm:w-16 text-green-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-green-600">
              Login Realizado com Sucesso!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 relative z-10">
            <div>
              <p className="text-lg font-medium text-gray-800">
                Bem-vindo, {getUserName()}!
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Você foi autenticado com sucesso no sistema da Gestão da Livraria IC.
              </p>
            </div>

            {isTestMode && (
              <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  🧪 Modo de Teste Ativo
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Você está conectado ao ambiente de teste
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  Redirecionando para o painel em {countdown}s...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catholic decoration for mobile */}
        <div className="text-center sm:hidden">
          <p className="text-xs text-blue-600 opacity-60">
            Sub tuum praesidium confugimus
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
