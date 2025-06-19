
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

const Welcome = () => {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirecionar para a tela de loading em vez do dashboard diretamente
          window.location.href = '/loading';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <img 
          src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
          alt="Imaculada Conceição"
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* FSSPX Logo */}
        <div className="text-center">
          <img 
            src="https://cadastro.fsspx.com.br/wp-content/uploads/2023/04/fsspx-logo-novo-png-large-3.png" 
            alt="FSSPX Logo"
            className="mx-auto h-12 sm:h-16 w-auto object-contain mb-4"
            onError={(e) => {
              e.currentTarget.src = "https://static.wixstatic.com/media/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png/v1/fill/w_184,h_184,al_c,usm_0.66_1.00_0.01/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png";
            }}
          />
        </div>

        <Card className="text-center relative overflow-hidden bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 opacity-10">
            <img 
              src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
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

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  Preparando sistema em {countdown}s...
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
