
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Trash2, Edit, AlertCircle } from "lucide-react";
import { useProductManagement } from "@/hooks/useProductManagement";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditProductDialog } from "./EditProductDialog";
import { ConfirmDeleteAllProductsDialog } from "./ConfirmDeleteAllProductsDialog";

export const ProductManagementCard = () => {
  const { products, loading, fetchAllProducts, deleteProduct, updateProductStock, updateProduct, deleteAllProducts } = useProductManagement();
  const [error, setError] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        await fetchAllProducts();
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Erro ao carregar produtos. Verifique as permissões.');
      }
    };

    loadProducts();
  }, []);

  const handleStockUpdate = async (productId: string) => {
    const newStock = editingStock[productId];
    if (newStock !== undefined && newStock >= 0) {
      const success = await updateProductStock(productId, newStock);
      if (success) {
        setEditingStock(prev => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-6 w-6" />
            <span>Erro no Gerenciamento de Produtos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => {
              setError(null);
              fetchAllProducts();
            }} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-800">
          <Package className="h-6 w-6" />
          <span>Gerenciamento de Produtos</span>
        </CardTitle>
        <CardDescription>
          Gerencie todos os produtos do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total de produtos: {products.length}
          </span>
          <div className="flex gap-2">
            {products.length > 0 && (
              <ConfirmDeleteAllProductsDialog
                onConfirm={deleteAllProducts}
                loading={loading}
              />
            )}
            <Button onClick={fetchAllProducts} variant="outline" size="sm" disabled={loading}>
              {loading ? "Carregando..." : "Atualizar Lista"}
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {products.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto encontrado
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {product.product_code}
                      </Badge>
                      {product.stock_quantity <= 5 && (
                        <Badge variant="destructive" className="text-xs">
                          Estoque Baixo
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Preço: {formatCurrency(product.price)}</div>
                      <div className="flex items-center gap-2">
                        Estoque: 
                        {editingStock[product.id] !== undefined ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editingStock[product.id]}
                              onChange={(e) => setEditingStock(prev => ({
                                ...prev,
                                [product.id]: parseInt(e.target.value) || 0
                              }))}
                              className="w-20 h-8"
                              min="0"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleStockUpdate(product.id)}
                              disabled={loading}
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingStock(prev => {
                                const updated = { ...prev };
                                delete updated[product.id];
                                return updated;
                              })}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{product.stock_quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingStock(prev => ({
                                ...prev,
                                [product.id]: product.stock_quantity
                              }))}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>Criado: {formatDate(product.created_at)}</div>
                      {product.description && (
                        <div className="text-xs text-gray-500">{product.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <EditProductDialog
                      product={product}
                      onEdit={updateProduct}
                      loading={loading}
                    />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar Produto</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar o produto "{product.name}"? 
                            Esta ação também irá deletar todas as vendas relacionadas a este produto.
                            Esta ação é irreversível.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
