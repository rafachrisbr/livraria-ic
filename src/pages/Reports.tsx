import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, DollarSign, Calendar, AlertTriangle, ShoppingCart, Download, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductSalesChart } from '@/components/reports/ProductSalesChart';
import { PaymentMethodChart } from '@/components/reports/PaymentMethodChart';
import { useExcelExport } from '@/hooks/useExcelExport';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  stockValue: number;
  lowStockCount: number;
  totalProducts: number;
}

interface PromotionReport {
  sale_id: string;
  product_name: string;
  promotion_name: string;
  discount_type: string;
  discount_value: number;
  unit_price: number;
  promotion_price: number;
  sale_date: string;
  quantity: number;
  total_saved: number;
}

const Reports = () => {
  const { user, signOut } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    stockValue: 0,
    lowStockCount: 0,
    totalProducts: 0
  });
  const [promotionSales, setPromotionSales] = useState<PromotionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { exportReportsToExcel } = useExcelExport();
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
    fetchPromotionSales();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Buscar dados dos produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('price, stock_quantity, minimum_stock');

      if (productsError) throw productsError;

      // Buscar dados das vendas
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_price');

      if (salesError) throw salesError;

      // Calcular métricas dos produtos
      const totalProducts = products?.length || 0;
      const stockValue = products?.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0) || 0;
      const lowStockCount = products?.filter(p => p.stock_quantity <= p.minimum_stock).length || 0;

      // Calcular métricas das vendas
      const totalSales = sales?.length || 0;
      const totalRevenue = sales?.reduce((sum, s) => sum + s.total_price, 0) || 0;
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

      setReportData({
        totalSales,
        totalRevenue,
        averageTicket,
        stockValue,
        lowStockCount,
        totalProducts
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotionSales = async () => {
    /*
      Para cada venda com promotion_id preenchido, buscar nome da promoção + produto, valor do desconto, e calcular preço promocional/aplicado
    */
    try {
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
            id, quantity, unit_price, total_price, sale_date, promotion_id,
            product:products(id, name),
            promotion:promotions(id, name, discount_type, discount_value)
          `
        )
        .neq("promotion_id", null)
        .order("sale_date", { ascending: false });

      if (error) throw error;

      const mapped: PromotionReport[] = (data || []).map((sale: any) => {
        // Calcular o valor promocional correto, se possível:
        let pricePromo = sale.unit_price;
        if (sale.promotion?.discount_type === "percentage") {
          pricePromo = sale.unit_price * (1 - (sale.promotion.discount_value / 100));
        } else if (sale.promotion?.discount_type === "fixed_amount") {
          pricePromo = Math.max(0, sale.unit_price - sale.promotion.discount_value);
        }
        const total_saved = (sale.unit_price - pricePromo) * sale.quantity;

        return {
          sale_id: sale.id,
          product_name: sale.product?.name,
          promotion_name: sale.promotion?.name,
          discount_type: sale.promotion?.discount_type,
          discount_value: sale.promotion?.discount_value,
          unit_price: sale.unit_price,
          promotion_price: pricePromo,
          sale_date: sale.sale_date,
          quantity: sale.quantity,
          total_saved,
        };
      });

      setPromotionSales(mapped);
    } catch (err: any) {
      toast({ title: "Erro ao buscar vendas promocionais", description: err.message, variant: "destructive" });
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportReportsToExcel();
      toast({
        title: 'Sucesso',
        description: 'Relatório exportado com sucesso!'
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar relatório',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                <p className="text-gray-600">Livraria Imaculada Conceição</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleExport} 
                disabled={exporting}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar Excel'}
              </Button>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">Carregando relatórios...</div>
        ) : (
          <>
            {/* Cards de métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-lg">Vendas Totais</CardTitle>
                      <CardDescription className="text-sm">
                        Receita total
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    R$ {reportData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-slate-500">
                    {reportData.totalSales} vendas realizadas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-lg">Ticket Médio</CardTitle>
                      <CardDescription className="text-sm">
                        Valor médio por venda
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    R$ {reportData.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-slate-500">
                    {reportData.totalSales > 0 ? 'Baseado em vendas ativas' : 'Sem dados suficientes'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-lg">Valor do Estoque</CardTitle>
                      <CardDescription className="text-sm">
                        Valor total em estoque
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    R$ {reportData.stockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-slate-500">
                    {reportData.totalProducts} produtos em estoque
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-lg">Estoque Baixo</CardTitle>
                      <CardDescription className="text-sm">
                        Produtos com estoque mínimo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {reportData.lowStockCount}
                  </div>
                  <p className="text-sm text-slate-500">
                    {reportData.lowStockCount === 0 ? 'Estoque normal' : 'Requer atenção'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ProductSalesChart />
              <PaymentMethodChart />
            </div>

            {/* Resumo Geral */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-800">Resumo Geral</CardTitle>
                    <CardDescription>
                      Visão geral dos dados do sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Total de Produtos</h4>
                    <p className="text-2xl font-bold text-slate-900">{reportData.totalProducts}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Vendas Realizadas</h4>
                    <p className="text-2xl font-bold text-green-600">{reportData.totalSales}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Produtos em Estoque</h4>
                    <p className="text-2xl font-bold text-blue-600">{reportData.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Relatório de Vendas Promocionais */}
            <Card className="bg-white border-slate-200 shadow-sm mt-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Percent className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-800">Relatório de Vendas Promocionais</CardTitle>
                    <CardDescription>
                      Detalhe das vendas realizadas com descontos promocionais.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {promotionSales.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    Nenhuma venda promocional registrada até agora.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-xs lg:text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700">
                          <th className="px-2 py-2 text-left">Data</th>
                          <th className="px-2 py-2 text-left">Produto</th>
                          <th className="px-2 py-2 text-left">Promoção</th>
                          <th className="px-2 py-2 text-left">Preço Original</th>
                          <th className="px-2 py-2 text-left">Preço Promo</th>
                          <th className="px-2 py-2 text-left">Qtd</th>
                          <th className="px-2 py-2 text-left">Total Economizado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promotionSales.map((item) => (
                          <tr key={item.sale_id} className="border-b">
                            <td className="px-2 py-2">{new Date(item.sale_date).toLocaleDateString('pt-BR')}</td>
                            <td className="px-2 py-2">{item.product_name}</td>
                            <td className="px-2 py-2">{item.promotion_name}</td>
                            <td className="px-2 py-2">R$ {item.unit_price.toFixed(2)}</td>
                            <td className="px-2 py-2">R$ {item.promotion_price.toFixed(2)}</td>
                            <td className="px-2 py-2">{item.quantity}</td>
                            <td className="px-2 py-2 text-green-700 font-medium">
                              R$ {item.total_saved.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3 text-right text-sm">
                      <b>Total economizado:</b>{" "}
                      R$ {promotionSales.reduce((acc, p) => acc + p.total_saved, 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
