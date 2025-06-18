
import { useState, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(false);

  // Debounce para evitar múltiplas execuções simultâneas
  const debouncedFetchStats = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchStats();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Configurar escuta em tempo real para produtos, vendas e promoções
    const productsChannel = supabase
      .channel('stats-products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => debouncedFetchStats()
      )
      .subscribe();

    const salesChannel = supabase
      .channel('stats-sales-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' }, 
        () => debouncedFetchStats()
      )
      .subscribe();

    const promotionsChannel = supabase
      .channel('stats-promotions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' }, 
        () => debouncedFetchStats()
      )
      .subscribe();

    const productPromotionsChannel = supabase
      .channel('stats-product-promotions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'product_promotions' }, 
        () => debouncedFetchStats()
      )
      .subscribe();

    return () => {
      productsChannel.unsubscribe();
      salesChannel.unsubscribe();
      promotionsChannel.unsubscribe();
      productPromotionsChannel.unsubscribe();
    };
  }, [debouncedFetchStats]);

  const fetchStats = async () => {
    if (loading) return; // Evitar execuções simultâneas
    
    try {
      setLoading(true);
      
      // Buscar vendas de hoje
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: todaySales, error: salesError } = await supabase
        .from('sales')
        .select('total_price')
        .gte('sale_date', today)
        .lt('sale_date', tomorrow);

      if (salesError) {
        console.error('Erro ao buscar vendas:', salesError);
      }

      // Buscar TODOS os produtos
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('id, price, stock_quantity, minimum_stock');

      if (productsError) {
        console.error('Erro ao buscar produtos:', productsError);
        throw productsError;
      }

      console.log('Total de produtos encontrados:', allProducts?.length || 0);

      // Buscar apenas promoções ATIVAS e dentro do período válido
      const currentDate = new Date().toISOString();
      const { data: activePromotions, error: promotionsError } = await supabase
        .from('promotions')
        .select('id, discount_type, discount_value, start_date, end_date')
        .eq('is_active', true)
        .lte('start_date', currentDate)
        .gte('end_date', currentDate);

      if (promotionsError) {
        console.error('Erro ao buscar promoções:', promotionsError);
      }

      console.log('Promoções ativas encontradas:', activePromotions?.length || 0);

      // Buscar associações produto-promoção apenas para promoções ativas
      let productPromotions: any[] = [];
      if (activePromotions && activePromotions.length > 0) {
        const { data: ppData, error: ppError } = await supabase
          .from('product_promotions')
          .select('product_id, promotion_id')
          .in('promotion_id', activePromotions.map(p => p.id));

        if (ppError) {
          console.error('Erro ao buscar associações produto-promoção:', ppError);
        } else {
          productPromotions = ppData || [];
        }
      }

      console.log('Associações produto-promoção encontradas:', productPromotions.length);

      let totalProducts = 0;
      let lowStockProducts = 0;
      let totalStockValue = 0;
      let totalStockValueWithPromotions = 0;
      let totalPromotionSavings = 0;

      if (allProducts && Array.isArray(allProducts)) {
        totalProducts = allProducts.length;
        
        allProducts.forEach(product => {
          // Verificações de segurança
          if (!product || typeof product.price !== 'number' || typeof product.stock_quantity !== 'number') {
            console.warn('Produto com dados inválidos encontrado:', product);
            return;
          }

          // Verificar estoque baixo
          if (product.stock_quantity <= (product.minimum_stock || 0)) {
            lowStockProducts++;
          }

          const originalValue = product.price * product.stock_quantity;
          totalStockValue += originalValue;

          // Verificar se o produto tem promoção ativa
          const productPromotion = productPromotions.find(pp => pp.product_id === product.id);
          const activePromotion = productPromotion && activePromotions ? 
            activePromotions.find(p => p.id === productPromotion.promotion_id) : null;

          if (activePromotion && activePromotion.discount_type && typeof activePromotion.discount_value === 'number') {
            let discountedPrice = product.price;
            
            if (activePromotion.discount_type === 'percentage') {
              discountedPrice = product.price * (1 - activePromotion.discount_value / 100);
            } else if (activePromotion.discount_type === 'fixed_amount') {
              discountedPrice = Math.max(0, product.price - activePromotion.discount_value);
            }
            
            const promotionalValue = discountedPrice * product.stock_quantity;
            totalStockValueWithPromotions += promotionalValue;
            totalPromotionSavings += (originalValue - promotionalValue);
          } else {
            // Se não há promoção ativa, usa o preço original
            totalStockValueWithPromotions += originalValue;
          }
        });
      }

      const todaySalesCount = todaySales?.length || 0;
      const todayRevenueValue = todaySales?.reduce((sum, s) => {
        return sum + (typeof s.total_price === 'number' ? s.total_price : 0);
      }, 0) || 0;

      console.log('Estatísticas calculadas:', {
        totalProducts,
        lowStockProducts,
        totalStockValue,
        totalStockValueWithPromotions,
        totalPromotionSavings
      });

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
      
      // Em caso de erro, buscar apenas dados básicos dos produtos
      try {
        const { data: basicProducts, error: basicError } = await supabase
          .from('products')
          .select('price, stock_quantity, minimum_stock');

        if (basicError) {
          console.error('Erro ao buscar dados básicos:', basicError);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const { data: todaySalesData } = await supabase
          .from('sales')
          .select('total_price')
          .gte('sale_date', today)
          .lt('sale_date', tomorrow);

        if (basicProducts && Array.isArray(basicProducts)) {
          const totalProducts = basicProducts.length;
          const lowStockProducts = basicProducts.filter(p => 
            p && typeof p.stock_quantity === 'number' && typeof p.minimum_stock === 'number' &&
            p.stock_quantity <= p.minimum_stock
          ).length;
          const totalStockValue = basicProducts.reduce((sum, p) => {
            if (p && typeof p.price === 'number' && typeof p.stock_quantity === 'number') {
              return sum + (p.price * p.stock_quantity);
            }
            return sum;
          }, 0);

          const todaySalesCount = todaySalesData?.length || 0;
          const todayRevenueValue = todaySalesData?.reduce((sum, s) => {
            return sum + (typeof s.total_price === 'number' ? s.total_price : 0);
          }, 0) || 0;

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
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        // Manter stats em estado seguro
        setStats({
          totalProducts: 0,
          lowStockProducts: 0,
          totalStockValue: 0,
          totalStockValueWithPromotions: 0,
          totalPromotionSavings: 0,
          todaySales: 0,
          todayRevenue: 0,
        });
      }
    } finally {
      setLoading(false);
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
            <div className="text-2xl font-bold text-purple-900">
              R$ {stats.totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {stats.totalPromotionSavings > 0 ? (
              <div className="space-y-1">
                <div className="text-sm text-gray-600">
                  Com desconto: R$ {stats.totalStockValueWithPromotions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-orange-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Desconto concedido: R$ {stats.totalPromotionSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ) : (
              <p className="text-xs text-purple-600 flex items-center mt-1">
                <BarChart3 className="h-3 w-3 mr-1" />
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
