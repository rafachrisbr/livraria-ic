
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, DollarSign, Users, Package, Download } from 'lucide-react';
import { PaymentMethodChart } from '@/components/reports/PaymentMethodChart';
import { ProductSalesChart } from '@/components/reports/ProductSalesChart';
import { supabase } from '@/integrations/supabase/client';
import { useExcelExport } from '@/hooks/useExcelExport';
import { useToast } from '@/hooks/use-toast';

interface SalesData {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
}

const Reports = () => {
  const [salesData, setSalesData] = useState<SalesData>({
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    topProducts: [],
    paymentMethods: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const { exportReportsToExcel } = useExcelExport();
  const { toast } = useToast();

  // Data de início fixada em 01/06/2025
  const FILTER_START_DATE = '2025-06-01';

  useEffect(() => {
    fetchSalesData();
  }, [selectedYear, selectedMonth]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      let startDate = FILTER_START_DATE;
      let endDate = `${selectedYear}-12-31`;
      
      // Aplicar filtro de mês se selecionado
      if (selectedMonth !== 'all') {
        const month = selectedMonth.padStart(2, '0');
        startDate = `${selectedYear}-${month}-01`;
        
        // Calcular último dia do mês
        const lastDay = new Date(parseInt(selectedYear), parseInt(month), 0).getDate();
        endDate = `${selectedYear}-${month}-${lastDay}`;
        
        // Garantir que não seja anterior à data de início fixa
        if (startDate < FILTER_START_DATE) {
          startDate = FILTER_START_DATE;
        }
      }

      console.log('Fetching sales data from:', startDate, 'to:', endDate);

      // Buscar vendas no período, incluindo promoções
      const { data: salesResponse, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          products:product_id (name),
          administrators:administrator_id (name, email)
        `)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date', { ascending: false });

      if (salesError) {
        console.error('Error fetching sales:', salesError);
        return;
      }

      const sales = salesResponse || [];
      console.log('Sales found:', sales.length);

      // Calcular estatísticas incluindo vendas com promoção
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Top produtos
      const productSales = sales.reduce((acc: Record<string, { quantity: number; revenue: number }>, sale) => {
        const productName = sale.products?.name || 'Produto Desconhecido';
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, revenue: 0 };
        }
        acc[productName].quantity += sale.quantity || 0;
        acc[productName].revenue += sale.total_price || 0;
        return acc;
      }, {});

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Métodos de pagamento
      const paymentMethodCounts = sales.reduce((acc: Record<string, number>, sale) => {
        const method = sale.payment_method || 'outros';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});

      const paymentMethods = Object.entries(paymentMethodCounts).map(([method, count]) => ({
        method: method.replace('_', ' ').toUpperCase(),
        count,
        percentage: totalSales > 0 ? (count / totalSales) * 100 : 0,
      }));

      setSalesData({
        totalSales,
        totalRevenue,
        averageTicket,
        topProducts,
        paymentMethods,
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      await exportReportsToExcel();
      toast({
        title: 'Sucesso',
        description: 'Relatório exportado para Excel com sucesso!',
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar relatório para Excel.',
        variant: 'destructive',
      });
    }
  };

  const formatDateRange = () => {
    const startDate = new Date(FILTER_START_DATE);
    const endDate = new Date(`${selectedYear}-12-31`);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    if (selectedMonth !== 'all') {
      const month = selectedMonth.padStart(2, '0');
      const monthStart = new Date(parseInt(selectedYear), parseInt(month) - 1, 1);
      const monthEnd = new Date(parseInt(selectedYear), parseInt(month), 0);
      
      // Se o mês selecionado é anterior a junho/2025, mostrar a partir de junho
      if (monthStart < startDate) {
        return `${formatDate(startDate)} - ${formatDate(monthEnd)}`;
      }
      
      return `${formatDate(monthStart)} - ${formatDate(monthEnd)}`;
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const years = [
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: '2027', label: '2027' },
    { value: '2028', label: '2028' },
  ];

  const months = [
    { value: 'all', label: 'Todos os meses' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Análise de vendas e desempenho da livraria
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleExportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total de Vendas
              </CardTitle>
              <div className="p-2 bg-blue-200 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{salesData.totalSales}</div>
              <p className="text-xs text-blue-600 mt-1">
                {formatDateRange()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Receita Total
              </CardTitle>
              <div className="p-2 bg-green-200 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                R$ {salesData.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-green-600 mt-1">
                Ticket médio: R$ {salesData.averageTicket.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Ticket Médio
              </CardTitle>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                R$ {salesData.averageTicket.toFixed(2)}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Baseado em {salesData.totalSales} vendas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Relatórios */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentMethodChart />
              <ProductSalesChart />
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Produtos</CardTitle>
                <CardDescription>
                  Desempenho detalhado de vendas por produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductSalesChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Pagamentos</CardTitle>
                <CardDescription>
                  Métodos de pagamento e estatísticas detalhadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethodChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando dados...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
