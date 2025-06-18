
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface ConfirmDeleteUserDialogProps {
  user: any;
  onConfirm: () => Promise<boolean>;
  loading: boolean;
}

export const ConfirmDeleteUserDialog = ({ user, onConfirm, loading }: ConfirmDeleteUserDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Deletar Usuário
          </DialogTitle>
          <DialogDescription className="text-left space-y-2">
            <p>Tem certeza que deseja deletar o usuário:</p>
            <p className="font-semibold">{user.email}</p>
            <p className="text-red-600 font-medium">
              Esta ação não pode ser desfeita e todos os dados relacionados ao usuário serão perdidos.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? "Deletando..." : "Deletar Usuário"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
