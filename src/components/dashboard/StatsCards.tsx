
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, BarChart3, Users, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductStats {
  totalProducts: number;
  lowStockProducts: number;
  totalStockValue: number;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalStockValue: 0,
  });

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('price, stock_quantity, minimum_stock');

      if (error) {
        console.error('Error fetching product stats:', error);
        return;
      }

      if (products) {
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => p.stock_quantity <= p.minimum_stock).length;
        const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);

        setStats({
          totalProducts,
          lowStockProducts,
          totalStockValue,
        });
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">
            Produtos Cadastrados
          </CardTitle>
          <div className="p-2 bg-blue-200 rounded-lg">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{stats.totalProducts}</div>
          <p className="text-xs text-blue-600 flex items-center mt-1">
            <Package className="h-3 w-3 mr-1" />
            {stats.totalProducts === 0 ? 'Nenhum produto cadastrado' : 'Produtos no sistema'}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">
            Vendas Hoje
          </CardTitle>
          <div className="p-2 bg-green-200 rounded-lg">
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">0</div>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <DollarSign className="h-3 w-3 mr-1" />
            Nenhuma venda hoje
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">
            Valor do Estoque
          </CardTitle>
          <div className="p-2 bg-purple-200 rounded-lg">
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            R$ {stats.totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-purple-600 flex items-center mt-1">
            <TrendingDown className="h-3 w-3 mr-1" />
            Valor total em estoque
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">
            Estoque Baixo
          </CardTitle>
          <div className="p-2 bg-orange-200 rounded-lg">
            <Package className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{stats.lowStockProducts}</div>
          <p className="text-xs text-orange-600 flex items-center mt-1">
            <Package className="h-3 w-3 mr-1" />
            {stats.lowStockProducts === 0 ? 'Estoque normal' : 'Produtos requerem atenção'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
