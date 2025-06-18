
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle } from "lucide-react";

interface ConfirmDeleteAllCategoriesDialogProps {
  onConfirm: () => Promise<number>;
  loading: boolean;
}

export const ConfirmDeleteAllCategoriesDialog = ({ onConfirm, loading }: ConfirmDeleteAllCategoriesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [step, setStep] = useState(1);

  const handleConfirm = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    
    if (confirmText === "DELETAR TODAS AS CATEGORIAS") {
      await onConfirm();
      setOpen(false);
      setStep(1);
      setConfirmText("");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setStep(1);
    setConfirmText("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
          <Trash2 className="h-4 w-4 mr-2" />
          Deletar TODAS
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {step === 1 ? "ATENÇÃO: Operação Irreversível" : "Confirmação Final"}
          </DialogTitle>
          <DialogDescription className="text-left">
            {step === 1 ? (
              <div className="space-y-3">
                <p className="font-semibold text-red-600">
                  Esta ação irá DELETAR TODAS AS CATEGORIAS do sistema!
                </p>
                <div className="space-y-1 text-sm">
                  <div>• Só é possível se não houver produtos cadastrados</div>
                  <div>• Todas as categorias serão removidas permanentemente</div>
                  <div>• Esta operação NÃO PODE ser desfeita</div>
                </div>
                <p className="font-semibold">
                  Tem certeza absoluta que deseja continuar?
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-semibold text-red-600">
                  Para confirmar, digite exatamente:
                </p>
                <p className="font-mono text-center bg-gray-100 p-2 rounded">
                  DELETAR TODAS AS CATEGORIAS
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {step === 2 && (
          <div className="space-y-2">
            <Label htmlFor="confirm-text">Digite a confirmação:</Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETAR TODAS AS CATEGORIAS"
              className="font-mono"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={loading || (step === 2 && confirmText !== "DELETAR TODAS AS CATEGORIAS")}
          >
            {loading ? "Processando..." : step === 1 ? "Continuar" : "Confirmar Deleção"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
