
import { Home, Package, ShoppingCart, Tag, FileText, Shield, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Verificar se é o Rafael para mostrar Super Admin
  const isRafael = user?.email === 'rafael.christiano@yahoo.com.br';

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
    },
    {
      icon: ShoppingCart,
      label: 'Vendas',
      path: '/sales',
    },
    {
      icon: Package,
      label: 'Produtos',
      path: '/products',
    },
    {
      icon: Tag,
      label: 'Promoções',
      path: '/promotions',
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      path: '/reports',
    },
    {
      icon: FileText,
      label: 'Auditoria',
      path: '/audit',
    },
    ...(isRafael ? [{
      icon: Shield,
      label: 'Super Admin',
      path: '/super-admin',
    }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] leading-tight text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
