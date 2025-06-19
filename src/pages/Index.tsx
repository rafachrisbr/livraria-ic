
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Login from './Login';
import Dashboard from './Dashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading, isAdmin } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    console.log('Index component - User:', user?.email || 'undefined', 'Admin:', isAdmin, 'Loading:', loading);
    
    // Verificar se o usuário já passou pela tela de welcome nesta sessão
    const sessionWelcomeShown = sessionStorage.getItem('welcomeShown');
    if (sessionWelcomeShown === 'true') {
      setHasShownWelcome(true);
    }
    
    // Timeout de segurança para mostrar conteúdo mesmo se loading não resolver
    const timeout = setTimeout(() => {
      console.log('Safety timeout - showing content');
      setShowContent(true);
    }, 5000);

    if (!loading) {
      setShowContent(true);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [user, isAdmin, loading]);

  // Show loading while auth is initializing
  if (loading && !showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and is an admin, show dashboard
  if (user && isAdmin) {
    console.log('Showing dashboard for admin user, welcomeShown:', hasShownWelcome);
    // Se já passou pela tela de welcome nesta sessão, vai direto pro dashboard
    // Se não passou, será redirecionado pelo Login.tsx para /welcome
    return <Dashboard />;
  }

  // Otherwise show login (handles both non-logged users and non-admin users)
  console.log('Showing login page');
  return <Login />;
};

export default Index;
