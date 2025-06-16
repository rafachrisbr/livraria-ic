
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog';
import { EnvironmentToggle } from '@/components/environment/EnvironmentToggle';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
}

export const MobileHeader = ({ title, subtitle }: MobileHeaderProps) => {
  const { user, signOut } = useAuth();
  const { isTestMode } = useEnvironment();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className={`shadow-sm border-b border-slate-200 ${isTestMode ? 'bg-orange-50' : 'bg-white'}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {isTestMode && (
                <span className="px-1.5 py-0.5 text-xs font-semibold bg-orange-200 text-orange-800 rounded">
                  TESTE
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm text-gray-600">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <EnvironmentToggle />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <ChangePasswordDialog />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
