
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, BarChart3, Shield, Plus, Tag, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Package className="h-5 w-5" />
            <span>Produtos</span>
          </CardTitle>
          <CardDescription className="text-blue-600">
            Gerencie seu catálogo de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/products">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Gerenciar Produtos
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <ShoppingCart className="h-5 w-5" />
            <span>Vendas</span>
          </CardTitle>
          <CardDescription className="text-green-600">
            Registre e acompanhe suas vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/sales">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <Tag className="h-5 w-5" />
            <span>Promoções</span>
          </CardTitle>
          <CardDescription className="text-red-600">
            Crie e gerencie promoções
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/promotions">
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Promoção
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-800">
            <BarChart3 className="h-5 w-5" />
            <span>Relatórios</span>
          </CardTitle>
          <CardDescription className="text-purple-600">
            Visualize dados e relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/reports">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Ver Relatórios
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <Shield className="h-5 w-5" />
            <span>Auditoria</span>
          </CardTitle>
          <CardDescription className="text-orange-600">
            Controle e logs do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/audit">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              Ver Auditoria
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
