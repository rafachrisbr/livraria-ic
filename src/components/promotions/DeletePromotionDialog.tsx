
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

      // Primeiro, remover a referência da promoção nas vendas (setar promotion_id como NULL)
      const { error: salesUpdateError } = await supabase
        .from('sales')
        .update({ promotion_id: null })
        .eq('promotion_id', promotion.id);

      if (salesUpdateError) {
        console.error('Erro ao atualizar vendas:', salesUpdateError);
        toast({ 
          title: "Erro", 
          description: "Erro ao atualizar vendas relacionadas à promoção.", 
          variant: "destructive" 
        });
        return;
      }

      console.log('Referências da promoção removidas das vendas');

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
      
      // Finalmente, remover a promoção
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
        description: "A promoção foi removida com sucesso. As vendas feitas com esta promoção foram mantidas." 
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
            As vendas já realizadas com esta promoção serão mantidas, mas a referência à promoção será removida.
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
