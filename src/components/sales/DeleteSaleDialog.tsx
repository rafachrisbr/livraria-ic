import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface DeleteSaleDialogProps {
  saleId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  onSaleDeleted: () => void;
}

export const DeleteSaleDialog = ({
  saleId,
  productName,
  quantity,
  totalPrice,
  onSaleDeleted,
}: DeleteSaleDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = useSupabase();

  const handleDelete = async () => {
    setLoading(true);
    try {
      console.log('Iniciando exclusão da venda:', saleId);

      // Buscar dados da venda para recuperar product_id e quantity
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select('product_id, quantity')
        .eq('id', saleId)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao buscar venda:', fetchError);
        toast({
          title: 'Erro',
          description: 'Não foi possível encontrar a venda para excluir.',
          variant: 'destructive',
        });
        return;
      }

      if (!sale) {
        console.error('Venda não encontrada');
        toast({
          title: 'Erro',
          description: 'Venda não encontrada.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Dados da venda encontrados:', sale);

      // Buscar estoque atual do produto ANTES de excluir
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', sale.product_id)
        .maybeSingle();

      if (productError || !product) {
        console.error('Erro ao buscar produto:', productError);
        toast({
          title: 'Erro',
          description: 'Não foi possível encontrar o produto para atualizar estoque.',
          variant: 'destructive',
        });
        return;
      }

      // Calcular novo estoque
      const updatedQty = Number(product.stock_quantity) + Number(sale.quantity);
      
      console.log('Preparando para restaurar estoque:', {
        produtoId: sale.product_id,
        estoqueAtual: product.stock_quantity,
        quantidadeRestaurada: sale.quantity,
        novoEstoque: updatedQty
      });

      // Log manual da auditoria antes de excluir
      const { error: auditError } = await supabase.from('audit_logs').insert({
        action_type: 'DELETE',
        table_name: 'sales',
        record_id: saleId,
        details: {
          product_name: productName,
          quantity: sale.quantity,
          total_price: totalPrice,
        },
        user_id: (await supabase.auth.getUser()).data.user?.id || ''
      });

      if (auditError) {
        console.warn('Erro ao criar log de auditoria:', auditError);
      }

      // Usar uma transação simulada: primeiro atualizar estoque, depois excluir venda
      const { error: updateStockError } = await supabase
        .from('products')
        .update({ stock_quantity: updatedQty })
        .eq('id', sale.product_id);

      if (updateStockError) {
        console.error('Erro ao atualizar estoque:', updateStockError);
        toast({
          title: 'Erro',
          description: 'Erro ao restaurar estoque. Operação cancelada.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Estoque restaurado, procedendo com exclusão da venda...');

      // Agora excluir a venda
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (deleteError) {
        console.error('Erro ao excluir venda:', deleteError);
        
        // Reverter a atualização do estoque
        await supabase
          .from('products')
          .update({ stock_quantity: product.stock_quantity })
          .eq('id', sale.product_id);
        
        toast({
          title: 'Erro',
          description: 'Erro ao excluir venda. Estoque foi revertido.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Venda excluída com sucesso');

      toast({
        title: 'Sucesso',
        description: 'Venda excluída e estoque restaurado com sucesso!',
      });

      // Aguardar um momento antes de notificar para evitar race conditions
      setTimeout(() => {
        onSaleDeleted();
      }, 500);

    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao excluir venda.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a venda de {quantity}x {productName} (R$ {totalPrice.toFixed(2)})?
            O estoque será restaurado automaticamente. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
