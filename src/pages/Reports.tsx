
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reports = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-100">
      <header className="bg-white shadow-sm border-b">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-blue-50 shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-900 text-lg">Vendas Totais</CardTitle>
                  <CardDescription className="text-sm">
                    Receita total do período
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ 0,00</div>
              <p className="text-sm text-gray-500">Nenhuma venda registrada</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50 shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-900 text-lg">Produtos Vendidos</CardTitle>
                  <CardDescription className="text-sm">
                    Quantidade total vendida
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-sm text-gray-500">Nenhum produto vendido</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50 shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-purple-900 text-lg">Vendas Hoje</CardTitle>
                  <CardDescription className="text-sm">
                    Vendas realizadas hoje
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-500">Nenhuma venda hoje</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-white to-purple-50 shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-purple-900">Gráficos e Análises</CardTitle>
                <CardDescription>
                  Visualizações detalhadas das vendas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-purple-500" />
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
