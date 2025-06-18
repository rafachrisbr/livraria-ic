
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
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch('/functions/v1/admin-update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          action: 'update_password',
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao alterar senha');
      }

      toast({
        title: "Senha alterada",
        description: "A senha do usuário foi alterada com sucesso",
      });
      
      return true;
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
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await fetch('/functions/v1/admin-update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          action: 'update_email',
          newEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao alterar email');
      }

      toast({
        title: "Email alterado",
        description: "O email do usuário foi alterado com sucesso",
      });
      
      await fetchAllUsers();
      return true;
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
