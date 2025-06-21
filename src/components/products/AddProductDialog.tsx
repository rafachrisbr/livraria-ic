
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Category {
  id: string;
  name: string;
}

interface AddProductDialogProps {
  onProductAdded: () => void;
  trigger?: React.ReactNode;
}

export const AddProductDialog = ({ onProductAdded, trigger }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    minimum_stock: '',
    category_id: '',
    product_code: '',
    image_url: '',
  });

  const loadCategories = async () => {
    if (categoriesLoaded) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
      setCategoriesLoaded(true);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar categorias.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
          minimum_stock: parseInt(formData.minimum_stock),
          category_id: formData.category_id,
          product_code: formData.product_code,
          image_url: formData.image_url || null,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Produto adicionado com sucesso!',
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        minimum_stock: '',
        category_id: '',
        product_code: '',
        image_url: '',
      });
      setOpen(false);
      onProductAdded();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar produto.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-slate-800 hover:bg-slate-900 text-white">
      <Plus className="h-4 w-4 mr-2" />
      Adicionar Produto
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={loadCategories}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha as informações do produto que deseja adicionar ao estoque.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: A Imitação de Cristo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada do produto..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_code">Código do Produto *</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                placeholder="Ex: LIV001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              required
            >
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Quantidade em Estoque *</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="1"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                placeholder="5"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar Produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
