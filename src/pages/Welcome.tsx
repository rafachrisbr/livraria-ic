
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Heart } from 'lucide-react';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Administrador';
  };

  useEffect(() => {
    console.log('Welcome page mounted, starting 3 second timer...');
    
    const timer = setTimeout(() => {
      console.log('Welcome timer complete, redirecting to loading...');
      navigate('/loading');
    }, 3000);

    return () => {
      console.log('Welcome page cleanup');
      clearTimeout(timer);
    };
  }, [navigate]);

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

        <div className="text-center space-y-6 bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl rounded-lg p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 opacity-10">
            <img 
              src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
              alt="Imaculada Conceição"
              className="h-32 w-auto object-contain"
            />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="absolute -top-1 -right-1">
                  <Heart className="h-6 w-6 text-red-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                Login Realizado com Sucesso!
              </h1>
              <p className="text-gray-600 mb-4">
                Bem-vindo, {getUserName()}
              </p>
              <p className="text-sm text-gray-500">
                Preparando o sistema da Livraria Imaculada Conceição...
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Sistema autenticado</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-sm">Carregando painel administrativo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Catholic decoration */}
        <div className="text-center">
          <p className="text-xs text-blue-600 opacity-60">
            Imaculada Conceição, rogai por nós
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
