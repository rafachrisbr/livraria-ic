
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddSaleDialog } from '@/components/sales/AddSaleDialog';
import { SalesList } from '@/components/sales/SalesList';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useMobile } from '@/hooks/useMobile';

const Sales = () => {
  const { user, signOut } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isMobile } = useMobile();

  const handleLogout = async () => {
    await signOut();
  };

  const handleSaleAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader 
          title="Vendas" 
          subtitle="Registrar vendas"
          showBackButton
        />

        <main className="px-4 py-6">
          <div className="mb-6">
            <AddSaleDialog onSaleAdded={handleSaleAdded} />
          </div>

          <SalesList refreshTrigger={refreshTrigger} />
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
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Registrar Vendas</h1>
                <p className="text-gray-600">Livraria Imaculada Conceição</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <AddSaleDialog onSaleAdded={handleSaleAdded} />
        </div>

        <SalesList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};

export default Sales;
