
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethodData {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const chartConfig = {
  value: {
    label: "Vendas",
  },
};

export const PaymentMethodChart = () => {
  const [data, setData] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethodData();
  }, []);

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

  const fetchPaymentMethodData = async () => {
    try {
      setLoading(true);
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('payment_method, total_price');

      if (error) throw error;

      // Agrupar vendas por método de pagamento
      const paymentMethods = salesData?.reduce((acc: Record<string, number>, sale) => {
        const method = sale.payment_method;
        acc[method] = (acc[method] || 0) + sale.total_price;
        return acc;
      }, {}) || {};

      // Calcular total para percentuais
      const total = Object.values(paymentMethods).reduce((sum, value) => sum + value, 0);

      // Converter para formato do gráfico
      const chartData = Object.entries(paymentMethods).map(([method, value]) => ({
        name: getPaymentMethodLabel(method),
        value: value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching payment method data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Vendas por Meio de Pagamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando dados...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Vendas por Meio de Pagamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum dado de vendas disponível</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    'Valor Total'
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
