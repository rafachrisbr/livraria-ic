
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  product_code: string;
}

export const AddPromotionDialog = ({ onPromotionAdded }: { onPromotionAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    if (open) fetchProducts();
  }, [open]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("id, name, product_code").order("name");
    if (!error) setProducts(data || []);
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
      // 1. Cadastrar promoção
      const { data: promotion, error: promoError } = await supabase
        .from("promotions")
        .insert({
          name: form.name,
          description: form.description || null,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          start_date: form.start_date,
          end_date: form.end_date,
          is_active: true,
        })
        .select()
        .single();

      if (promoError) throw promoError;

      // 2. Associar produtos
      for (const pid of selectedProducts) {
        await supabase.from("product_promotions").insert({
          product_id: pid,
          promotion_id: promotion.id
        });
      }

      toast({ title: "Promoção criada!", description: "Promoção associada aos produtos selecionados." });

      setForm({ name: "", description: "", discount_type: "percentage", discount_value: "", start_date: "", end_date: "" });
      setSelectedProducts([]);
      setOpen(false);
      onPromotionAdded();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Promoção
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Promoção</DialogTitle>
          <DialogDescription>
            Defina os detalhes da promoção e selecione os produtos.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Tipo de desconto</Label>
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
              <Label>Valor</Label>
              <Input
                type="number"
                min="0.01"
                value={form.discount_value}
                onChange={e => setForm({ ...form, discount_value: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Data início</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
            </div>
            <div className="flex-1">
              <Label>Data fim</Label>
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
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
