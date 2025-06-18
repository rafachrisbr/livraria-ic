
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Login Realizado com Sucesso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg font-medium text-gray-800">
              Bem-vindo, {getUserName()}!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Você foi autenticado com sucesso no sistema da Livraria Imaculada Conceição.
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
    </div>
  );
};

export default Welcome;
