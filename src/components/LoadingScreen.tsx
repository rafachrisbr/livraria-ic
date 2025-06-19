
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoadingScreen = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const navigate = useNavigate();

  const loadingMessages = [
    "Carregando dados do sistema...",
    "Preparando painel de controle...",
    "Verificando permissões...",
    "Sincronizando informações...",
    "Finalizando carregamento..."
  ];

  useEffect(() => {
    console.log('LoadingScreen mounted, starting loading process...');
    
    // Controlar progresso da barra com tempo mínimo garantido
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.5; // Mais lento para garantir tempo mínimo
      });
    }, 120); // Intervalo maior

    // Controlar mensagens rotativas
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 1200);

    // Tempo mínimo de 8 segundos para mostrar conclusão e redirecionar
    const redirectTimer = setTimeout(() => {
      console.log('Loading complete, showing completion message...');
      setShowComplete(true);
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        // Marcar que passou pela tela de welcome para não mostrar novamente
        sessionStorage.setItem('welcomeShown', 'true');
        navigate('/');
      }, 2000);
    }, 8000);

    return () => {
      console.log('LoadingScreen cleanup');
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

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
            {!showComplete ? (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-12 sm:h-16 w-12 sm:w-16 text-blue-500 animate-spin" />
                </div>
                
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Bem-vindo, {getUserName()}!
                  </h1>
                  <p className="text-sm text-gray-600 mb-6">
                    Gestão da Livraria IC - FSSPX
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Loading Message */}
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <span className="text-sm font-medium animate-pulse">
                    {loadingMessages[currentMessage]}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 sm:h-16 w-12 sm:w-16 text-green-500" />
                </div>
                
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                    Sistema Carregado!
                  </h1>
                  <p className="text-sm text-gray-600">
                    Redirecionando para o painel...
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Catholic decoration */}
        <div className="text-center">
          <p className="text-xs text-blue-600 opacity-60">
            Sub tuum praesidium confugimus
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
