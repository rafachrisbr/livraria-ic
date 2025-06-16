import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddProductDialog } from '@/components/products/AddProductDialog';
import { EditProductDialog } from '@/components/products/EditProductDialog';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/MobileHeader';

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

const Products = () => {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const handleProductAdded = () => {
    fetchProducts();
    console.log('Produto adicionado com sucesso!');
  };

  const handleProductUpdated = () => {
    fetchProducts();
    console.log('Produto atualizado com sucesso!');
  };

  const handleProductDeleted = () => {
    fetchProducts();
    console.log('Produto excluído com sucesso!');
  };

  const handleCategoryAdded = () => {
    // Recarregar produtos para atualizar as categorias disponíveis
    fetchProducts();
    console.log('Categoria adicionada com sucesso!');
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader 
          title="Produtos" 
          subtitle="Gerenciar produtos"
        />

        <main className="px-4 py-6">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex space-x-3">
              <AddProductDialog onProductAdded={handleProductAdded} />
              <AddCategoryDialog onCategoryAdded={handleCategoryAdded} />
            </div>
            <Link to="/inventory">
              <Button variant="outline" className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Controle de Estoque
              </Button>
            </Link>
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
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum produto cadastrado
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-4">
                    Comece adicionando livros e artigos religiosos ao seu estoque
                  </p>
                  <AddProductDialog 
                    onProductAdded={handleProductAdded}
                    trigger={
                      <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Produto
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
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
        </main>
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-3">
            <AddProductDialog onProductAdded={handleProductAdded} />
            <AddCategoryDialog onCategoryAdded={handleCategoryAdded} />
          </div>
          <Link to="/inventory">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Controle de Estoque
            </Button>
          </Link>
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
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum produto cadastrado
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-4">
                  Comece adicionando livros e artigos religiosos ao seu estoque
                </p>
                <AddProductDialog 
                  onProductAdded={handleProductAdded}
                  trigger={
                    <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Produto
                    </Button>
                  }
                />
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
                    {products.map((product) => (
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
      </main>
    </div>
  );
};

export default Products;
