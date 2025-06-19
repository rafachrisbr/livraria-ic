import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { DeleteSaleDialog } from './DeleteSaleDialog';

interface Sale {
  id: string;
  sale_date: string;
  total_price: number;
  quantity: number;
  unit_price: number;
  payment_method: string;
  credit_type: string | null;
  installments: number | null;
  installment_fee: number | null;
  installment_value: number | null;
  notes: string | null;
  promotion_id: string | null;
  promotion_name: string | null;
  promotion_discount_type: string | null;
  promotion_discount_value: number | null;
  products: {
    name: string;
    product_code: string;
  };
  administrators: {
    name: string;
    email: string;
  };
}

interface SalesListProps {
  refreshTrigger: number;
}

export const SalesList = ({ refreshTrigger }: SalesListProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();
  const { toast } = useToast();

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('sales')
        .select(`
          id, sale_date, total_price, quantity, unit_price, payment_method,
          credit_type, installments, installment_fee, installment_value,
          notes, promotion_id, promotion_name, promotion_discount_type, promotion_discount_value,
          products(name, product_code),
          administrators(name, email)
        `)
        .order('sale_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching sales:', error);
        throw error;
      }

      setSales(data || []);
    } catch (error: any) {
      console.error('Error in fetchSales:', error);
      setError('Erro ao carregar vendas');
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de vendas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      'dinheiro': 'Dinheiro',
      'cartao_debito': 'Cartão de Débito',
      'cartao_credito': 'Cartão de Crédito',
      'pix': 'PIX',
      'outros': 'Outros'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getCreditTypeLabel = (type: string | null) => {
    if (!type) return '';
    const labels = {
      'vista': 'À Vista',
      'parcelado': 'Parcelado'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const renderPaymentDetails = (sale: Sale) => {
    if (sale.payment_method !== 'cartao_credito') {
      return <span>{getPaymentMethodLabel(sale.payment_method)}</span>;
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          <span>Cartão de Crédito</span>
        </div>
        {sale.credit_type && (
          <Badge variant="secondary" className="w-fit text-xs">
            {getCreditTypeLabel(sale.credit_type)}
          </Badge>
        )}
        {sale.credit_type === 'parcelado' && sale.installments && sale.installment_value && (
          <div className="text-xs text-gray-600">
            {sale.installments}x de {formatCurrency(sale.installment_value)}
            {sale.installment_fee && sale.installment_fee > 0 && (
              <span className="text-orange-600"> (taxa {sale.installment_fee}%)</span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading && sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Vendas Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando vendas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Vendas Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchSales} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span>Vendas Recentes</span>
        </CardTitle>
        <CardDescription>
          Últimas {sales.length} vendas registradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma venda registrada ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{sale.products?.name}</span>
                        <span className="text-sm text-gray-500">
                          {sale.products?.product_code}
                        </span>
                        {sale.promotion_name && (
                          <Badge variant="secondary" className="w-fit mt-1 text-xs">
                            Promoção: {sale.promotion_name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{sale.quantity}x</span>
                        <span className="text-sm text-gray-500">
                          {formatCurrency(sale.unit_price)} cada
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(sale.total_price)}
                    </TableCell>
                    <TableCell>
                      {renderPaymentDetails(sale)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDate(sale.sale_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{sale.administrators?.name}</span>
                        <span className="text-xs text-gray-500">
                          {sale.administrators?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <DeleteSaleDialog 
                          saleId={sale.id}
                          productName={sale.products?.name || 'Produto'}
                          quantity={sale.quantity}
                          totalPrice={sale.total_price}
                          onSaleDeleted={fetchSales}
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
  );
};
