
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Package, Plus, Search, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddProductDialog } from '@/components/products/AddProductDialog';
import { EditProductDialog } from '@/components/products/EditProductDialog';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog';
import { ReplenishStockDialog } from '@/components/inventory/ReplenishStockDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useSupabase } from '@/hooks/useSupabase';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  minimum_stock: number;
  image_url: string | null;
  category_id: string;
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
  } | null;
  administrators: {
    name: string;
    email: string;
  } | null;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
}

const Products = () => {
  const { user, signOut } = useAuth();
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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const supabaseInstance = useSupabase();

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    fetchProducts();
    fetchMovements();
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

      const productsData = data || [];
      setProducts(productsData);

      // Buscar promoções ativas para calcular valores corretos
      const { data: promotions } = await supabase
        .from('promotions')
        .select(`
          *,
          product_promotions:product_promotions(product_id)
        `)
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());

      // Calcular estatísticas considerando promoções
      const totalItems = productsData.length;
      let totalValue = 0;
      
      productsData.forEach(product => {
        let effectivePrice = product.price;
        
        // Verificar se produto tem promoção ativa
        const promotion = promotions?.find(p => 
          p.product_promotions?.some((pp: any) => pp.product_id === product.id)
        );
        
        if (promotion) {
          if (promotion.discount_type === 'percentage') {
            effectivePrice = product.price * (1 - promotion.discount_value / 100);
          } else if (promotion.discount_type === 'fixed') {
            effectivePrice = Math.max(0, product.price - promotion.discount_value);
          }
        }
        
        totalValue += effectivePrice * product.stock_quantity;
      });
      
      const lowStock = productsData.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.minimum_stock).length;
      const outOfStock = productsData.filter(p => p.stock_quantity === 0).length;

      setStats({ totalItems, totalValue, lowStock, outOfStock });
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
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching movements:', error);
        return;
      }

      // Buscar informações dos administradores separadamente
      const userIds = [...new Set(data?.map(m => m.user_id) || [])];
      const { data: adminsData } = await supabase
        .from('administrators')
        .select('user_id, name, email')
        .in('user_id', userIds);

      // Mapear movimentações com dados dos administradores
      const movementsWithAdmins = data?.map(movement => ({
        ...movement,
        administrators: adminsData?.find(admin => admin.user_id === movement.user_id) || null
      })) || [];

      setMovements(movementsWithAdmins);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const handleProductAdded = () => {
    fetchProducts();
    fetchMovements();
    console.log('Produto adicionado com sucesso!');
  };

  const handleProductUpdated = () => {
    fetchProducts();
    fetchMovements();
    console.log('Produto atualizado com sucesso!');
  };

  const handleProductDeleted = () => {
    fetchProducts();
    fetchMovements();
    console.log('Produto excluído com sucesso!');
  };

  const handleCategoryAdded = () => {
    fetchProducts();
    console.log('Categoria adicionada com sucesso!');
  };

  const handleReplenish = (product: Product) => {
    setSelectedProduct(product);
    setReplenishDialogOpen(true);
  };

  const handleReplenishSuccess = () => {
    fetchProducts();
    fetchMovements();
    setReplenishDialogOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader 
          title="Produtos" 
          subtitle="Gerenciar produtos"
        />

        <main className="px-4 py-6">
          <Tabs defaultValue="products" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="movements">Movimentações</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalItems}</div>
                    <p className="text-xs text-muted-foreground">produtos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">em estoque</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
                    <p className="text-xs text-muted-foreground">em alerta</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fora de Estoque</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                    <p className="text-xs text-muted-foreground">esgotados</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex space-x-3">
                  <AddProductDialog onProductAdded={handleProductAdded} />
                  <AddCategoryDialog onCategoryAdded={handleCategoryAdded} />
                </div>
                
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Lista de Produtos Mobile */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4">
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
                      <p className="text-gray-500 max-w-sm mx-auto mb-4">
                        {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece adicionando produtos ao estoque'}
                      </p>
                      {!searchTerm && (
                        <AddProductDialog 
                          onProductAdded={handleProductAdded}
                          trigger={
                            <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Primeiro Produto
                            </Button>
                          }
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start space-x-3">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.categories?.name}</p>
                              {product.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-lg font-semibold text-gray-900">
                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                  {product.stock_quantity} unidades
                                </span>
                                {getStockBadge(product.stock_quantity, product.minimum_stock)}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReplenish(product)}
                                className="flex items-center space-x-1"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Repor</span>
                              </Button>
                              <EditProductDialog 
                                product={product} 
                                onProductUpdated={handleProductUpdated}
                              />
                              <DeleteProductDialog 
                                productId={product.id}
                                productName={product.name}
                                onProductDeleted={handleProductDeleted}
                              />
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {product.product_code}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Movimentações</CardTitle>
                  <CardDescription>
                    Todas as entradas e saídas de estoque
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {movements.map((movement) => (
                      <div key={movement.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{movement.products?.name}</div>
                          <Badge variant={movement.movement_type === 'entry' ? 'default' : 'secondary'}>
                            {formatMovementType(movement.movement_type)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Quantidade: {movement.quantity}</div>
                          <div>Estoque: {movement.previous_stock} → {movement.new_stock}</div>
                          <div>Data: {formatDate(movement.created_at)}</div>
                          {movement.reason && <div>Motivo: {movement.reason}</div>}
                          {movement.administrators && (
                            <div>Por: {movement.administrators.name || movement.administrators.email}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Dialog de Reposição */}
        <ReplenishStockDialog
          product={selectedProduct}
          open={replenishDialogOpen}
          onClose={() => setReplenishDialogOpen(false)}
          onSuccess={handleReplenishSuccess}
        />
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
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
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
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

            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <AddProductDialog onProductAdded={handleProductAdded} />
                <AddCategoryDialog onCategoryAdded={handleCategoryAdded} />
              </div>
              
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-80"
                />
              </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <Package className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-800">Lista de Produtos</CardTitle>
                    <CardDescription>
                      Gerencie livros e artigos religiosos
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
                      {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-4">
                      {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece adicionando livros e artigos religiosos ao seu estoque'}
                    </p>
                    {!searchTerm && (
                      <AddProductDialog 
                        onProductAdded={handleProductAdded}
                        trigger={
                          <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Primeiro Produto
                          </Button>
                        }
                      />
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
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
                              <div className="flex items-center space-x-3">
                                {product.image_url && (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  {product.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {product.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{product.categories?.name}</TableCell>
                            <TableCell>
                              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className={`font-medium ${
                                  product.stock_quantity === 0 ? 'text-red-600' :
                                  product.stock_quantity <= product.minimum_stock ? 'text-orange-600' :
                                  'text-green-600'
                                }`}>
                                  {product.stock_quantity} unidades
                                </div>
                                <div className="text-gray-500">
                                  Mín: {product.minimum_stock}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStockBadge(product.stock_quantity, product.minimum_stock)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReplenish(product)}
                                  className="flex items-center space-x-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Repor</span>
                                </Button>
                                <EditProductDialog 
                                  product={product} 
                                  onProductUpdated={handleProductUpdated}
                                />
                                <DeleteProductDialog 
                                  productId={product.id}
                                  productName={product.name}
                                  onProductDeleted={handleProductDeleted}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
      </main>
    </div>
  );
};

export default Products;
