
// Página de gerenciamento de promoções
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddPromotionDialog } from "@/components/promotions/AddPromotionDialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function fetchPromotions() {
    setLoading(true);
    const { data, error } = await supabase.from("promotions").select("*").order("start_date", { ascending: false });
    if (error) {
      toast({ title: "Erro", description: "Erro ao carregar promoções", variant: "destructive" });
    } else {
      setPromotions(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Promoções</h1>
          <AddPromotionDialog onPromotionAdded={fetchPromotions} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Promoções cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center">Carregando promoções...</div>
            ) : promotions.length === 0 ? (
              <div className="py-10 text-center text-slate-500">Nenhuma promoção encontrada.</div>
            ) : (
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="border rounded-md p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-900">{promo.name}</span>
                        <Badge className={
                          promo.is_active ? "bg-green-100 text-green-800 ml-4" : "bg-slate-200 text-slate-700 ml-4"
                        }>
                          {promo.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(promo.start_date).toLocaleDateString("pt-BR")} {"→"} {new Date(promo.end_date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div>
                      {promo.discount_type === "percentage"
                        ? `Desconto: ${promo.discount_value}%`
                        : `Desconto: R$ ${promo.discount_value.toFixed(2)}`}
                    </div>
                    <div className="text-sm text-slate-700">{promo.description}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
