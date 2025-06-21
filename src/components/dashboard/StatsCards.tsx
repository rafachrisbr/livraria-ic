
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, AlertTriangle, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentSales: number;
  todayRevenue: number;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    recentSales: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Buscar produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Buscar promoções ativas
      const { data: promotions, error: promotionsError } = await supabase
        .from('promotions')
        .select(`
          *,
          product_promotions:product_promotions(product_id)
        `)
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());

      if (promotionsError) throw promotionsError;

      // Buscar vendas de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', today);

      if (salesError) throw salesError;

      // Calcular estatísticas
      const totalProducts = products?.length || 0;
      
      let totalValue = 0;
      let lowStockProducts = 0;
      let outOfStockProducts = 0;

      products?.forEach(product => {
        // Verificar se produto tem promoção ativa
        const promotion = promotions?.find(p => 
          p.product_promotions?.some((pp: any) => pp.product_id === product.id)
        );

        let effectivePrice = product.price;
        
        if (promotion) {
          if (promotion.discount_type === 'percentage') {
            effectivePrice = product.price * (1 - promotion.discount_value / 100);
          } else if (promotion.discount_type === 'fixed') {
            effectivePrice = Math.max(0, product.price - promotion.discount_value);
          }
        }

        totalValue += effectivePrice * product.stock_quantity;

        if (product.stock_quantity === 0) {
          outOfStockProducts++;
        } else if (product.stock_quantity <= product.minimum_stock) {
          lowStockProducts++;
        }
      });

      const recentSales = todaySales?.length || 0;
      const todayRevenue = todaySales?.reduce((sum, sale) => sum + sale.total_price, 0) || 0;

      setStats({
        totalProducts,
        totalValue,
        lowStockProducts,
        outOfStockProducts,
        recentSales,
        todayRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-white border-slate-200 shadow-sm animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">
            Produtos Cadastrados
          </CardTitle>
          <div className="p-2 bg-blue-200 rounded-lg">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{stats.totalProducts}</div>
          <p className="text-xs text-blue-600 mt-1">
            total no sistema
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">
            Valor Total em Estoque
          </CardTitle>
          <div className="p-2 bg-green-200 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">
            R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-green-600 mt-1">
            incluindo promoções
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">
            Estoque Baixo
          </CardTitle>
          <div className="p-2 bg-orange-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-900">{stats.lowStockProducts}</div>
          <p className="text-xs text-orange-600 mt-1">
            produtos em alerta
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700">
            Fora de Estoque
          </CardTitle>
          <div className="p-2 bg-red-200 rounded-lg">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-900">{stats.outOfStockProducts}</div>
          <p className="text-xs text-red-600 mt-1">
            produtos esgotados
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">
            Vendas Hoje
          </CardTitle>
          <div className="p-2 bg-purple-200 rounded-lg">
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">{stats.recentSales}</div>
          <p className="text-xs text-purple-600 mt-1">
            transações realizadas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-700">
            Receita Hoje
          </CardTitle>
          <div className="p-2 bg-teal-200 rounded-lg">
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-teal-900">
            R$ {stats.todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-teal-600 mt-1">
            faturamento do dia
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
