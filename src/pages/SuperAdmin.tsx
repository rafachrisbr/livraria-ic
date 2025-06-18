
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { SuperAdminErrorBoundary } from '@/components/super-admin/SuperAdminErrorBoundary';
import { SuperAdminContent } from '@/components/super-admin/SuperAdminContent';

const SuperAdmin = () => {
  const { user, signOut } = useAuth();

  // Hook personalizado para detectar mobile sem dependência externa
  const isMobile = window.innerWidth < 768;

  console.log('SuperAdmin page loaded, user:', user?.email);

  // Verificar se é o Rafael
  const isRafael = user?.email === 'rafael.christiano@yahoo.com.br';

  if (!isRafael) {
    console.log('Access denied - not Rafael');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Acesso Restrito
            </CardTitle>
            <CardDescription className="text-center">
              Esta área é exclusiva para o super administrador do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <Button onClick={signOut} variant="outline" className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Access granted - Rafael authenticated');

  return (
    <SuperAdminErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        {isMobile ? (
          <>
            <MobileHeader 
              title="Super Admin" 
              subtitle="Configurações Avançadas" 
            />
            <SuperAdminContent isMobile={true} />
          </>
        ) : (
          <>
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
                      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                        Super Admin
                      </h1>
                      <p className="text-gray-600">Configurações Avançadas do Sistema</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 bg-purple-100 px-3 py-1 rounded-full">
                      {user?.email}
                    </span>
                    <Link to="/">
                      <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </header>
            <SuperAdminContent isMobile={false} />
          </>
        )}
      </div>
    </SuperAdminErrorBoundary>
  );
};

export default SuperAdmin;
