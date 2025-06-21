
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Package, TrendingUp, TrendingDown, AlertTriangle, Plus } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { ReplenishStockDialog } from '@/components/inventory/ReplenishStockDialog';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  minimum_stock: number;
  product_code: string;
  categories: {
    name: string;
  };
}

interface StockMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  created_at: string;
  products: {
    name: string;
  };
  administrators: {
    name: string;
    email: string;
  };
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
}

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [replenishDialogOpen, setReplenishDialogOpen] = useState(false);
  
  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchInventoryData();
    fetchMovements();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
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

      const productsData = data || [];
      setProducts(productsData);

      // Calcular estatísticas
      const totalItems = productsData.length;
      const totalValue = productsData.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
      const lowStock = productsData.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.minimum_stock).length;
      const outOfStock = productsData.filter(p => p.stock_quantity === 0).length;

      setStats({ totalItems, totalValue, lowStock, outOfStock });
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          id,
          product_id,
          movement_type,
          quantity,
          previous_stock,
          new_stock,
          reason,
          created_at,
          products:product_id (name),
          administrators:user_id (name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching movements:', error);
        return;
      }

      setMovements(data || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) {
      return { label: 'Fora de Estoque', variant: 'destructive' as const, color: 'text-red-600' };
    } else if (current <= minimum) {
      return { label: 'Estoque Baixo', variant: 'secondary' as const, color: 'text-orange-600' };
    } else {
      return { label: 'Em Estoque', variant: 'default' as const, color: 'text-green-600' };
    }
  };

  const formatMovementType = (type: string) => {
    return type === 'entry' ? 'Entrada' : 'Saída';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReplenish = (product: Product) => {
    setSelectedProduct(product);
    setReplenishDialogOpen(true);
  };

  const handleReplenishSuccess = () => {
    fetchInventoryData();
    fetchMovements();
    setReplenishDialogOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie o inventário e acompanhe as movimentações
          </p>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Barra de Busca */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código do produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">produtos cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">valor total investido</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground">produtos em alerta</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fora de Estoque</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                <p className="text-xs text-muted-foreground">produtos esgotados</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>
                Visualize e gerencie o estoque de todos os produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando produtos...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Livro</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const status = getStockStatus(product.stock_quantity, product.minimum_stock);
                      const totalValue = product.price * product.stock_quantity;
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.product_code} • {product.categories?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.stock_quantity} un.</TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>R$ {totalValue.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReplenish(product)}
                              className="flex items-center space-x-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Repor Estoque</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Todas as entradas e saídas de estoque registradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Livro</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Estoque Anterior</TableHead>
                    <TableHead>Novo Estoque</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{formatDate(movement.created_at)}</TableCell>
                      <TableCell>{movement.products?.name}</TableCell>
                      <TableCell>
                        <Badge variant={movement.movement_type === 'entry' ? 'default' : 'secondary'}>
                          {formatMovementType(movement.movement_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{movement.previous_stock}</TableCell>
                      <TableCell>{movement.new_stock}</TableCell>
                      <TableCell>{movement.reason || '-'}</TableCell>
                      <TableCell>{movement.administrators?.name || movement.administrators?.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Reposição */}
      <ReplenishStockDialog
        product={selectedProduct}
        open={replenishDialogOpen}
        onClose={() => setReplenishDialogOpen(false)}
        onSuccess={handleReplenishSuccess}
      />
    </div>
  );
};

export default Inventory;
