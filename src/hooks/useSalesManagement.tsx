
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

export const useSalesManagement = () => {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const deleteAllSales = async () => {
    try {
      setLoading(true);
      console.log('Deleting all sales...');
      
      const { data, error } = await supabase.rpc('delete_all_sales');
      
      if (error) {
        console.error('Error deleting all sales:', error);
        throw error;
      }
      
      toast({
        title: "Vendas deletadas",
        description: `${data || 0} vendas foram removidas e o estoque foi restaurado`,
      });
      
      return data || 0;
    } catch (error: any) {
      console.error('Error in deleteAllSales:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar vendas",
        variant: "destructive",
      });
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = async (saleId: string) => {
    try {
      setLoading(true);
      console.log('Deleting sale:', saleId);
      
      // Primeiro, buscar informações da venda para restaurar estoque
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('product_id, quantity')
        .eq('id', saleId)
        .single();

      if (saleError) {
        console.error('Error fetching sale:', saleError);
        throw saleError;
      }

      // Restaurar estoque manualmente
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', sale.product_id)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        throw productError;
      }

      const { error: stockError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: product.stock_quantity + sale.quantity
        })
        .eq('id', sale.product_id);

      if (stockError) {
        console.error('Error updating stock:', stockError);
        throw stockError;
      }

      // Deletar a venda
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (deleteError) {
        console.error('Error deleting sale:', deleteError);
        throw deleteError;
      }

      toast({
        title: "Venda deletada",
        description: "A venda foi removida e o estoque foi restaurado",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error in deleteSale:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar venda",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteAllSales,
    deleteSale,
  };
};
