
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
              src="https://cadastro.fsspx.com.br/wp-content/uploads/2023/04/fsspx-logo-novo-png-large-3.png" 
              alt="FSSPX Logo"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = "https://static.wixstatic.com/media/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png/v1/fill/w_184,h_184,al_c,usm_0.66_1.00_0.01/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png";
              }}
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
              
              {/* Imagem decorativa da Imaculada Conceição - visível apenas em desktop */}
              <div className="hidden lg:block absolute top-4 right-4 opacity-10 pointer-events-none">
                <img 
                  src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
                  alt="Imaculada Conceição"
                  className="h-16 w-auto object-contain"
                />
              </div>
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
