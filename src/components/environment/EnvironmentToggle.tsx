
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const EnvironmentToggle = () => {
  const { environment, setEnvironment, isTestMode } = useEnvironment();
  const { user } = useAuth();
  const { toast } = useToast();

  // Verificar se o usuário é o Rafael
  const isRafael = user?.email === 'rafael.christiano@yahoo.com.br';

  // Se não for o Rafael, não mostrar o toggle
  if (!isRafael) {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    const newEnv = checked ? 'test' : 'production';
    setEnvironment(newEnv);
    
    toast({
      title: `Ambiente alterado para ${newEnv === 'test' ? 'Teste' : 'Produção'}`,
      description: newEnv === 'test' 
        ? 'Agora você está no ambiente de teste'
        : 'Agora você está no ambiente de produção',
    });

    // Recarregar a página para garantir que todos os dados sejam atualizados
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

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
