
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const EnvironmentToggle = () => {
  const { environment, setEnvironment, isTestMode } = useEnvironment();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEnvironment, setPendingEnvironment] = useState<'test' | 'production' | null>(null);

  // Verificar se o usuário é o Rafael
  const isRafael = user?.email === 'rafael.christiano@yahoo.com.br';

  // Se não for o Rafael, não mostrar o toggle
  if (!isRafael) {
    return null;
  }

  const handleToggleClick = (checked: boolean) => {
    const newEnv = checked ? 'test' : 'production';
    setPendingEnvironment(newEnv);
    setShowConfirmDialog(true);
  };

  const handleConfirmChange = () => {
    if (!pendingEnvironment) return;

    setShowConfirmDialog(false);
    setIsChanging(true);

    // Tentar preservar a sessão salvando dados relevantes no localStorage
    if (session) {
      localStorage.setItem('temp_session_backup', JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user_email: user?.email,
        expires_at: session.expires_at
      }));
    }

    setEnvironment(pendingEnvironment);
    
    toast({
      title: `Conectando ao ambiente ${pendingEnvironment === 'test' ? 'de Teste' : 'de Produção'}`,
      description: 'Mantendo sua sessão ativa durante a mudança...',
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

  const handleCancelChange = () => {
    setShowConfirmDialog(false);
    setPendingEnvironment(null);
  };

  if (isChanging) {
    return (
      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm text-blue-700 font-medium">
          Conectando ao ambiente {pendingEnvironment === 'test' ? 'de teste' : 'de produção'}...
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
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogTrigger asChild>
          <div>
            <Switch
              id="environment-toggle"
              checked={isTestMode}
              onCheckedChange={handleToggleClick}
            />
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Mudança de Ambiente</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a mudar para o ambiente {pendingEnvironment === 'test' ? 'de Teste' : 'de Produção'}.
              <br /><br />
              A página será recarregada para conectar ao banco de dados correto, mas sua sessão será mantida.
              <br /><br />
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChange}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange}>
              Sim, continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isTestMode && (
        <span className="text-xs text-orange-600 font-medium">
          TESTE
        </span>
      )}
    </div>
  );
};
