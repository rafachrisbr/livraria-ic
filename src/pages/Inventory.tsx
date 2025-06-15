
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, AlertTriangle, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  minimum_stock: number;
  image_url: string | null;
  category_id: string;
  categories: {
    name: string;
  };
}

const Inventory = () => {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            name
          )
        `)
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar produtos.',
          variant: 'destructive',
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao carregar produtos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) {
      return { status: 'out', color: 'destructive', text: 'Sem Estoque' };
    } else if (current <= minimum) {
      return { status: 'low', color: 'destructive', text: 'Estoque Baixo' };
    } else if (current <= minimum * 2) {
      return { status: 'warning', color: 'secondary', text: 'Atenção' };
    } else {
      return { status: 'good', color: 'default', text: 'Normal' };
    }
  };

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.minimum_stock);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);

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
                <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
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
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Sem Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-4 mb-6">
          <Link to="/products">
            <Button className="bg-slate-800 hover:bg-slate-900 text-white">
              Gerenciar Produtos
            </Button>
          </Link>
          <AddCategoryDialog onCategoryAdded={fetchProducts} />
        </div>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Estoque de Produtos
            </CardTitle>
            <CardDescription>
              Controle detalhado do estoque de todos os produtos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando produtos...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhum produto cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                      <TableHead>Estoque Mínimo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{product.categories?.name}</TableCell>
                          <TableCell>
                            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              product.stock_quantity === 0 ? 'text-red-600' :
                              product.stock_quantity <= product.minimum_stock ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {product.stock_quantity}
                            </span>
                          </TableCell>
                          <TableCell>{product.minimum_stock}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.color as any}>
                              {stockStatus.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            R$ {(product.price * product.stock_quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Inventory;
