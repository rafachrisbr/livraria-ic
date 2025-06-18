
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserManagementCard } from '@/components/super-admin/UserManagementCard';
import { SalesManagementCard } from '@/components/super-admin/SalesManagementCard';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

const SuperAdmin = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  // Verificar se é o Rafael
  const isRafael = user?.email === 'rafael.christiano@yahoo.com.br';

  if (!isRafael) {
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader 
          title="Super Admin" 
          subtitle="Configurações Avançadas" 
        />
        
        <main className="px-4 py-6 space-y-6">
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Shield className="h-6 w-6" />
                Painel Super Administrador
              </CardTitle>
              <CardDescription>
                Bem-vindo, Rafael! Você tem acesso total ao sistema.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-yellow-800">Atenção!</p>
                  <p className="text-sm text-yellow-700">
                    As operações nesta área são irreversíveis e afetam todo o sistema. 
                    Use com extrema cautela.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <UserManagementCard />
          <SalesManagementCard />

          <div className="flex justify-center pt-4">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Shield className="h-6 w-6" />
                Painel Super Administrador
              </CardTitle>
              <CardDescription>
                Bem-vindo, Rafael! Você tem acesso total às configurações do sistema.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-yellow-800">Atenção!</p>
                  <p className="text-sm text-yellow-700">
                    As operações nesta área são irreversíveis e afetam todo o sistema. 
                    Use com extrema cautela e sempre confirme suas ações.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <UserManagementCard />
            <SalesManagementCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;
