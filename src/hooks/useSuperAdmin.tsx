
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

export const useSuperAdmin = () => {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('delete_user_by_id', {
        user_id_to_delete: userId
      });
      
      if (error) throw error;
      
      toast({
        title: "Usuário deletado",
        description: "O usuário foi removido com sucesso do sistema",
      });
      
      await fetchAllUsers(); // Recarregar lista
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar usuário",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAllSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('delete_all_sales');
      
      if (error) throw error;
      
      toast({
        title: "Vendas deletadas",
        description: `${data || 0} vendas foram removidas e o estoque foi restaurado`,
      });
      
      return data || 0;
    } catch (error: any) {
      console.error('Erro ao deletar vendas:', error);
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
      
      // Primeiro, buscar informações da venda para restaurar estoque
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('product_id, quantity')
        .eq('id', saleId)
        .single();

      if (saleError) throw saleError;

      // Restaurar estoque
      const { error: stockError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: supabase.raw('stock_quantity + ?', [sale.quantity])
        })
        .eq('id', sale.product_id);

      if (stockError) throw stockError;

      // Deletar a venda
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (deleteError) throw deleteError;

      toast({
        title: "Venda deletada",
        description: "A venda foi removida e o estoque foi restaurado",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar venda:', error);
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

  const updateUserPassword = async (userId: string, newPassword: string) => {
    try {
      setLoading(true);
      
      // Usar função admin do Supabase para alterar senha
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Senha alterada",
        description: "A senha do usuário foi atualizada com sucesso",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserEmail = async (userId: string, newEmail: string) => {
    try {
      setLoading(true);
      
      // Usar função admin do Supabase para alterar email
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        email: newEmail
      });
      
      if (error) throw error;
      
      toast({
        title: "Email alterado",
        description: "O email do usuário foi atualizado com sucesso",
      });
      
      await fetchAllUsers(); // Recarregar lista
      return true;
    } catch (error: any) {
      console.error('Erro ao alterar email:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar email",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    fetchAllUsers,
    deleteUser,
    deleteAllSales,
    deleteSale,
    updateUserPassword,
    updateUserEmail,
  };
};
