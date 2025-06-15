
import { Button } from '@/components/ui/button';
import { Heart, Bell, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  userEmail?: string;
  onLogout: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onLogout }: DashboardHeaderProps) => {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Heart className="h-10 w-10 text-slate-700" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Livraria Imaculada Conceição
              </h1>
              <p className="text-slate-600 font-medium">
                Fraternidade Sacerdotal São Pio X
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {userEmail}
              </p>
              <p className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                Administrador
              </p>
            </div>
            <Button 
              onClick={onLogout} 
              variant="outline"
              size="sm"
              className="text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
