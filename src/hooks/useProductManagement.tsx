
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  product_code: string;
  description: string | null;
  created_at: string;
}

export const useProductManagement = () => {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching all products...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched successfully:', data?.length || 0);
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error in fetchAllProducts:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      console.log('Deleting product:', productId);
      
      const { data, error } = await supabase.rpc('delete_product_by_id', {
        product_id_to_delete: productId
      });
      
      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
      
      toast({
        title: "Produto deletado",
        description: "O produto e todas as vendas relacionadas foram removidos",
      });
      
      await fetchAllProducts();
      return true;
    } catch (error: any) {
      console.error('Error in deleteProduct:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar produto",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      setLoading(true);
      console.log('Updating product stock:', productId, newStock);
      
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId);
      
      if (error) {
        console.error('Error updating stock:', error);
        throw error;
      }
      
      toast({
        title: "Estoque atualizado",
        description: "O estoque do produto foi atualizado com sucesso",
      });
      
      await fetchAllProducts();
      return true;
    } catch (error: any) {
      console.error('Error in updateProductStock:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar estoque",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    productId: string, 
    name: string, 
    price: number, 
    description?: string, 
    productCode?: string, 
    categoryId?: string
  ) => {
    try {
      setLoading(true);
      console.log('Updating product:', productId, name, price);
      
      const { data, error } = await supabase.rpc('update_product_by_id', {
        product_id_to_update: productId,
        new_name: name,
        new_price: price,
        new_description: description,
        new_product_code: productCode,
        new_category_id: categoryId
      });
      
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso",
      });
      
      await fetchAllProducts();
      return true;
    } catch (error: any) {
      console.error('Error in updateProduct:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar produto",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAllProducts = async () => {
    try {
      setLoading(true);
      console.log('Deleting all products...');
      
      const { data, error } = await supabase.rpc('delete_all_products');
      
      if (error) {
        console.error('Error deleting all products:', error);
        throw error;
      }
      
      const deletedCount = data || 0;
      
      toast({
        title: "Produtos deletados",
        description: `${deletedCount} produto(s) e vendas relacionadas foram removidos`,
      });
      
      await fetchAllProducts();
      return deletedCount;
    } catch (error: any) {
      console.error('Error in deleteAllProducts:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar todos os produtos",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    fetchAllProducts,
    deleteProduct,
    updateProductStock,
    updateProduct,
    deleteAllProducts,
  };
};
