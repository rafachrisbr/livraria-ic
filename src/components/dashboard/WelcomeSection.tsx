
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen } from 'lucide-react';

export const WelcomeSection = () => {
  const { user } = useAuth();

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Administrador';
  };

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-xl border-0">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Bem-vindo, {getUserName()}!
              </h1>
              <p className="text-slate-100 text-sm sm:text-base">
                Sistema de Gestão da Livraria Imaculada Conceição
              </p>
              <p className="text-slate-200 text-xs sm:text-sm mt-1">
                Capela Imaculada Conceição - Indaiatuba, SP
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <BookOpen className="h-8 w-8" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-500/30">
            <p className="text-slate-100 text-xs text-center">
              "Sub tuum praesidium confugimus, Sancta Dei Genetrix"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
