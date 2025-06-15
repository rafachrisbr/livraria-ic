
import { Calendar } from 'lucide-react';

export const WelcomeSection = () => {
  return (
    <div className="mb-10">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-3">
            Bem-vindo ao Sistema Administrativo
          </h2>
          <p className="text-blue-100 text-lg">
            Gerencie produtos, vendas e relatórios da Livraria Imaculada Conceição
          </p>
          <div className="flex items-center mt-4 space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm text-blue-100">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
