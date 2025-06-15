
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, BarChart3, Users, TrendingDown, DollarSign } from 'lucide-react';

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card className="bg-white border-slate-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Produtos Cadastrados
          </CardTitle>
          <div className="p-2 bg-slate-100 rounded-lg">
            <Package className="h-4 w-4 text-slate-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">7</div>
          <p className="text-xs text-slate-500 flex items-center mt-1">
            <Package className="h-3 w-3 mr-1" />
            Livros e artigos religiosos
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-slate-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Vendas Hoje
          </CardTitle>
          <div className="p-2 bg-slate-100 rounded-lg">
            <ShoppingCart className="h-4 w-4 text-slate-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">0</div>
          <p className="text-xs text-slate-500 flex items-center mt-1">
            <DollarSign className="h-3 w-3 mr-1" />
            Nenhuma venda hoje
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Receita do Mês
          </CardTitle>
          <div className="p-2 bg-slate-100 rounded-lg">
            <BarChart3 className="h-4 w-4 text-slate-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">R$ 0,00</div>
          <p className="text-xs text-slate-500 flex items-center mt-1">
            <TrendingDown className="h-3 w-3 mr-1" />
            Vendas deste mês
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Administradores
          </CardTitle>
          <div className="p-2 bg-slate-100 rounded-lg">
            <Users className="h-4 w-4 text-slate-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">1</div>
          <p className="text-xs text-slate-500 flex items-center mt-1">
            <Users className="h-3 w-3 mr-1" />
            Usuários ativos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
