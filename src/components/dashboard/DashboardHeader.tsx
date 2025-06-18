
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog';
import { EnvironmentToggle } from '@/components/environment/EnvironmentToggle';
import { useEnvironment } from '@/contexts/EnvironmentContext';

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const { isTestMode } = useEnvironment();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className={`shadow-sm border-b border-slate-200 ${isTestMode ? 'bg-orange-50' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/018fdea3-20af-48a3-a8a4-6b13b4c8c6f7.png" 
              alt="FSSPX Logo"
              className="h-8 w-auto object-contain"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
                {isTestMode && (
                  <span className="px-2 py-1 text-xs font-semibold bg-orange-200 text-orange-800 rounded-full">
                    AMBIENTE DE TESTE
                  </span>
                )}
              </div>
              <p className="text-gray-600">Gestão da Livraria IC</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <EnvironmentToggle />
            <span className="text-sm text-gray-600 hidden sm:inline">{user?.email}</span>
            <ChangePasswordDialog />
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
