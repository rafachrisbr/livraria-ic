
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog';
import { CurrentDateTime } from '@/components/ui/CurrentDateTime';

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
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
              <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
              <p className="text-slate-600">Gestão da Livraria IC</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <CurrentDateTime />
            <span className="text-sm text-slate-600 hidden sm:inline">{user?.email}</span>
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
