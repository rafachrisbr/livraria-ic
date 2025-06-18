
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, BarChart3, DollarSign, TrendingDown, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  totalProducts: number;
  lowStockProducts: number;
  totalStockValue: number;
  totalStockValueWithPromotions: number;
  totalPromotionSavings: number;
  todaySales: number;
  todayRevenue: number;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalStockValue: 0,
    totalStockValueWithPromotions: 0,
    totalPromotionSavings: 0,
    todaySales: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
    
    // Configurar escuta em tempo real para produtos, vendas e promoções
    const productsChannel = supabase
      .channel('stats-products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => fetchStats()
      )
      .subscribe();

    const salesChannel = supabase
      .channel('stats-sales-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' }, 
        () => fetchStats()
      )
      .subscribe();

    const promotionsChannel = supabase
      .channel('stats-promotions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' }, 
        () => fetchStats()
      )
      .subscribe();

    return () => {
      productsChannel.unsubscribe();
      salesChannel.unsubscribe();
      promotionsChannel.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Buscar dados dos produtos com promoções ativas
      const { data: products } = await supabase
        .from('products')
        .select(`
          price, 
          stock_quantity, 
          minimum_stock,
          product_promotions!inner(
            promotion:promotions!inner(
              discount_type,
              discount_value,
              is_active,
              start_date,
              end_date
            )
          )
        `);

      // Buscar produtos sem promoção
      const { data: productsWithoutPromotion } = await supabase
        .from('products')
        .select('price, stock_quantity, minimum_stock')
        .not('id', 'in', 
          supabase
            .from('product_promotions')
            .select('product_id')
        );

      // Buscar vendas de hoje
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: todaySales } = await supabase
        .from('sales')
        .select('total_price')
        .gte('sale_date', today)
        .lt('sale_date', tomorrow);

      let totalProducts = 0;
      let lowStockProducts = 0;
      let totalStockValue = 0;
      let totalStockValueWithPromotions = 0;
      let totalPromotionSavings = 0;

      // Processar produtos com promoção
      if (products) {
        products.forEach(product => {
          totalProducts++;
          if (product.stock_quantity <= product.minimum_stock) {
            lowStockProducts++;
          }

          const originalValue = product.price * product.stock_quantity;
          totalStockValue += originalValue;

          // Calcular valor com promoção ativa
          const promotion = product.product_promotions[0]?.promotion;
          if (promotion && promotion.is_active) {
            const currentDate = new Date();
            const startDate = new Date(promotion.start_date);
            const endDate = new Date(promotion.end_date);
            
            if (currentDate >= startDate && currentDate <= endDate) {
              let discountedPrice = product.price;
              
              if (promotion.discount_type === 'percentage') {
                discountedPrice = product.price * (1 - promotion.discount_value / 100);
              } else if (promotion.discount_type === 'fixed_amount') {
                discountedPrice = Math.max(0, product.price - promotion.discount_value);
              }
              
              const promotionalValue = discountedPrice * product.stock_quantity;
              totalStockValueWithPromotions += promotionalValue;
              totalPromotionSavings += (originalValue - promotionalValue);
            } else {
              totalStockValueWithPromotions += originalValue;
            }
          } else {
            totalStockValueWithPromotions += originalValue;
          }
        });
      }

      // Processar produtos sem promoção
      if (productsWithoutPromotion) {
        productsWithoutPromotion.forEach(product => {
          totalProducts++;
          if (product.stock_quantity <= product.minimum_stock) {
            lowStockProducts++;
          }

          const value = product.price * product.stock_quantity;
          totalStockValue += value;
          totalStockValueWithPromotions += value;
        });
      }

      const todaySalesCount = todaySales?.length || 0;
      const todayRevenueValue = todaySales?.reduce((sum, s) => sum + s.total_price, 0) || 0;

      setStats({
        totalProducts,
        lowStockProducts,
        totalStockValue,
        totalStockValueWithPromotions,
        totalPromotionSavings,
        todaySales: todaySalesCount,
        todayRevenue: todayRevenueValue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Em caso de erro, buscar dados básicos sem promoções
      const { data: allProducts } = await supabase
        .from('products')
        .select('price, stock_quantity, minimum_stock');

      if (allProducts) {
        const totalProducts = allProducts.length;
        const lowStockProducts = allProducts.filter(p => p.stock_quantity <= p.minimum_stock).length;
        const totalStockValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);

        const todaySalesCount = todaySales?.length || 0;
        const todayRevenueValue = todaySales?.reduce((sum, s) => sum + s.total_price, 0) || 0;

        setStats({
          totalProducts,
          lowStockProducts,
          totalStockValue,
          totalStockValueWithPromotions: totalStockValue,
          totalPromotionSavings: 0,
          todaySales: todaySalesCount,
          todayRevenue: todayRevenueValue,
        });
      }
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
          <div className="text-2xl font-bold text-green-900">{stats.todaySales}</div>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <DollarSign className="h-3 w-3 mr-1" />
            R$ {stats.todayRevenue.toFixed(2)} em vendas
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
          <div className="space-y-1">
            {stats.totalPromotionSavings > 0 && (
              <div className="text-sm text-gray-500 line-through">
                R$ {stats.totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
            <div className="text-2xl font-bold text-purple-900">
              R$ {stats.totalStockValueWithPromotions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {stats.totalPromotionSavings > 0 ? (
              <p className="text-xs text-green-600 flex items-center mt-1">
                <Percent className="h-3 w-3 mr-1" />
                Economia: R$ {stats.totalPromotionSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (promoções)
              </p>
            ) : (
              <p className="text-xs text-purple-600 flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                Valor total em estoque
              </p>
            )}
          </div>
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
