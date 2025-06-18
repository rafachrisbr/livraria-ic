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

      // Buscar dados da venda para recuperar product_id e quantity realmente no banco
      const { data: sale, error: fetchError } = await supabase
        .from('sales')
        .select('product_id, quantity')
        .eq('id', saleId)
        .maybeSingle();

      if (fetchError || !sale) {
        console.error('Erro ao buscar venda:', fetchError);
        toast({
          title: 'Erro',
          description: 'Não foi possível encontrar a venda para excluir.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      console.log('Dados da venda encontrados:', sale);

      // Log manual da auditoria antes de excluir
      await supabase.from('audit_logs').insert({
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

      // Excluir a venda
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (deleteError) {
        console.error('Erro ao excluir venda:', deleteError);
        toast({
          title: 'Erro',
          description: 'Erro ao excluir venda. Tente novamente.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      console.log('Venda excluída, atualizando estoque...');

      // Buscar estoque atual do produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', sale.product_id)
        .maybeSingle();

      if (!productError && product) {
        const updatedQty = Number(product.stock_quantity) + Number(sale.quantity);
        
        console.log('Restaurando estoque:', {
          produtoId: sale.product_id,
          estoqueAtual: product.stock_quantity,
          quantidadeRestaurada: sale.quantity,
          novoEstoque: updatedQty
        });

        const { data: updateData, error: updateStockError } = await supabase
          .from('products')
          .update({ stock_quantity: updatedQty })
          .eq('id', sale.product_id)
          .select('stock_quantity');

        if (updateStockError) {
          console.error('Erro ao atualizar estoque:', updateStockError);
          toast({
            title: 'Erro',
            description:
              'Venda excluída, mas não foi possível atualizar o estoque do produto!',
            variant: 'destructive',
          });
          setLoading(false);
          onSaleDeleted();
          return;
        }

        console.log('Estoque restaurado com sucesso:', updateData);
      } else {
        console.error('Erro ao buscar produto:', productError);
        toast({
          title: 'Erro',
          description:
            'Venda excluída, mas não foi possível encontrar o produto para atualizar estoque!',
          variant: 'destructive',
        });
        setLoading(false);
        onSaleDeleted();
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Venda excluída e estoque restaurado!',
      });

      onSaleDeleted();
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
