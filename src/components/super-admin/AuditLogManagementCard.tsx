
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Trash2, AlertTriangle } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const AuditLogManagementCard = () => {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmationKeyword, setConfirmationKeyword] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteAllLogs = async () => {
    if (confirmationKeyword !== "deletare") {
      toast({
        title: "Palavra-chave incorreta",
        description: 'Digite exatamente "deletare" para confirmar a operação.',
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('delete_all_audit_logs', {
        confirmation_keyword: confirmationKeyword
      });

      if (error) throw error;

      toast({
        title: "Logs deletados com sucesso",
        description: `${data} logs de auditoria foram removidos do sistema.`,
      });

      setConfirmationKeyword("");
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting audit logs:', error);
      toast({
        title: "Erro ao deletar logs",
        description: error.message || "Erro inesperado ao deletar logs de auditoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-800">
          <FileText className="h-6 w-6" />
          <span>Gerenciamento de Logs de Auditoria</span>
        </CardTitle>
        <CardDescription>
          Limpe todos os logs de auditoria do sistema para preparar para produção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-yellow-800">Atenção Especial!</p>
              <p className="text-sm text-yellow-700">
                Esta operação deletará TODOS os logs de auditoria do sistema, exceto o log da própria operação.
                Use apenas para limpar dados de teste antes de entrar em produção.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>O que será deletado:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Todos os logs de ações do sistema</li>
              <li>Histórico de login e autenticação</li>
              <li>Registros de mudanças em produtos, vendas e categorias</li>
              <li>Logs de operações administrativas</li>
            </ul>
          </div>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar TODOS os Logs de Auditoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  Confirmar Limpeza Completa de Logs
                </DialogTitle>
                <DialogDescription>
                  Esta é uma operação crítica e irreversível. Para confirmar, digite exatamente a palavra-chave abaixo.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>ATENÇÃO:</strong> Todos os logs de auditoria serão permanentemente removidos.
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    Digite "deletare" para confirmar:
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmationKeyword}
                    onChange={(e) => setConfirmationKeyword(e.target.value)}
                    placeholder="deletare"
                    className="font-mono"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setConfirmationKeyword("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllLogs}
                  disabled={loading || confirmationKeyword !== "deletare"}
                >
                  {loading ? "Deletando..." : "Confirmar Limpeza"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
