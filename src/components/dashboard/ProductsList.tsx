
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

export const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) {
      return { status: 'Sem Estoque', color: 'text-red-600' };
    } else if (current <= minimum) {
      return { status: 'Estoque Baixo', color: 'text-orange-600' };
    } else {
      return { status: 'Normal', color: 'text-green-600' };
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Produtos em Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando produtos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Produtos em Estoque</span>
        </CardTitle>
        <CardDescription>
          Lista detalhada de todos os produtos cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum produto cadastrado
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock);
              return (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.product_code}
                      </span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Categoria: {product.categories?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${stockStatus.color}`}>
                      {product.stock_quantity} unidades
                    </div>
                    <div className="text-xs text-gray-500">
                      {stockStatus.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
