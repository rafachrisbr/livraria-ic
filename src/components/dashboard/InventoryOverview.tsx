
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse, AlertTriangle, Package } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  minimum_stock: number;
  product_code: string;
  categories: {
    name: string;
  };
}

export const InventoryOverview = () => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    fetchInventoryStatus();
    
    // Configurar escuta em tempo real para produtos
    const channel = supabase
      .channel('inventory-overview-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => fetchInventoryStatus()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  const fetchInventoryStatus = async () => {
    try {
      setLoading(true);
      
      // Buscar produtos com estoque baixo ou zerado
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock_quantity,
          minimum_stock,
          product_code,
          categories:category_id (
            name
          )
        `)
        .or('stock_quantity.eq.0,stock_quantity.lte.minimum_stock')
        .order('stock_quantity', { ascending: true });

      if (error) {
        console.error('Error fetching inventory status:', error);
        return;
      }

      const products = data || [];
      const outOfStock = products.filter(p => p.stock_quantity === 0);
      const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.minimum_stock);

      setOutOfStockProducts(outOfStock);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error fetching inventory status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Warehouse className="h-5 w-5" />
            <span>Controle de Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando status do estoque...</div>
        </CardContent>
      </Card>
    );
  }

  if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5 text-red-700" />
            <span>Estoque Baixo</span>
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
              {lowStockProducts.length + outOfStockProducts.length}
            </span>
          </CardTitle>
          <CardDescription className="text-red-600">
            Existem {lowStockProducts.length + outOfStockProducts.length} produtos com estoque abaixo do mínimo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lista de produtos sem estoque */}
            {outOfStockProducts.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-600">Sem Estoque ({outOfStockProducts.length})</span>
                </div>
                <div className="space-y-2">
                  {outOfStockProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.product_code}
                          </span>
                          <span className="font-medium text-sm">{product.name}</span>
                        </div>
                      </div>
                      <div className="text-red-600 font-bold text-sm">
                        0 un.
                      </div>
                    </div>
                  ))}
                  {outOfStockProducts.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      + {outOfStockProducts.length - 3} outros produtos
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lista de produtos com estoque baixo */}
            {lowStockProducts.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-600">Estoque Baixo ({lowStockProducts.length})</span>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.product_code}
                          </span>
                          <span className="font-medium text-sm">{product.name}</span>
                        </div>
                      </div>
                      <div className="text-orange-600 font-bold text-sm">
                        {product.stock_quantity} un.
                      </div>
                    </div>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      + {lowStockProducts.length - 3} outros produtos
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-900">
          <Warehouse className="h-5 w-5" />
          <span>Estoque Normalizado</span>
        </CardTitle>
        <CardDescription>
          Todos os produtos estão com estoque adequado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Estoque Normalizado
          </h3>
          <p className="text-green-600 mb-4">
            Todos os produtos estão com estoque adequado
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
