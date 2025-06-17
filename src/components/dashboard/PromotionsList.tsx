
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSupabase } from '@/hooks/useSupabase';

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const PromotionsList = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    fetchPromotions();
    
    // Configurar escuta em tempo real para promoções
    const channel = supabase
      .channel('promotions-list-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' }, 
        () => fetchPromotions()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching promotions:', error);
        return;
      }

      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiscountText = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `R$ ${value.toFixed(2)}`;
  };

  const isPromotionActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Promoções Ativas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando promoções...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Tag className="h-5 w-5" />
          <span>Promoções Ativas</span>
        </CardTitle>
        <CardDescription>
          Promoções em andamento e próximas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {promotions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma promoção ativa
            </h3>
            <p className="text-gray-500 mb-4">
              Crie promoções para atrair mais clientes
            </p>
            <Link to="/promotions">
              <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Criar Promoção
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {promotions.map((promotion) => {
              const isActive = isPromotionActive(promotion.start_date, promotion.end_date);
              return (
                <div key={promotion.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {isActive ? 'Ativa' : 'Agendada'}
                      </span>
                      <span className="font-medium">{promotion.name}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(promotion.start_date).toLocaleDateString('pt-BR')} - 
                        {new Date(promotion.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {getDiscountText(promotion.discount_type, promotion.discount_value)}
                    </div>
                    <div className="text-xs text-gray-500">
                      desconto
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t">
              <Link to="/promotions">
                <Button variant="outline" className="w-full">
                  Ver Todas as Promoções
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
