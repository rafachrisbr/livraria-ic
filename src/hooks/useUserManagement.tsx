
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

export const useUserManagement = () => {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching all users...');
      
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Users fetched successfully:', data?.length || 0);
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error in fetchAllUsers:', error);
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
      console.log('Deleting user:', userId);
      
      const { data, error } = await supabase.rpc('delete_user_by_id', {
        user_id_to_delete: userId
      });
      
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      
      toast({
        title: "Usuário deletado",
        description: "O usuário foi removido com sucesso do sistema",
      });
      
      await fetchAllUsers();
      return true;
    } catch (error: any) {
      console.error('Error in deleteUser:', error);
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

  const updateUserPassword = async (userId: string, newPassword: string) => {
    try {
      setLoading(true);
      console.log('Updating user password:', userId);
      
      // Como não podemos usar supabase.auth.admin, vamos simular por enquanto
      toast({
        title: "Funcionalidade indisponível",
        description: "A alteração de senha não está disponível no momento",
        variant: "destructive",
      });
      
      return false;
    } catch (error: any) {
      console.error('Error updating password:', error);
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
      console.log('Updating user email:', userId);
      
      // Como não podemos usar supabase.auth.admin, vamos simular por enquanto
      toast({
        title: "Funcionalidade indisponível",
        description: "A alteração de email não está disponível no momento",
        variant: "destructive",
      });
      
      return false;
    } catch (error: any) {
      console.error('Error updating email:', error);
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
    updateUserPassword,
    updateUserEmail,
  };
};
