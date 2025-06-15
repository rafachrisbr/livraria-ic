
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const COLORS = [
  "#5CADFF", // azul suave
  "#FFD06B", // amarelo suave
  "#8CE99A", // verde suave
  "#FFA2B1", // rosa suave
  "#A9A2FF", // lilás suave
  "#FFD2A6", // laranja pastel
  "#F0BEFF", // roxo pastel
  "#83FFE8", // turquesa claro
  "#FAB6B6", // coral claro
  "#D0FFA3", // verde limão claro
];

interface ProductSaleData {
  name: string;
  quantity: number;
  revenue: number;
  fill?: string;
}

const chartConfig = {
  quantity: {
    label: "Quantidade Vendida",
    color: "hsl(var(--chart-1))",
  },
};

export const ProductSalesChart = () => {
  const [data, setData] = useState<ProductSaleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductSalesData();
  }, []);

  const fetchProductSalesData = async () => {
    try {
      setLoading(true);
      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          quantity,
          total_price,
          products:product_id (
            name
          )
        `);

      if (error) throw error;

      // Agrupar vendas por produto
      const productSales = salesData?.reduce((acc: Record<string, ProductSaleData>, sale) => {
        const productName = sale.products?.name || 'Produto Desconhecido';

        if (!acc[productName]) {
          acc[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0
          };
        }

        acc[productName].quantity += sale.quantity;
        acc[productName].revenue += sale.total_price;

        return acc;
      }, {}) || {};

      // Converter para array e ordenar por quantidade vendida
      const sortedData = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10); // Top 10 produtos

      // Associar cores suaves a cada produto
      const dataWithColors = sortedData.map((item, idx) => ({
        ...item,
        fill: COLORS[idx % COLORS.length],
      }));

      setData(dataWithColors);
    } catch (error) {
      console.error('Error fetching product sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Produtos Mais Vendidos</span>
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
          <Package className="h-5 w-5" />
          <span>Produtos Mais Vendidos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum dado de vendas disponível</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    `${value} unidades`,
                    'Quantidade Vendida'
                  ]}
                />
                <Bar 
                  dataKey="quantity" 
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
