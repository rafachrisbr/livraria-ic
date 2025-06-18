
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, AlertCircle } from "lucide-react";
import { useSalesManagement } from "@/hooks/useSalesManagement";
import { ConfirmDeleteAllSalesDialog } from "./ConfirmDeleteAllSalesDialog";
import { useSupabase } from "@/hooks/useSupabase";

interface Sale {
  id: string;
  sale_date: string;
  total_price: number;
  quantity: number;
  payment_method: string;
  products: {
    name: string;
  };
  administrators: {
    name: string;
    email: string;
  };
}

export const SalesManagementCard = () => {
  const { loading, deleteAllSales, deleteSale } = useSalesManagement();
  const supabase = useSupabase();
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setSalesLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id, sale_date, total_price, quantity, payment_method,
          products(name),
          administrators(name, email)
        `)
        .order('sale_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching sales:', error);
        throw error;
      }
      
      setSales(data || []);
    } catch (error: any) {
      console.error('Error in fetchSales:', error);
      setError('Erro ao carregar vendas. Verifique as permissões.');
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDeleteSale = async (saleId: string) => {
    const success = await deleteSale(saleId);
    if (success) {
      await fetchSales();
    }
  };

  const handleDeleteAllSales = async () => {
    const deletedCount = await deleteAllSales();
    if (deletedCount > 0) {
      await fetchSales();
    }
    return deletedCount;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-6 w-6" />
            <span>Erro no Gerenciamento de Vendas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => {
              setError(null);
              fetchSales();
            }} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-800">
          <ShoppingCart className="h-6 w-6" />
          <span>Gerenciamento de Vendas</span>
        </CardTitle>
        <CardDescription>
          Visualize e gerencie todas as vendas do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Exibindo {sales.length} vendas mais recentes
          </span>
          <div className="flex gap-2">
            <Button onClick={fetchSales} variant="outline" size="sm" disabled={salesLoading}>
              {salesLoading ? "Carregando..." : "Atualizar"}
            </Button>
            <ConfirmDeleteAllSalesDialog onConfirm={handleDeleteAllSales} loading={loading} />
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sales.length === 0 && !salesLoading ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda encontrada
            </div>
          ) : (
            sales.map((sale) => (
              <div key={sale.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sale.products?.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Qtd: {sale.quantity}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(sale.total_price)} - {sale.payment_method}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(sale.sale_date)} por {sale.administrators?.name || sale.administrators?.email}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSale(sale.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
