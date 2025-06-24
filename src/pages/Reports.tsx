
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, DollarSign, Users, Package, Download, ArrowLeft, Tag, AlertTriangle, TrendingDown } from 'lucide-react';
import { PaymentMethodChart } from '@/components/reports/PaymentMethodChart';
import { ProductSalesChart } from '@/components/reports/ProductSalesChart';
import { supabase } from '@/integrations/supabase/client';
import { useExcelExport } from '@/hooks/useExcelExport';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SalesData {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  salesWithPromotions: number;
  promotionalRevenue: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
}

interface ProductWithoutSales {
  id: string;
  name: string;
  product_code: string;
  last_sale_date: string | null;
  days_without_sales: number;
}

const Reports = () => {
  const [salesData, setSalesData] = useState<SalesData>({
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    salesWithPromotions: 0,
    promotionalRevenue: 0,
    topProducts: [],
    paymentMethods: [],
  });
  const [productsWithoutSales, setProductsWithoutSales] = useState<ProductWithoutSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('month');
  const { exportReportsToExcel } = useExcelExport();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Data de início fixada em 01/06/2025
  const FILTER_START_DATE = '2025-06-01';

  useEffect(() => {
    fetchSalesData();
    fetchProductsWithoutSales();
  }, [selectedYear, selectedMonth, selectedWeek, selectedDay, filterType]);

  // Resetar filtros quando o tipo de filtro muda
  useEffect(() => {
    setSelectedMonth('all');
    setSelectedWeek('all');
    setSelectedDay('all');
  }, [filterType]);

  // Resetar semana e dia quando o mês muda
  useEffect(() => {
    setSelectedWeek('all');
    setSelectedDay('all');
  }, [selectedMonth]);

  const fetchProductsWithoutSales = async () => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          product_code,
          sales:sales(sale_date)
        `)
        .order('product_code', { ascending: true });

      if (error) {
        console.error('Error fetching products without sales:', error);
        return;
      }

      const productsWithoutRecentSales = products?.filter(product => {
        if (!product.sales || product.sales.length === 0) {
          return true; // Produto nunca vendido
        }
        
        const lastSaleDate = new Date(Math.max(...product.sales.map((sale: any) => new Date(sale.sale_date).getTime())));
        const daysSinceLastSale = Math.floor((Date.now() - lastSaleDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return daysSinceLastSale >= 30;
      }).map(product => {
        const lastSaleDate = product.sales && product.sales.length > 0 
          ? new Date(Math.max(...product.sales.map((sale: any) => new Date(sale.sale_date).getTime())))
          : null;
        
        const daysSinceLastSale = lastSaleDate 
          ? Math.floor((Date.now() - lastSaleDate.getTime()) / (1000 * 60 * 60 * 24))
          : Infinity;

        return {
          id: product.id,
          name: product.name,
          product_code: product.product_code,
          last_sale_date: lastSaleDate?.toISOString() || null,
          days_without_sales: daysSinceLastSale
        };
      });

      setProductsWithoutSales(productsWithoutRecentSales || []);
    } catch (error) {
      console.error('Error fetching products without sales:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      let startDate = FILTER_START_DATE;
      let endDate = `${selectedYear}-12-31`;
      
      // Aplicar filtros baseado no tipo selecionado
      if (filterType === 'month' && selectedMonth !== 'all') {
        const month = selectedMonth.padStart(2, '0');
        startDate = `${selectedYear}-${month}-01`;
        const lastDay = new Date(parseInt(selectedYear), parseInt(month), 0).getDate();
        endDate = `${selectedYear}-${month}-${lastDay}`;
      } else if (filterType === 'week' && selectedWeek !== 'all' && selectedMonth !== 'all') {
        // Calcular início e fim da semana específica do mês
        const month = parseInt(selectedMonth);
        const weekNumber = parseInt(selectedWeek);
        const firstDayOfMonth = new Date(parseInt(selectedYear), month - 1, 1);
        const weekStart = new Date(firstDayOfMonth.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        // Garantir que não ultrapasse o mês
        const lastDayOfMonth = new Date(parseInt(selectedYear), month, 0);
        
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd > lastDayOfMonth ? lastDayOfMonth.toISOString().split('T')[0] : weekEnd.toISOString().split('T')[0];
      } else if (filterType === 'day' && selectedDay !== 'all') {
        startDate = selectedDay;
        endDate = selectedDay;
      }
      
      // Garantir que não seja anterior à data de início fixa
      if (startDate < FILTER_START_DATE) {
        startDate = FILTER_START_DATE;
      }

      console.log('Fetching sales data from:', startDate, 'to:', endDate);

      // Buscar vendas no período, incluindo informações de promoções
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

      // Contar vendas com promoções - verificar múltiplos campos
      const salesWithPromotions = sales.filter(sale => 
        sale.promotion_id !== null || 
        sale.promotion_name !== null || 
        sale.promotion_discount_value !== null
      ).length;
      
      const promotionalRevenue = sales
        .filter(sale => 
          sale.promotion_id !== null || 
          sale.promotion_name !== null || 
          sale.promotion_discount_value !== null
        )
        .reduce((sum, sale) => sum + (sale.total_price || 0), 0);

      console.log('Sales with promotions:', salesWithPromotions);
      console.log('Promotional revenue:', promotionalRevenue);

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
        salesWithPromotions,
        promotionalRevenue,
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

  const handleLogout = async () => {
    await signOut();
  };

  const handleCreatePromotion = () => {
    navigate('/promotions');
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

    if (filterType === 'month' && selectedMonth !== 'all') {
      const month = selectedMonth.padStart(2, '0');
      const monthStart = new Date(parseInt(selectedYear), parseInt(month) - 1, 1);
      const monthEnd = new Date(parseInt(selectedYear), parseInt(month), 0);
      
      if (monthStart < startDate) {
        return `${formatDate(startDate)} - ${formatDate(monthEnd)}`;
      }
      
      return `${formatDate(monthStart)} - ${formatDate(monthEnd)}`;
    } else if (filterType === 'day' && selectedDay !== 'all') {
      return formatDate(new Date(selectedDay));
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

  // Gerar semanas do mês selecionado
  const generateWeeksForSelectedMonth = () => {
    if (selectedMonth === 'all') return [];
    
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    const weeks = [{ value: 'all', label: 'Todas as semanas' }];
    
    let currentWeek = 1;
    let currentDate = new Date(firstDay);
    
    while (currentDate <= lastDay) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      // Ajustar o fim da semana para não passar do mês
      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime());
      }
      
      weeks.push({
        value: String(currentWeek),
        label: `Semana ${currentWeek} (${weekStart.getDate()}/${String(month).padStart(2, '0')} - ${weekEnd.getDate()}/${String(month).padStart(2, '0')})`
      });
      
      currentDate.setTime(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      currentWeek++;
    }
    
    return weeks;
  };

  // Gerar dias do mês selecionado
  const generateDaysForSelectedMonth = () => {
    if (selectedMonth === 'all') return [];
    
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const days = [{ value: 'all', label: 'Todos os dias' }];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month - 1, day);
      const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      days.push({
        value: dateStr,
        label: `${day} (${dayName})`
      });
    }
    
    return days;
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader title="Relatórios" subtitle="Análise de vendas e desempenho" />
        <main className="container mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
              <p className="text-muted-foreground">
                Análise de vendas e desempenho da livraria
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="day">Dia</SelectItem>
                </SelectContent>
              </Select>
              
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
              
              {(filterType === 'month' || filterType === 'week' || filterType === 'day') && (
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
              )}
              
              {filterType === 'week' && selectedMonth !== 'all' && (
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecionar semana" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateWeeksForSelectedMonth().map((week) => (
                      <SelectItem key={week.value} value={week.value}>
                        {week.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {filterType === 'day' && selectedMonth !== 'all' && (
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecionar dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateDaysForSelectedMonth().map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Button onClick={handleExportToExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>

          {/* Alert for products without sales */}
          {productsWithoutSales.length > 0 && (
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Produtos sem vendas há mais de 1 mês</span>
                </CardTitle>
                <CardDescription className="text-orange-700">
                  {productsWithoutSales.length} produto(s) precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {productsWithoutSales.slice(0, 3).map((product) => (
                    <AlertDialog key={product.id}>
                      <AlertDialogTrigger asChild>
                        <div className="p-3 bg-white rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                {product.product_code}
                              </span>
                              <p className="font-medium text-orange-900 mt-1">{product.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-orange-700">
                                {product.days_without_sales === Infinity ? 'Nunca vendido' : `${product.days_without_sales} dias`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Produto sem vendas detectado</AlertDialogTitle>
                          <AlertDialogDescription>
                            O produto <strong>{product.name}</strong> ({product.product_code}) está há {product.days_without_sales === Infinity ? 'muito tempo' : `${product.days_without_sales} dias`} sem vendas.
                            <br /><br />
                            Deseja criar uma promoção para este produto?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Não</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCreatePromotion}>
                            Sim, criar promoção
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
                </div>
                {productsWithoutSales.length > 3 && (
                  <p className="text-sm text-orange-600 mt-2">
                    E mais {productsWithoutSales.length - 3} produto(s)...
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Voltar ao Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <img 
                src="https://cadastro.fsspx.com.br/wp-content/uploads/2023/04/fsspx-logo-novo-png-large-3.png" 
                alt="FSSPX Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://static.wixstatic.com/media/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png/v1/fill/w_184,h_184,al_c,usm_0.66_1.00_0.01/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png";
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
                <p className="text-slate-600">Análise de vendas e desempenho da livraria</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 hidden sm:inline">{user?.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filtro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="day">Dia</SelectItem>
              </SelectContent>
            </Select>

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
            
            {(filterType === 'month' || filterType === 'week' || filterType === 'day') && (
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
            )}

            {filterType === 'week' && selectedMonth !== 'all' && (
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecionar semana" />
                </SelectTrigger>
                <SelectContent>
                  {generateWeeksForSelectedMonth().map((week) => (
                    <SelectItem key={week.value} value={week.value}>
                      {week.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filterType === 'day' && selectedMonth !== 'all' && (
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar dia" />
                </SelectTrigger>
                <SelectContent>
                  {generateDaysForSelectedMonth().map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button onClick={handleExportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {/* Elegant Dynamic Loading Animation */}
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-green-500 rounded-full animate-spin opacity-75" style={{ animationDelay: '0.15s', animationDuration: '1.2s' }}></div>
                <div className="absolute inset-3 w-14 h-14 border-2 border-transparent border-t-purple-500 rounded-full animate-spin opacity-60" style={{ animationDelay: '0.3s', animationDuration: '0.8s' }}></div>
                <div className="absolute inset-6 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="text-xl font-bold text-slate-700 animate-pulse">
                  Carregando relatórios...
                </div>
                <div className="text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  Processando dados de vendas e estatísticas
                </div>
                
                <div className="flex justify-center space-x-2 mt-6">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                
                <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse border border-slate-200">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32 bg-gradient-to-r from-slate-200 to-slate-300" />
                      <Skeleton className="h-8 w-8 rounded-lg bg-gradient-to-r from-slate-200 to-slate-300" />
                    </div>
                    <Skeleton className="h-8 w-20 bg-gradient-to-r from-slate-200 to-slate-300" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-3 w-40 mt-2 bg-gradient-to-r from-slate-200 to-slate-300" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="space-y-6">
              <Skeleton className="h-10 w-96 bg-gradient-to-r from-slate-200 to-slate-300" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80 rounded-lg bg-gradient-to-r from-slate-200 to-slate-300" />
                <Skeleton className="h-80 rounded-lg bg-gradient-to-r from-slate-200 to-slate-300" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
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

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">
                    Vendas com Promoção
                  </CardTitle>
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <Tag className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{salesData.salesWithPromotions}</div>
                  <p className="text-xs text-orange-600 mt-1">
                    R$ {salesData.promotionalRevenue.toFixed(2)} em receita
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
