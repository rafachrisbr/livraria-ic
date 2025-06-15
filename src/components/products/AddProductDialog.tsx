
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    minimum_stock: '',
    product_code: '',
    category_id: '',
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar categorias',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
          minimum_stock: parseInt(formData.minimum_stock),
          product_code: formData.product_code,
          category_id: formData.category_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log da auditoria
      await supabase.rpc('log_audit_action', {
        p_action_type: 'CREATE',
        p_table_name: 'products',
        p_record_id: data.id,
        p_details: {
          name: formData.name,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity)
        }
      });

      toast({
        title: 'Sucesso',
        description: 'Produto cadastrado com sucesso!',
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        minimum_stock: '',
        product_code: '',
        category_id: '',
      });
      
      setOpen(false);
      onProductAdded();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao cadastrar produto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-slate-800 hover:bg-slate-900 text-white">
      <Plus className="h-4 w-4 mr-2" />
      Cadastrar Produto
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha as informações do produto abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Bíblia Sagrada"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_code">Código do Produto</Label>
            <Input
              id="product_code"
              value={formData.product_code}
              onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
              placeholder="Ex: BIB001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do produto (opcional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Estoque Inicial</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
            <Input
              id="minimum_stock"
              type="number"
              min="0"
              value={formData.minimum_stock}
              onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
              placeholder="5"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
