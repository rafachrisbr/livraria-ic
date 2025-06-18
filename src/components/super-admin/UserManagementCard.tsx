
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, Edit, Key, Mail } from "lucide-react";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { EditUserDialog } from "./EditUserDialog";
import { ConfirmDeleteUserDialog } from "./ConfirmDeleteUserDialog";

export const UserManagementCard = () => {
  const { users, loading, fetchAllUsers, deleteUser, updateUserPassword, updateUserEmail } = useSuperAdmin();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editMode, setEditMode] = useState<'password' | 'email' | null>(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleEditUser = (user: any, mode: 'password' | 'email') => {
    setSelectedUser(user);
    setEditMode(mode);
  };

  const handleUpdateUser = async (userId: string, value: string) => {
    let success = false;
    
    if (editMode === 'password') {
      success = await updateUserPassword(userId, value);
    } else if (editMode === 'email') {
      success = await updateUserEmail(userId, value);
    }

    if (success) {
      setSelectedUser(null);
      setEditMode(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Users className="h-6 w-6" />
          <span>Gerenciamento de Usuários</span>
        </CardTitle>
        <CardDescription>
          Gerencie todos os usuários do sistema - delete, altere senhas e emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total de usuários: {users.length}
          </span>
          <Button onClick={fetchAllUsers} variant="outline" size="sm" disabled={loading}>
            {loading ? "Carregando..." : "Atualizar Lista"}
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.email}</span>
                    {user.is_admin && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                    {user.email === 'rafael.christiano@yahoo.com.br' && (
                      <Badge variant="default" className="text-xs bg-purple-600">Super Admin</Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Criado: {formatDate(user.created_at)}</div>
                    <div>Último login: {formatDate(user.last_sign_in_at)}</div>
                  </div>
                </div>
                
                {user.email !== 'rafael.christiano@yahoo.com.br' && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user, 'password')}
                      disabled={loading}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user, 'email')}
                      disabled={loading}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <ConfirmDeleteUserDialog
                      user={user}
                      onConfirm={() => deleteUser(user.id)}
                      loading={loading}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedUser && editMode && (
          <EditUserDialog
            user={selectedUser}
            mode={editMode}
            open={!!selectedUser}
            onOpenChange={() => {
              setSelectedUser(null);
              setEditMode(null);
            }}
            onConfirm={handleUpdateUser}
            loading={loading}
          />
        )}
      </CardContent>
    </Card>
  );
};
