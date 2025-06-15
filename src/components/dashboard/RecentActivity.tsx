
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecentActivity {
  id: string;
  type: 'sale' | 'product';
  description: string;
  timestamp: string;
  amount?: number;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
    
    // Configurar escuta em tempo real para vendas
    const salesChannel = supabase
      .channel('sales-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' }, 
        () => fetchRecentActivity()
      )
      .subscribe();

    // Configurar escuta em tempo real para produtos
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => fetchRecentActivity()
      )
      .subscribe();

    return () => {
      salesChannel.unsubscribe();
      productsChannel.unsubscribe();
    };
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const activities: RecentActivity[] = [];

      // Buscar vendas recentes
      const { data: recentSales } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total_price,
          quantity,
          products:product_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar produtos recentes
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Adicionar vendas às atividades
      recentSales?.forEach(sale => {
        activities.push({
          id: sale.id,
          type: 'sale',
          description: `Venda de ${sale.quantity}x ${sale.products?.name} - R$ ${sale.total_price.toFixed(2)}`,
          timestamp: sale.created_at,
          amount: sale.total_price
        });
      });

      // Adicionar produtos às atividades
      recentProducts?.forEach(product => {
        activities.push({
          id: product.id,
          type: 'product',
          description: `Produto cadastrado: ${product.name}`,
          timestamp: product.created_at
        });
      });

      // Ordenar por timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas movimentações no sistema
                </CardDescription>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">Carregando atividades...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Atividade Recente</CardTitle>
              <CardDescription>
                Últimas movimentações no sistema
              </CardDescription>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma atividade recente
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                As vendas e alterações aparecerão aqui para facilitar o acompanhamento
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'sale' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'sale' ? (
                      <ShoppingCart className="h-4 w-4" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
