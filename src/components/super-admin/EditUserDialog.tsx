
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditUserDialogProps {
  user: any;
  mode: 'password' | 'email';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string, value: string) => Promise<void>;
  loading: boolean;
}

export const EditUserDialog = ({ user, mode, open, onOpenChange, onConfirm, loading }: EditUserDialogProps) => {
  const [value, setValue] = useState("");

  const handleConfirm = async () => {
    if (!value.trim()) return;
    
    await onConfirm(user.id, value);
    setValue("");
  };

  const isValid = () => {
    if (mode === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (mode === 'password') {
      return value.length >= 6;
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'password' ? 'Alterar Senha' : 'Alterar Email'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'password' 
              ? `Defina uma nova senha para ${user.email}`
              : `Defina um novo email para ${user.email}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="value">
              {mode === 'password' ? 'Nova Senha' : 'Novo Email'}
            </Label>
            <Input
              id="value"
              type={mode === 'password' ? 'password' : 'email'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === 'password' ? 'Digite a nova senha...' : 'Digite o novo email...'}
            />
            {mode === 'password' && (
              <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || !isValid()}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
