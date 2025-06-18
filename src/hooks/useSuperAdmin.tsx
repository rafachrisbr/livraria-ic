
import { useUserManagement } from './useUserManagement';
import { useSalesManagement } from './useSalesManagement';

// Hook legacy para compatibilidade - agora usa os hooks separados
export const useSuperAdmin = () => {
  const userManagement = useUserManagement();
  const salesManagement = useSalesManagement();

  return {
    ...userManagement,
    ...salesManagement,
  };
};
