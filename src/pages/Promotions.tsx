
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddPromotionDialog } from "@/components/promotions/AddPromotionDialog";
import { EditPromotionDialog } from "@/components/promotions/EditPromotionDialog";
import { DeletePromotionDialog } from "@/components/promotions/DeletePromotionDialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Tag, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

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
  const isMobile = useIsMobile();

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

  const isPromotionActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const getDiscountText = (type: string, value: number) => {
    return type === "percentage" ? `${value}%` : `R$ ${value.toFixed(2)}`;
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader title="Promoções" />
        
        <main className="px-4 py-6 pb-20">
          <div className="mb-6">
            <AddPromotionDialog onPromotionAdded={fetchPromotions} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Promoções Cadastradas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-6 text-center">Carregando promoções...</div>
              ) : promotions.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Nenhuma promoção encontrada.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {promotions.map((promo) => {
                    const isActive = isPromotionActive(promo.start_date, promo.end_date);
                    return (
                      <div key={promo.id} className="border rounded-md p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-slate-900">{promo.name}</span>
                              <Badge className={
                                promo.is_active && isActive 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-slate-200 text-slate-700"
                              }>
                                {promo.is_active && isActive ? "Ativa" : "Inativa"}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-red-600 mb-1">
                              {getDiscountText(promo.discount_type, promo.discount_value)} de desconto
                            </div>
                            <div className="text-sm text-slate-700 mb-2">{promo.description}</div>
                            <div className="text-xs text-gray-500 flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(promo.start_date).toLocaleDateString("pt-BR")} até {new Date(promo.end_date).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <EditPromotionDialog promotion={promo} onPromotionUpdated={fetchPromotions} />
                          <DeletePromotionDialog promotion={promo} onPromotionDeleted={fetchPromotions} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Desktop */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Promoções</h1>
                <p className="text-sm text-gray-500">Gerencie suas promoções e descontos</p>
              </div>
            </div>
            <AddPromotionDialog onPromotionAdded={fetchPromotions} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              <span>Promoções Cadastradas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center">Carregando promoções...</div>
            ) : promotions.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <Tag className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma promoção encontrada</h3>
                <p className="text-gray-500 mb-4">Crie sua primeira promoção para atrair mais clientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {promotions.map((promo) => {
                  const isActive = isPromotionActive(promo.start_date, promo.end_date);
                  return (
                    <div key={promo.id} className="border rounded-md p-6 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-lg font-semibold text-slate-900">{promo.name}</span>
                            <Badge className={
                              promo.is_active && isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-slate-200 text-slate-700"
                            }>
                              {promo.is_active && isActive ? "Ativa" : "Inativa"}
                            </Badge>
                          </div>
                          
                          <div className="text-xl font-bold text-red-600 mb-2">
                            {getDiscountText(promo.discount_type, promo.discount_value)} de desconto
                          </div>
                          
                          {promo.description && (
                            <div className="text-sm text-slate-700 mb-3">{promo.description}</div>
                          )}
                          
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Válida de {new Date(promo.start_date).toLocaleDateString("pt-BR")} até {new Date(promo.end_date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <EditPromotionDialog promotion={promo} onPromotionUpdated={fetchPromotions} />
                          <DeletePromotionDialog promotion={promo} onPromotionDeleted={fetchPromotions} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            Sistema de Gestão - Promoções
          </div>
        </div>
      </footer>
    </div>
  );
}
