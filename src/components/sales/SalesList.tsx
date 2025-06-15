
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ShoppingCart, X, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Sale {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  payment_method: string;
  sale_date: string;
  notes: string | null;
  status: string;
  products: {
    name: string;
    product_code: string;
  };
}

interface SalesListProps {
  refreshTrigger: number;
}

export const SalesList = ({ refreshTrigger }: SalesListProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, [refreshTrigger]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          payment_method,
          sale_date,
          notes,
          status,
          products:product_id (
            name,
            product_code
          )
        `)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar vendas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelSale = async (saleId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: 'cancelada' })
        .eq('id', saleId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Venda cancelada com sucesso. Estoque restaurado.'
      });

      fetchSales();
    } catch (error) {
      console.error('Error canceling sale:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao cancelar venda',
        variant: 'destructive'
      });
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      dinheiro: 'Dinheiro',
      cartao_debito: 'Cartão de Débito',
      cartao_credito: 'Cartão de Crédito',
      pix: 'PIX',
      outros: 'Outros'
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (loading) {
    return (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Histórico de Vendas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando vendas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span>Histórico de Vendas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma venda registrada
            </h3>
            <p className="text-gray-500">
              As vendas aparecerão aqui quando forem registradas
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sales.map((sale) => (
              <div key={sale.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {sale.products.product_code}
                      </span>
                      <span className="font-medium">{sale.products.name}</span>
                      <Badge 
                        variant={sale.status === 'ativa' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {sale.status === 'ativa' ? 'Ativa' : 'Cancelada'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(sale.sale_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{getPaymentMethodLabel(sale.payment_method)}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mt-1">
                      Quantidade: {sale.quantity} | Preço Unit.: R$ {sale.unit_price.toFixed(2)}
                    </div>
                    
                    {sale.notes && (
                      <div className="text-sm text-gray-500 mt-2 italic">
                        {sale.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-800">
                      R$ {sale.total_price.toFixed(2)}
                    </div>
                    {sale.status === 'ativa' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-2 text-red-600 hover:text-red-700">
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar Venda</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja cancelar esta venda? O estoque será automaticamente restaurado.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Não</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => cancelSale(sale.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sim, Cancelar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
