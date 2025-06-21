
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface Promotion {
  id: string;
  name: string;
}

export const DeletePromotionDialog = ({ 
  promotion, 
  onPromotionDeleted 
}: { 
  promotion: Promotion;
  onPromotionDeleted: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      console.log('Iniciando exclusão da promoção:', promotion.id);

      // Primeiro, buscar dados da promoção que será deletada
      const { data: promotionData, error: promotionFetchError } = await supabase
        .from('promotions')
        .select('name, discount_type, discount_value')
        .eq('id', promotion.id)
        .single();

      if (promotionFetchError) {
        console.error('Erro ao buscar dados da promoção:', promotionFetchError);
        throw promotionFetchError;
      }

      console.log('Dados da promoção encontrados:', promotionData);

      // Atualizar vendas relacionadas com dados históricos da promoção ANTES de excluir
      const { error: salesUpdateError } = await supabase
        .from('sales')
        .update({ 
          promotion_name: promotionData.name,
          promotion_discount_type: promotionData.discount_type,
          promotion_discount_value: promotionData.discount_value
        })
        .eq('promotion_id', promotion.id)
        .is('promotion_name', null); // Só atualizar se ainda não tem dados históricos

      if (salesUpdateError) {
        console.error('Erro ao preservar dados históricos nas vendas:', salesUpdateError);
        toast({ 
          title: "Erro", 
          description: "Erro ao preservar dados históricos das vendas.", 
          variant: "destructive" 
        });
        return;
      }

      console.log('Dados históricos preservados nas vendas');

      // Remover associações produto-promoção
      const { error: ppError } = await supabase
        .from("product_promotions")
        .delete()
        .eq("promotion_id", promotion.id);

      if (ppError) {
        console.error('Erro ao remover associações produto-promoção:', ppError);
        toast({ 
          title: "Erro", 
          description: "Erro ao remover associações produto-promoção.", 
          variant: "destructive" 
        });
        return;
      }

      console.log('Associações produto-promoção removidas');
      
      // Finalmente, remover a promoção (promotion_id será definido como NULL automaticamente pela constraint)
      const { error: promotionError } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotion.id);

      if (promotionError) {
        console.error('Erro ao excluir promoção:', promotionError);
        throw promotionError;
      }

      console.log('Promoção excluída com sucesso');

      toast({ 
        title: "Promoção excluída!", 
        description: "A promoção foi removida com sucesso. O histórico de vendas promocionais foi preservado." 
      });

      setOpen(false);
      onPromotionDeleted();
    } catch (err: any) {
      console.error('Erro geral na exclusão:', err);
      toast({ 
        title: "Erro", 
        description: err.message || "Erro inesperado ao excluir promoção", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Promoção</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a promoção "{promotion.name}"? 
            O histórico de vendas promocionais será preservado automaticamente.
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
