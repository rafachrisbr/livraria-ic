
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
      <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-blue-50 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-blue-900">Gerenciar Produtos</CardTitle>
              <CardDescription className="text-sm">
                Cadastre e gerencie livros e artigos religiosos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link to="/products">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              Acessar Produtos
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-green-50 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl group-hover:from-green-600 group-hover:to-green-700 transition-all">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-900">Registrar Vendas</CardTitle>
              <CardDescription className="text-sm">
                Registre vendas e controle o estoque automaticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link to="/sales">
            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
              Nova Venda
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-purple-50 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl group-hover:from-purple-600 group-hover:to-purple-700 transition-all">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-purple-900">Relatórios</CardTitle>
              <CardDescription className="text-sm">
                Visualize estatísticas de vendas e relatórios
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link to="/reports">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg">
              Ver Relatórios
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
