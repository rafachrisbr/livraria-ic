
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ActionCards } from '@/components/dashboard/ActionCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ProductsList } from '@/components/dashboard/ProductsList';
import { PromotionsList } from '@/components/dashboard/PromotionsList';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
            <CardDescription className="text-center">
              Você não tem permissões de administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} className="w-full">
              Voltar ao Login
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
          title="Painel" 
          subtitle="Gestão da Livraria IC" 
        />
        
        <main className="px-4 py-6 space-y-6 relative">
          {/* Imagem de fundo móvel - Imaculada Conceição */}
          <div className="fixed top-20 right-4 opacity-5 pointer-events-none z-0">
            <img 
              src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
              alt="Imaculada Conceição"
              className="h-32 w-auto object-contain"
            />
          </div>
          
          <div className="relative z-10">
            <WelcomeSection />
            <StatsCards />
            <ActionCards />
            <div className="space-y-6">
              <ProductsList />
              <PromotionsList />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Imagem de fundo desktop - Imaculada Conceição */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0">
          <img 
            src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
            alt="Imaculada Conceição"
            className="h-96 w-auto object-contain"
          />
        </div>
        
        <div className="relative z-10">
          <WelcomeSection />
          <StatsCards />
          <ActionCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <ProductsList />
            <PromotionsList />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-10">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
