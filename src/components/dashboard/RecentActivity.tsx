
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export const RecentActivity = () => {
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
        </CardContent>
      </Card>
    </div>
  );
};
