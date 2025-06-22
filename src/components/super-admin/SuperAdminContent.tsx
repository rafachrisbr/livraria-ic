
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserManagementCard } from './UserManagementCard';
import { SalesManagementCard } from './SalesManagementCard';
import { ProductManagementCard } from './ProductManagementCard';
import { CategoryManagementCard } from './CategoryManagementCard';
import { AuditLogManagementCard } from './AuditLogManagementCard';

interface SuperAdminContentProps {
  isMobile: boolean;
}

export const SuperAdminContent = ({ isMobile }: SuperAdminContentProps) => {
  const { user } = useAuth();

  const commonContent = (
    <>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserManagementCard />
        <SalesManagementCard />
        <ProductManagementCard />
        <CategoryManagementCard />
        <AuditLogManagementCard />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <main className="px-4 py-6 space-y-6">
        {commonContent}
        
        <div className="flex justify-center pt-4">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
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
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <UserManagementCard />
          <SalesManagementCard />
          <ProductManagementCard />
          <CategoryManagementCard />
          <AuditLogManagementCard />
        </div>
      </div>
    </main>
  );
};
