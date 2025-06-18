
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/hooks/useSupabase";
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
  const supabase = useSupabase();
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
  }, [open, supabase]);

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Promoção</DialogTitle>
          <DialogDescription>
            Defina os detalhes da promoção e selecione os produtos que participarão.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Nome da Promoção</Label>
            <Input 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="Ex: Black Friday, Liquidação de Verão"
              required 
            />
          </div>
          <div>
            <Label>Descrição (opcional)</Label>
            <Input 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Descrição da promoção"
            />
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
                placeholder={form.discount_type === "percentage" ? "Ex: 10 (para 10%)" : "Ex: 50.00"}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.discount_type === "percentage" 
                  ? "Digite o percentual de desconto (ex: 10 para 10%)"
                  : "Digite o valor em reais que será descontado"
                }
              </p>
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
            <p className="text-xs text-gray-500 mb-2">Selecione os produtos que participarão desta promoção</p>
            <div className="max-h-40 overflow-auto border rounded p-2">
              {products.map(prod => (
                <label key={prod.id} className="flex items-center w-full py-1 hover:bg-gray-50 rounded">
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
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Criar Promoção"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
