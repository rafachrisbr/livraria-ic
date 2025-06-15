
import { Button } from '@/components/ui/button';
import { Heart, Bell, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  userEmail?: string;
  onLogout: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onLogout }: DashboardHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-xl border-b border-blue-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Heart className="h-10 w-10 text-blue-600 drop-shadow-sm" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                Livraria Imaculada Conceição
              </h1>
              <p className="text-blue-600/80 font-medium">
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
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                Administrador
              </p>
            </div>
            <Button 
              onClick={onLogout} 
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all"
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
