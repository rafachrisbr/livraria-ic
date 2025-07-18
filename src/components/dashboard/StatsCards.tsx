
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, AlertTriangle, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  totalValueWithDiscount: number;
  totalDiscount: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  todaySales: number;
  todayRevenue: number;
  todayProductsSold: number;
  todayUniqueProducts: number;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    totalValueWithDiscount: 0,
    totalDiscount: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    todaySales: 0,
    todayRevenue: 0,
    todayProductsSold: 0,
    todayUniqueProducts: 0,
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

      // Buscar promoções ativas com produtos associados
      const now = new Date().toISOString();
      const { data: promotions, error: promotionsError } = await supabase
        .from('promotions')
        .select(`
          *,
          product_promotions!inner(product_id)
        `)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (promotionsError) throw promotionsError;

      // Buscar vendas de hoje APENAS
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', today)
        .lt('sale_date', `${today}T23:59:59.999Z`);

      if (salesError) throw salesError;

      // Calcular estatísticas
      const totalProducts = products?.length || 0;
      
      let totalValue = 0;
      let totalValueWithDiscount = 0;
      let lowStockProducts = 0;
      let outOfStockProducts = 0;

      // Criar mapa de promoções por produto para facilitar busca
      const promotionsByProduct = new Map();
      promotions?.forEach(promotion => {
        promotion.product_promotions?.forEach((pp: any) => {
          if (!promotionsByProduct.has(pp.product_id)) {
            promotionsByProduct.set(pp.product_id, []);
          }
          promotionsByProduct.get(pp.product_id).push(promotion);
        });
      });

      products?.forEach(product => {
        const originalValue = product.price * product.stock_quantity;
        totalValue += originalValue;

        // Verificar se produto tem promoção ativa
        const productPromotions = promotionsByProduct.get(product.id) || [];
        
        let bestPrice = product.price;
        
        // Encontrar o melhor preço (menor) entre todas as promoções ativas
        productPromotions.forEach((promotion: any) => {
          let discountedPrice = product.price;
          
          if (promotion.discount_type === 'percentage') {
            discountedPrice = product.price * (1 - promotion.discount_value / 100);
          } else if (promotion.discount_type === 'fixed_amount') {
            discountedPrice = Math.max(0, product.price - promotion.discount_value);
          }
          
          if (discountedPrice < bestPrice) {
            bestPrice = discountedPrice;
          }
        });

        totalValueWithDiscount += bestPrice * product.stock_quantity;

        if (product.stock_quantity === 0) {
          outOfStockProducts++;
        } else if (product.stock_quantity <= product.minimum_stock) {
          lowStockProducts++;
        }
      });

      const totalDiscount = totalValue - totalValueWithDiscount;
      
      // Estatísticas do dia atual
      const todaySalesCount = todaySales?.length || 0;
      const todayRevenue = todaySales?.reduce((sum, sale) => sum + sale.total_price, 0) || 0;
      const todayProductsSold = todaySales?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;
      const todayUniqueProducts = new Set(todaySales?.map(sale => sale.product_id)).size;

      setStats({
        totalProducts,
        totalValue,
        totalValueWithDiscount,
        totalDiscount,
        lowStockProducts,
        outOfStockProducts,
        todaySales: todaySalesCount,
        todayRevenue,
        todayProductsSold,
        todayUniqueProducts,
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
          <Card key={i} className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-20"></div>
              </div>
              <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-24"></div>
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
          {stats.totalDiscount > 0 ? (
            <div>
              <div className="text-lg font-bold text-gray-500 line-through">
                R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-2xl font-bold text-green-900">
                R$ {stats.totalValueWithDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-600 mt-1">
                desconto de R$ {stats.totalDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-bold text-green-900">
                R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-600 mt-1">
                valor sem promoções
              </p>
            </div>
          )}
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
          <div className="text-3xl font-bold text-purple-900">{stats.todaySales}</div>
          <p className="text-xs text-purple-600 mt-1">
            {stats.todayProductsSold} produtos vendidos
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
            {stats.todayUniqueProducts} produtos diferentes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
