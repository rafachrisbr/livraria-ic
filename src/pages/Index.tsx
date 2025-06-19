
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Login from './Login';
import Dashboard from './Dashboard';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index component - User:', user?.email || 'undefined', 'Admin:', isAdmin, 'Loading:', loading);
    
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

  // Se ainda está carregando a autenticação inicial, mostrar um loading mínimo
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se usuário está logado e é admin (e NÃO acabou de fazer login), mostrar dashboard
  if (user && isAdmin) {
    console.log('Showing dashboard for existing admin user');
    return <Dashboard />;
  }

  // Se usuário está logado mas não é admin, fazer logout silencioso
  if (user && !isAdmin) {
    console.log('User is not admin, performing silent logout...');
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Caso contrário, mostrar tela de login
  console.log('Showing login page');
  return <Login />;
};

export default Index;
