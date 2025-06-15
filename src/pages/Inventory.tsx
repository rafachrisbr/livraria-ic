import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Package, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  minimum_stock: number;
  price: number;
  product_code: string;
  categories: {
    name: string;
  };
}

const Inventory = () => {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterType]);

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
          price,
          product_code,
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

  const filterProducts = () => {
    let filtered = products;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categories?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    switch (filterType) {
      case 'low':
        filtered = filtered.filter(product => 
          product.stock_quantity > 0 && product.stock_quantity <= product.minimum_stock
        );
        break;
      case 'out':
        filtered = filtered.filter(product => product.stock_quantity === 0);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const getStockBadge = (current: number, minimum: number) => {
    if (current === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    } else if (current <= minimum) {
      return <Badge variant="destructive">Estoque Baixo</Badge>;
    } else if (current <= minimum * 2) {
      return <Badge variant="secondary">Atenção</Badge>;
    } else {
      return <Badge variant="default">Normal</Badge>;
    }
  };

  const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.minimum_stock).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;

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
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{products.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{lowStockCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Sem Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{outOfStockCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e busca */}
        <Card className="bg-white border-slate-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, código ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === 'low' ? 'default' : 'outline'}
                  onClick={() => setFilterType('low')}
                  size="sm"
                >
                  Estoque Baixo
                </Button>
                <Button
                  variant={filterType === 'out' ? 'default' : 'outline'}
                  onClick={() => setFilterType('out')}
                  size="sm"
                >
                  Sem Estoque
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de produtos */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Package className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-slate-800">Estoque de Produtos</CardTitle>
                <CardDescription>
                  Monitore os níveis de estoque em tempo real
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando produtos...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros ou adicionar novos produtos
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                      <TableHead>Estoque Mínimo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {product.product_code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                        </TableCell>
                        <TableCell>{product.categories?.name}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            product.stock_quantity === 0 ? 'text-red-600' :
                            product.stock_quantity <= product.minimum_stock ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {product.stock_quantity} unidades
                          </span>
                        </TableCell>
                        <TableCell>{product.minimum_stock} unidades</TableCell>
                        <TableCell>
                          {getStockBadge(product.stock_quantity, product.minimum_stock)}
                        </TableCell>
                        <TableCell>
                          R$ {(product.price * product.stock_quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
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
