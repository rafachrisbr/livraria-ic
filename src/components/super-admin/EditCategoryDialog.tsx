
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface EditCategoryDialogProps {
  category: Category;
  onEdit: (categoryId: string, name: string, description?: string) => Promise<boolean>;
  loading: boolean;
}

export const EditCategoryDialog = ({ category, onEdit, loading }: EditCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: category.name,
    description: category.description || ''
  });

  const handleEdit = async () => {
    if (editData.name.trim()) {
      const success = await onEdit(
        category.id,
        editData.name.trim(),
        editData.description.trim() || undefined
      );
      if (success) {
        setOpen(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Modifique os dados da categoria "{category.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category-name">Nome da Categoria</Label>
            <Input
              id="edit-category-name"
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da categoria"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category-description">Descrição (opcional)</Label>
            <Input
              id="edit-category-description"
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da categoria"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEdit}
            disabled={!editData.name.trim() || loading}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
