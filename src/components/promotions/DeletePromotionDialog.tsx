
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
      // Remover associações primeiro
      await supabase.from("product_promotions").delete().eq("promotion_id", promotion.id);
      
      // Remover promoção
      const { error } = await supabase.from("promotions").delete().eq("id", promotion.id);

      if (error) throw error;

      toast({ title: "Promoção excluída!", description: "A promoção foi removida com sucesso." });

      setOpen(false);
      onPromotionDeleted();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
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
            Tem certeza que deseja excluir a promoção "{promotion.name}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
