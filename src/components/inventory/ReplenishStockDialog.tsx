
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
}

interface ReplenishStockDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReplenishStockDialog = ({ product, open, onClose, onSuccess }: ReplenishStockDialogProps) => {
  const [movementType, setMovementType] = useState('entry');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  
  const supabase = useSupabase();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma quantidade válida maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    if (movementType === 'exit' && quantityNum > product.stock_quantity) {
      toast({
        title: 'Erro',
        description: 'Quantidade de saída não pode ser maior que o estoque atual.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('register_stock_movement', {
        p_product_id: product.id,
        p_movement_type: movementType,
        p_quantity: quantityNum,
        p_reason: reason || null
      });

      if (error) {
        console.error('Error registering stock movement:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao registrar movimentação de estoque.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: `${movementType === 'entry' ? 'Entrada' : 'Saída'} de estoque registrada com sucesso.`,
      });

      // Resetar formulário
      setQuantity('');
      setReason('');
      setMovementType('entry');
      
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao registrar movimentação.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity('');
    setReason('');
    setMovementType('entry');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Repor Estoque</DialogTitle>
          <DialogDescription>
            Faça o ajuste no estoque do livro selecionado
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-gray-600">Estoque atual: {product.stock_quantity} unidades</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="movementType">Tipos de Movimentação</Label>
                <Select value={movementType} onValueChange={setMovementType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entrada (Adicionar)</SelectItem>
                    <SelectItem value="exit">Saída (Remover)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Digite a quantidade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo (opcional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo da movimentação..."
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processando...' : 'Confirmar Reposição'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
