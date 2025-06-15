
import { Calendar } from 'lucide-react';

interface WelcomeSectionProps {
  userEmail?: string;
}

export const WelcomeSection = ({ userEmail }: WelcomeSectionProps) => {
  // Extract name from email (part before @)
  const userName = userEmail ? userEmail.split('@')[0] : 'Usuário';
  
  return (
    <div className="mb-10">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-3">
            Bem-vindo, {userName}
          </h2>
          <p className="text-slate-200 text-lg">
            Visão geral da livraria
          </p>
          <div className="flex items-center mt-4 space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm text-slate-200">
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
