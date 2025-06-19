import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Login from './Login';
import Dashboard from './Dashboard';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading, isAdmin } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index component - User:', user?.email || 'undefined', 'Admin:', isAdmin, 'Loading:', loading);
    
    // Timeout de segurança reduzido para 2 segundos
    const timeout = setTimeout(() => {
      console.log('Safety timeout - showing content');
      setShowContent(true);
    }, 2000);

    if (!loading) {
      setShowContent(true);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [user, isAdmin, loading]);

  useEffect(() => {
    // Verificar se o usuário acabou de fazer login
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    
    if (user && isAdmin && !loading && justLoggedIn) {
      console.log('User just logged in, redirecting to welcome flow...');
      // Limpar a flag para não interferir em futuros carregamentos
      sessionStorage.removeItem('justLoggedIn');
      navigate('/welcome');
      return;
    }
  }, [user, isAdmin, loading, navigate]);

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

  // If user is logged in and is an admin (and didn't just log in), show dashboard
  if (user && isAdmin) {
    console.log('Showing dashboard for existing admin user');
    return <Dashboard />;
  }

  // If user is logged in but not admin, silently redirect to logout
  if (user && !isAdmin && !loading) {
    console.log('User is not admin, performing silent logout...');
    // Fazer logout silencioso
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Otherwise show login
  console.log('Showing login page');
  return <Login />;
};

export default Index;
