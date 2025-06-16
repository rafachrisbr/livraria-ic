
import { useState } from 'react';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EnvironmentToggle = () => {
  const { environment, setEnvironment, isTestMode } = useEnvironment();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEnvironment, setPendingEnvironment] = useState<'production' | 'test'>('production');
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    const newEnv = checked ? 'test' : 'production';
    setPendingEnvironment(newEnv);
    setShowConfirmDialog(true);
  };

  const confirmChange = () => {
    setEnvironment(pendingEnvironment);
    setShowConfirmDialog(false);
    
    toast({
      title: `Ambiente alterado para ${pendingEnvironment === 'test' ? 'TESTE' : 'PRODUÇÃO'}`,
      description: `Agora você está trabalhando no ambiente de ${pendingEnvironment === 'test' ? 'teste' : 'produção'}.`,
      duration: 3000,
    });
  };

  return (
    <>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Prod</span>
          <Switch
            checked={isTestMode}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-orange-500"
          />
          <span className="text-sm text-gray-600">Teste</span>
        </div>
        
        {isTestMode && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            TESTE
          </Badge>
        )}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirmar Mudança de Ambiente
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Você está prestes a alterar para o ambiente de{' '}
                <strong>{pendingEnvironment === 'test' ? 'TESTE' : 'PRODUÇÃO'}</strong>.
              </p>
              {pendingEnvironment === 'test' ? (
                <p className="text-orange-600 font-medium">
                  No ambiente de teste, todas as operações serão realizadas em um banco de dados separado.
                </p>
              ) : (
                <p className="text-red-600 font-medium">
                  No ambiente de produção, todas as operações afetarão os dados reais da livraria.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmChange}
              className={pendingEnvironment === 'test' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
