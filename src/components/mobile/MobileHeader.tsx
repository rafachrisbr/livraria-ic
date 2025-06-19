
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog';
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

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 safe-area-top">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img 
              src="https://cadastro.fsspx.com.br/wp-content/uploads/2023/04/fsspx-logo-novo-png-large-3.png" 
              alt="FSSPX Logo"
              className="h-6 w-auto object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = "https://static.wixstatic.com/media/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png/v1/fill/w_184,h_184,al_c,usm_0.66_1.00_0.01/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png";
              }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600 truncate">{subtitle}</p>}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px]">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm text-gray-600 truncate">
                {user?.email}
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
