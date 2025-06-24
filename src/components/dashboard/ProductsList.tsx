
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Package, Plus, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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

export const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    fetchProducts();
    
    // Configurar escuta em tempo real para produtos
    const channel = supabase
      .channel('products-list-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

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
        .order('product_code', { ascending: true });

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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Cadastre produtos para começar a gerenciar seu estoque
            </p>
            <Link to="/products">
              <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Produto
              </Button>
            </Link>
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
      <CardFooter className="border-t bg-slate-50">
        <Link to="/products" className="w-full">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold">
            <Warehouse className="h-4 w-4 mr-2" />
            Controle de Estoque Completo
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
