
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-all">
              <Package className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-slate-800">Gerenciar Produtos</CardTitle>
              <CardDescription className="text-sm">
                Cadastre e gerencie livros e artigos religiosos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link to="/products">
            <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white">
              Acessar Produtos
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-all">
              <ShoppingCart className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-slate-800">Registrar Vendas</CardTitle>
              <CardDescription className="text-sm">
                Registre vendas e controle o estoque automaticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link to="/sales">
            <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white">
              Nova Venda
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-all">
              <BarChart3 className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-slate-800">Relatórios</CardTitle>
              <CardDescription className="text-sm">
                Visualize estatísticas de vendas e relatórios
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link to="/reports">
            <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white">
              Ver Relatórios
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
