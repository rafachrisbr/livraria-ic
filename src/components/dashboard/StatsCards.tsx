
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, BarChart3, Users, TrendingUp, DollarSign } from 'lucide-react';

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-blue-900">
            Produtos Cadastrados
          </CardTitle>
          <div className="p-2 bg-blue-500 rounded-lg">
            <Package className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">7</div>
          <p className="text-xs text-blue-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Livros e artigos religiosos
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-green-900">
            Vendas Hoje
          </CardTitle>
          <div className="p-2 bg-green-500 rounded-lg">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">0</div>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <DollarSign className="h-3 w-3 mr-1" />
            Nenhuma venda hoje
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-purple-900">
            Receita do Mês
          </CardTitle>
          <div className="p-2 bg-purple-500 rounded-lg">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">R$ 0,00</div>
          <p className="text-xs text-purple-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Vendas deste mês
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-orange-900">
            Administradores
          </CardTitle>
          <div className="p-2 bg-orange-500 rounded-lg">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-900">1</div>
          <p className="text-xs text-orange-600 flex items-center mt-1">
            <Users className="h-3 w-3 mr-1" />
            Usuários ativos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
