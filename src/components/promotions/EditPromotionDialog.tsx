
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface Product {
  id: string;
  name: string;
  product_code: string;
}

interface Promotion {
  id: string;
  name: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const EditPromotionDialog = ({ 
  promotion, 
  onPromotionUpdated 
}: { 
  promotion: Promotion;
  onPromotionUpdated: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: promotion.name,
    description: promotion.description || "",
    discount_type: promotion.discount_type,
    discount_value: promotion.discount_value.toString(),
    start_date: promotion.start_date.split('T')[0],
    end_date: promotion.end_date.split('T')[0]
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
      fetchPromotionProducts();
    }
  }, [open, promotion.id]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("id, name, product_code").order("name");
    if (!error) setProducts(data || []);
  };

  const fetchPromotionProducts = async () => {
    const { data, error } = await supabase
      .from("product_promotions")
      .select("product_id")
      .eq("promotion_id", promotion.id);
    
    if (!error && data) {
      setSelectedProducts(data.map(item => item.product_id));
    }
  };

  const handleCheckbox = (id: string) => {
    setSelectedProducts((old) =>
      old.includes(id) ? old.filter((p) => p !== id) : [...old, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Atualizar promoção
      const { error: promoError } = await supabase
        .from("promotions")
        .update({
          name: form.name,
          description: form.description || null,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          start_date: form.start_date,
          end_date: form.end_date,
        })
        .eq("id", promotion.id);

      if (promoError) throw promoError;

      // 2. Remover associações antigas
      await supabase.from("product_promotions").delete().eq("promotion_id", promotion.id);

      // 3. Adicionar novas associações
      for (const pid of selectedProducts) {
        await supabase.from("product_promotions").insert({
          product_id: pid,
          promotion_id: promotion.id
        });
      }

      toast({ title: "Promoção atualizada!", description: "Alterações salvas com sucesso." });

      setOpen(false);
      onPromotionUpdated();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Promoção</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Nome da Promoção</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Tipo de Desconto</Label>
              <Select
                value={form.discount_type}
                onValueChange={v => setForm({ ...form, discount_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed_amount">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>
                Valor do Desconto {form.discount_type === "percentage" ? "(%)" : "(R$)"}
              </Label>
              <Input
                type="number"
                min="0.01"
                step={form.discount_type === "percentage" ? "0.01" : "0.01"}
                max={form.discount_type === "percentage" ? "100" : undefined}
                value={form.discount_value}
                onChange={e => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === "percentage" ? "Ex: 10" : "Ex: 50.00"}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Data de Início</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
            </div>
            <div className="flex-1">
              <Label>Data de Fim</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label>Produtos em Promoção</Label>
            <div className="max-h-40 overflow-auto border rounded p-2">
              {products.map(prod => (
                <label key={prod.id} className="flex items-center w-full py-1">
                  <Checkbox
                    checked={selectedProducts.includes(prod.id)}
                    onCheckedChange={() => handleCheckbox(prod.id)}
                  />
                  <span className="ml-2">{prod.product_code} - {prod.name}</span>
                </label>
              ))}
              {products.length === 0 && <span className="text-xs text-gray-500">Nenhum produto cadastrado</span>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar Alterações"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
