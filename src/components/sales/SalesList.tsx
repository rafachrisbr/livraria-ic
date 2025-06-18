
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Calendar, DollarSign, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { DeleteSaleDialog } from './DeleteSaleDialog';

interface Sale {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  payment_method: string;
  sale_date: string;
  notes: string | null;
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
  const supabase = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchSales();
    
    // Configurar escuta em tempo real para vendas
    const channel = supabase
      .channel('sales-list-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' }, 
        () => fetchSales()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

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

  const handleSaleDeleted = () => {
    fetchSales();
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
            <p className="text-gray-500 mb-4">
              As vendas aparecerão aqui quando forem registradas
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Para fazer vendas, você precisa primeiro cadastrar produtos
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link to="/products">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Produtos
                  </Button>
                </Link>
              </div>
            </div>
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
                      <Badge variant="default" className="text-xs">
                        Concluída
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
                  
                  <div className="text-right flex flex-col items-end space-y-2">
                    <div className="text-lg font-bold text-slate-800">
                      R$ {sale.total_price.toFixed(2)}
                    </div>
                    <DeleteSaleDialog 
                      saleId={sale.id}
                      productName={sale.products.name}
                      quantity={sale.quantity}
                      totalPrice={sale.total_price}
                      onSaleDeleted={handleSaleDeleted}
                    />
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
