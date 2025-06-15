
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Login from './Login';
import Dashboard from './Dashboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading, isAdmin } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    console.log('Index component - User:', user?.email || 'undefined', 'Admin:', isAdmin, 'Loading:', loading);
    
    // Only show content after loading is complete
    if (!loading) {
      setShowContent(true);
    }
  }, [user, isAdmin, loading]);

  if (loading || !showContent) {
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
    console.log('Showing dashboard for admin user');
    return <Dashboard />;
  }

  // If user is logged in but not admin, show access denied in login page
  if (user && !isAdmin) {
    console.log('User logged in but not admin, showing login with message');
  }

  // Otherwise show login
  console.log('Showing login page');
  return <Login />;
};

export default Index;
