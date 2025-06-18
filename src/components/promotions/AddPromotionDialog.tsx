
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/hooks/useSupabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

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
  const [loadingProducts, setLoadingProducts] = useState(false);
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
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, product_code")
        .order("name");
      
      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar a lista de produtos.",
          variant: "destructive",
        });
        return;
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Erro inesperado ao carregar produtos.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCheckbox = (id: string) => {
    setSelectedProducts((old) =>
      old.includes(id) ? old.filter((p) => p !== id) : [...old, id]
    );
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da promoção.",
        variant: "destructive",
      });
      return false;
    }

    if (!form.discount_value || Number(form.discount_value) <= 0) {
      toast({
        title: "Valor de desconto inválido",
        description: "Por favor, informe um valor de desconto válido.",
        variant: "destructive",
      });
      return false;
    }

    if (form.discount_type === "percentage" && Number(form.discount_value) > 100) {
      toast({
        title: "Percentual inválido",
        description: "O percentual de desconto não pode ser maior que 100%.",
        variant: "destructive",
      });
      return false;
    }

    if (!form.start_date || !form.end_date) {
      toast({
        title: "Datas obrigatórias",
        description: "Por favor, informe as datas de início e fim da promoção.",
        variant: "destructive",
      });
      return false;
    }

    if (new Date(form.start_date) >= new Date(form.end_date)) {
      toast({
        title: "Datas inválidas",
        description: "A data de início deve ser anterior à data de fim.",
        variant: "destructive",
      });
      return false;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Produtos obrigatórios",
        description: "Selecione pelo menos um produto para a promoção.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // 1. Cadastrar promoção
      const { data: promotion, error: promoError } = await supabase
        .from("promotions")
        .insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          start_date: form.start_date,
          end_date: form.end_date,
          is_active: true,
        })
        .select()
        .single();

      if (promoError) {
        console.error('Error creating promotion:', promoError);
        throw new Error(promoError.message || "Erro ao criar promoção");
      }

      if (!promotion) {
        throw new Error("Promoção criada mas não foi possível recuperar os dados");
      }

      // 2. Associar produtos à promoção
      const productPromotions = selectedProducts.map(productId => ({
        product_id: productId,
        promotion_id: promotion.id
      }));

      const { error: productError } = await supabase
        .from("product_promotions")
        .insert(productPromotions);

      if (productError) {
        console.error('Error associating products:', productError);
        // Tentar reverter a criação da promoção
        await supabase.from("promotions").delete().eq("id", promotion.id);
        throw new Error("Erro ao associar produtos à promoção");
      }

      toast({ 
        title: "Promoção criada com sucesso!", 
        description: `Promoção "${form.name}" associada a ${selectedProducts.length} produto(s).` 
      });

      // Resetar formulário
      setForm({ 
        name: "", 
        description: "", 
        discount_type: "percentage", 
        discount_value: "", 
        start_date: "", 
        end_date: "" 
      });
      setSelectedProducts([]);
      setOpen(false);
      onPromotionAdded();
      
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      toast({ 
        title: "Erro ao criar promoção", 
        description: err.message || "Erro inesperado. Tente novamente.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ 
      name: "", 
      description: "", 
      discount_type: "percentage", 
      discount_value: "", 
      start_date: "", 
      end_date: "" 
    });
    setSelectedProducts([]);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 text-white hover:bg-slate-900">
          <Plus className="h-4 w-4 mr-2" />
          Nova Promoção
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Promoção</DialogTitle>
          <DialogDescription>
            Defina os detalhes da promoção e selecione os produtos que participarão.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="promo-name">Nome da Promoção *</Label>
            <Input 
              id="promo-name"
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="Ex: Black Friday, Liquidação de Verão"
              required 
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="promo-description">Descrição (opcional)</Label>
            <Input 
              id="promo-description"
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Descrição da promoção"
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Tipo de Desconto *</Label>
              <Select
                value={form.discount_type}
                onValueChange={v => setForm({ ...form, discount_type: v })}
                disabled={loading}
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
              <Label htmlFor="discount-value">
                Valor do Desconto * {form.discount_type === "percentage" ? "(%)" : "(R$)"}
              </Label>
              <Input
                id="discount-value"
                type="number"
                min="0.01"
                step={form.discount_type === "percentage" ? "0.01" : "0.01"}
                max={form.discount_type === "percentage" ? "100" : undefined}
                value={form.discount_value}
                onChange={e => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === "percentage" ? "Ex: 10 (para 10%)" : "Ex: 50.00"}
                required
                disabled={loading}
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
              <Label htmlFor="start-date">Data de Início *</Label>
              <Input 
                id="start-date"
                type="date" 
                value={form.start_date} 
                onChange={e => setForm({ ...form, start_date: e.target.value })} 
                required 
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">Data de Fim *</Label>
              <Input 
                id="end-date"
                type="date" 
                value={form.end_date} 
                onChange={e => setForm({ ...form, end_date: e.target.value })} 
                required 
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label>Produtos em Promoção *</Label>
            <p className="text-xs text-gray-500 mb-2">Selecione os produtos que participarão desta promoção</p>
            <div className="max-h-40 overflow-auto border rounded p-3 bg-gray-50">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-600">Carregando produtos...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-4">
                  <span className="text-sm text-gray-500">Nenhum produto cadastrado</span>
                </div>
              ) : (
                products.map(prod => (
                  <label 
                    key={prod.id} 
                    className="flex items-center w-full py-2 px-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedProducts.includes(prod.id)}
                      onCheckedChange={() => handleCheckbox(prod.id)}
                      disabled={loading}
                    />
                    <span className="ml-3 text-sm">{prod.product_code} - {prod.name}</span>
                  </label>
                ))
              )}
            </div>
            {selectedProducts.length > 0 && (
              <p className="text-xs text-green-600 mt-2">
                {selectedProducts.length} produto(s) selecionado(s)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedProducts.length === 0}
              className="bg-slate-800 hover:bg-slate-900"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                "Criar Promoção"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
