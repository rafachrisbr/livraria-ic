import React, { useEffect, useState } from 'react';
import { CheckCircle, Database, Shield, Layers3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  description: string;
}

const LoadingScreen = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const navigate = useNavigate();

  const loadingSteps: LoadingStep[] = [
    {
      id: 'connection',
      label: 'Conectando ao servidor...',
      icon: Database,
      duration: 1500,
      description: 'Estabelecendo conexão segura'
    },
    {
      id: 'authentication',
      label: 'Verificando credenciais...',
      icon: Shield,
      duration: 2000,
      description: 'Validando permissões de acesso'
    },
    {
      id: 'data',
      label: 'Carregando dados do sistema...',
      icon: Layers3,
      duration: 2500,
      description: 'Sincronizando informações da livraria'
    },
    {
      id: 'interface',
      label: 'Preparando interface...',
      icon: Layers3,
      duration: 1500,
      description: 'Configurando painel administrativo'
    }
  ];

  // Gerar partículas de fundo
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // Simular carregamento dinâmico
  useEffect(() => {
    console.log('LoadingScreen mounted, starting dynamic loading process...');
    
    let currentProgress = 0;

    const executeStep = async (stepIndex: number) => {
      if (stepIndex >= loadingSteps.length) {
        setShowComplete(true);
        setTimeout(() => {
          console.log('Loading complete, redirecting to dashboard...');
          navigate('/', { replace: true });
        }, 2000);
        return;
      }

      const step = loadingSteps[stepIndex];
      setCurrentStep(stepIndex);

      // Simular carregamento da etapa atual
      const stepProgress = 100 / loadingSteps.length;
      const startProgress = currentProgress;
      const endProgress = startProgress + stepProgress;

      // Animar progresso durante a etapa
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (stepProgress / (step.duration / 50));
          if (newProgress >= endProgress) {
            clearInterval(progressInterval);
            return endProgress;
          }
          return newProgress;
        });
      }, 50);

      // Aguardar duração da etapa
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      currentProgress = endProgress;
      
      // Próxima etapa
      setTimeout(() => executeStep(stepIndex + 1), 300);
    };

    executeStep(0);

    return () => {
      console.log('LoadingScreen cleanup');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 flex items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Partículas animadas de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-200 rounded-full opacity-60"
            initial={{ x: `${particle.x}vw`, y: `${particle.y}vh`, scale: 0 }}
            animate={{ 
              y: [`${particle.y}vh`, `${particle.y - 20}vh`, `${particle.y}vh`],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Background image com overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent z-10" />
        <img 
          src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
          alt="Imaculada Conceição"
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      <div className="w-full max-w-md space-y-6 relative z-20">
        {/* FSSPX Logo com animação */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img 
            src="https://cadastro.fsspx.com.br/wp-content/uploads/2023/04/fsspx-logo-novo-png-large-3.png" 
            alt="FSSPX Logo"
            className="mx-auto h-14 sm:h-18 w-auto object-contain mb-4"
            onError={(e) => {
              e.currentTarget.src = "https://static.wixstatic.com/media/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png/v1/fill/w_184,h_184,al_c,usm_0.66_1.00_0.01/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png";
            }}
          />
        </motion.div>

        <motion.div 
          className="text-center space-y-6 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl rounded-xl p-8 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {/* Background decoration animada */}
          <motion.div 
            className="absolute top-0 right-0 opacity-8"
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
              alt="Imaculada Conceição"
              className="h-32 w-auto object-contain"
            />
          </motion.div>
          
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {!showComplete ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Ícone animado da etapa atual */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      className="relative"
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        {loadingSteps[currentStep] && React.createElement(loadingSteps[currentStep].icon, {
                          className: "h-8 w-8 text-white"
                        })}
                      </div>
                      
                      {/* Anel externo animado */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-300"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                  </div>
                  
                  <div>
                    <motion.h1 
                      className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"
                      key={`title-${currentStep}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      Bem-vindo, {getUserName()}!
                    </motion.h1>
                    <p className="text-sm text-gray-600 mb-6">
                      Gestão da Livraria IC - FSSPX
                    </p>
                  </div>

                  {/* Barra de progresso aprimorada */}
                  <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 mb-6 shadow-inner">
                    <motion.div 
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 shadow-sm relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                  </div>

                  {/* Indicador de progresso numérico */}
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-blue-600">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  {/* Mensagem da etapa atual */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`step-${currentStep}`}
                      className="flex flex-col items-center space-y-2 text-blue-600"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-sm font-medium animate-pulse">
                        {loadingSteps[currentStep]?.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {loadingSteps[currentStep]?.description}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Indicadores de etapas */}
                  <div className="flex justify-center space-x-2 mt-6">
                    {loadingSteps.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        animate={{ 
                          scale: index === currentStep ? [1, 1.3, 1] : 1 
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: index === currentStep ? Infinity : 0 
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                    >
                      <CheckCircle className="h-16 w-16 text-emerald-500" />
                    </motion.div>
                  </div>
                  
                  <div>
                    <motion.h1 
                      className="text-xl sm:text-2xl font-bold text-emerald-600 mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Sistema Carregado!
                    </motion.h1>
                    <motion.p 
                      className="text-sm text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Redirecionando para o painel...
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Catholic decoration */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-xs text-blue-600 opacity-70">
            Sub tuum praesidium confugimus
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
