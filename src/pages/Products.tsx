
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Products = () => {
  const { user, signOut } = useAuth();

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
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
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
        <div className="mb-6">
          <Button className="bg-slate-800 hover:bg-slate-900 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Package className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-slate-800">Lista de Produtos</CardTitle>
                <CardDescription>
                  Gerencie livros e artigos religiosos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-4">
                Comece adicionando livros e artigos religiosos ao seu estoque
              </p>
              <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Products;
