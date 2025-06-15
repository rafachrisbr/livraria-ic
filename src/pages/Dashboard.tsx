
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Package, Calendar, LogOut, Search, Plus } from 'lucide-react';

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const statsCards = [
    {
      title: "Total de Produtos",
      value: "248",
      description: "Itens em estoque",
      icon: Package,
      color: "bg-blue-500"
    },
    {
      title: "Vendas do Mês",
      value: "R$ 4.829,00",
      description: "Faturamento de dezembro",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
      title: "Livros Cadastrados",
      value: "156",
      description: "Títulos disponíveis",
      icon: BookOpen,
      color: "bg-purple-500"
    },
    {
      title: "Artigos Religiosos",
      value: "92",
      description: "Diversos itens",
      icon: Search,
      color: "bg-amber-500"
    }
  ];

  const recentSales = [
    { item: "Bíblia Sagrada - Edição Popular", quantity: 2, value: "R$ 45,00", time: "14:32" },
    { item: "Terço de Madeira", quantity: 1, value: "R$ 15,00", time: "14:15" },
    { item: "Vida de Santos - Coleção", quantity: 1, value: "R$ 68,00", time: "13:45" },
    { item: "Escapulário do Carmo", quantity: 3, value: "R$ 24,00", time: "13:20" }
  ];

  const lowStockItems = [
    { name: "Missal Dominical", stock: 3, category: "Livros" },
    { name: "Rosário Cristal", stock: 2, category: "Artigos Religiosos" },
    { name: "Medalha São Bento", stock: 5, category: "Artigos Religiosos" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Livraria Imaculada Conceição</h1>
                <p className="text-xs text-blue-600">Sistema Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Administrador
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cadastrar Produtos</h3>
              <p className="text-sm text-gray-600">Adicionar novos livros e artigos religiosos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registrar Vendas</h3>
              <p className="text-sm text-gray-600">Lançar novas vendas e atualizar estoque</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h3>
              <p className="text-sm text-gray-600">Visualizar dados e gerar relatórios</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Vendas Recentes</CardTitle>
              <CardDescription>Últimas transações do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales.map((sale, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{sale.item}</p>
                      <p className="text-xs text-gray-500">Qty: {sale.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{sale.value}</p>
                      <p className="text-xs text-gray-500">{sale.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Estoque Baixo</CardTitle>
              <CardDescription>Itens que precisam de reposição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {item.stock} restantes
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
