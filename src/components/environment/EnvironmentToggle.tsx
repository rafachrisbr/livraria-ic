
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const EnvironmentToggle = () => {
  const { environment, setEnvironment, isTestMode } = useEnvironment();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Verificar se o usuário é o Rafael
  const isRafael = user?.email === 'rafael.christiano@yahoo.com.br';

  // Se não for o Rafael, não mostrar o toggle
  if (!isRafael) {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    const newEnv = checked ? 'test' : 'production';
    setIsChanging(true);
    setEnvironment(newEnv);
    
    toast({
      title: `Alterando para ${newEnv === 'test' ? 'Teste' : 'Produção'}`,
      description: 'A página será recarregada em instantes para aplicar as mudanças...',
    });

    // Iniciar countdown visual
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (isChanging) {
    return (
      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm text-blue-700 font-medium">
          Alterando ambiente...
        </span>
        {countdown > 0 && (
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {countdown}s
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="environment-toggle" className="text-sm font-medium">
        {isTestMode ? '🧪 Teste' : '🏭 Produção'}
      </Label>
      <Switch
        id="environment-toggle"
        checked={isTestMode}
        onCheckedChange={handleToggle}
      />
      {isTestMode && (
        <span className="text-xs text-orange-600 font-medium">
          TESTE
        </span>
      )}
    </div>
  );
};
