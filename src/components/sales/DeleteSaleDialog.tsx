
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface DeleteSaleDialogProps {
  saleId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  onSaleDeleted: () => void;
}

export const DeleteSaleDialog = ({ saleId, productName, quantity, totalPrice, onSaleDeleted }: DeleteSaleDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      // Log da auditoria antes de excluir
      await supabase.rpc('log_audit_action', {
        p_action_type: 'DELETE',
        p_table_name: 'sales',
        p_record_id: saleId,
        p_details: {
          product_name: productName,
          quantity: quantity,
          total_price: totalPrice
        }
      });

      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (error) {
        console.error('Error deleting sale:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao excluir venda. Tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Venda excluída com sucesso!',
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
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a venda de {quantity}x {productName} (R$ {totalPrice.toFixed(2)})? 
            Esta ação não pode ser desfeita.
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
