
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const useCategoryManagement = () => {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching all categories...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Categories fetched successfully:', data?.length || 0);
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error in fetchAllCategories:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      console.log('Deleting category:', categoryId);
      
      const { data, error } = await supabase.rpc('delete_category_by_id', {
        category_id_to_delete: categoryId
      });
      
      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
      
      toast({
        title: "Categoria deletada",
        description: "A categoria foi removida com sucesso",
      });
      
      await fetchAllCategories();
      return true;
    } catch (error: any) {
      console.error('Error in deleteCategory:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar categoria",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, description?: string) => {
    try {
      setLoading(true);
      console.log('Creating category:', name);
      
      const { error } = await supabase
        .from('categories')
        .insert({ name, description });
      
      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }
      
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso",
      });
      
      await fetchAllCategories();
      return true;
    } catch (error: any) {
      console.error('Error in createCategory:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar categoria",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    fetchAllCategories,
    deleteCategory,
    createCategory,
  };
};
