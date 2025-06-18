
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useCategoryManagement } from "@/hooks/useCategoryManagement";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  product_code: string;
  category_id: string;
}

interface EditProductDialogProps {
  product: Product;
  onEdit: (productId: string, name: string, price: number, description?: string, productCode?: string, categoryId?: string) => Promise<boolean>;
  loading: boolean;
}

export const EditProductDialog = ({ product, onEdit, loading }: EditProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const { categories, fetchAllCategories } = useCategoryManagement();
  const [editData, setEditData] = useState({
    name: product.name,
    price: product.price.toString(),
    description: product.description || '',
    product_code: product.product_code,
    category_id: product.category_id
  });

  useEffect(() => {
    if (open && categories.length === 0) {
      fetchAllCategories();
    }
  }, [open, categories.length, fetchAllCategories]);

  const handleEdit = async () => {
    if (editData.name.trim() && editData.price && editData.product_code.trim()) {
      const success = await onEdit(
        product.id,
        editData.name.trim(),
        parseFloat(editData.price),
        editData.description.trim() || undefined,
        editData.product_code.trim(),
        editData.category_id
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Modifique os dados do produto "{product.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-product-name">Nome do Produto</Label>
            <Input
              id="edit-product-name"
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do produto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-product-price">Preço</Label>
            <Input
              id="edit-product-price"
              type="number"
              step="0.01"
              value={editData.price}
              onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-product-code">Código do Produto</Label>
            <Input
              id="edit-product-code"
              value={editData.product_code}
              onChange={(e) => setEditData(prev => ({ ...prev, product_code: e.target.value }))}
              placeholder="Código do produto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-product-category">Categoria</Label>
            <Select value={editData.category_id} onValueChange={(value) => setEditData(prev => ({ ...prev, category_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-product-description">Descrição (opcional)</Label>
            <Input
              id="edit-product-description"
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do produto"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEdit}
            disabled={!editData.name.trim() || !editData.price || !editData.product_code.trim() || loading}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
