
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Calendar, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reports = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Valores calculados baseados nos produtos do banco
  const stockValue = (45.00 * 25) + (35.00 * 3) + (68.00 * 15) + (15.00 * 30) + (8.00 * 50) + (25.00 * 2) + (12.00 * 5);
  const lowStockItems = 3; // Missal Dominical (3), Rosário Cristal (2)

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
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-800 text-lg">Vendas Totais</CardTitle>
                  <CardDescription className="text-sm">
                    Receita total do período
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">R$ 0,00</div>
              <p className="text-sm text-slate-500">Nenhuma venda registrada</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-slate-600" />
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
              <div className="text-2xl font-bold text-slate-800">R$ 0,00</div>
              <p className="text-sm text-slate-500">Sem dados suficientes</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
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
              <div className="text-2xl font-bold text-slate-800">R$ {stockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-sm text-slate-500">7 produtos em estoque</p>
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
                    Produtos com menos de 4 unidades
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
              <p className="text-sm text-slate-500">Requer atenção</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-slate-800">Gráficos e Análises</CardTitle>
                <CardDescription>
                  Visualizações detalhadas das vendas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dados insuficientes para relatórios
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Registre algumas vendas para visualizar gráficos e análises detalhadas
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
