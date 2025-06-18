
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen, Trash2, Plus, AlertCircle } from "lucide-react";
import { useCategoryManagement } from "@/hooks/useCategoryManagement";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const CategoryManagementCard = () => {
  const { categories, loading, fetchAllCategories, deleteCategory, createCategory } = useCategoryManagement();
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setError(null);
        await fetchAllCategories();
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Erro ao carregar categorias. Verifique as permissões.');
      }
    };

    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (newCategory.name.trim()) {
      const success = await createCategory(
        newCategory.name.trim(),
        newCategory.description.trim() || undefined
      );
      if (success) {
        setNewCategory({ name: '', description: '' });
        setShowCreateDialog(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-6 w-6" />
            <span>Erro no Gerenciamento de Categorias</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => {
              setError(null);
              fetchAllCategories();
            }} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <FolderOpen className="h-6 w-6" />
          <span>Gerenciamento de Categorias</span>
        </CardTitle>
        <CardDescription>
          Gerencie todas as categorias do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total de categorias: {categories.length}
          </span>
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Categoria</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova categoria para organizar os produtos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Nome da Categoria</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Livros, Artigos Religiosos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">Descrição (opcional)</Label>
                    <Input
                      id="category-description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da categoria"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateCategory}
                    disabled={!newCategory.name.trim() || loading}
                  >
                    Criar Categoria
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={fetchAllCategories} variant="outline" size="sm" disabled={loading}>
              {loading ? "Carregando..." : "Atualizar Lista"}
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {categories.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma categoria encontrada
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-600">
                      <div>Criado: {formatDate(category.created_at)}</div>
                      {category.description && (
                        <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar a categoria "{category.name}"? 
                          Só é possível deletar categorias que não possuem produtos associados.
                          Esta ação é irreversível.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCategory(category.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
