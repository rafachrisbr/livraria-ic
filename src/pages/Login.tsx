
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login para demonstração
    if (email && password) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema da Livraria Imaculada Conceição",
      });
      onLogin();
    } else {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey !== 'salvemaria') {
      toast({
        title: "Chave de acesso inválida",
        description: "A chave de acesso está incorreta",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas devem ser iguais",
        variant: "destructive",
      });
      return;
    }

    if (newEmail && newPassword && accessKey === 'salvemaria') {
      toast({
        title: "Administrador cadastrado!",
        description: "Novo administrador criado com sucesso",
      });
      setShowRegister(false);
      setAccessKey('');
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">IC</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Livraria Imaculada Conceição</h1>
          <p className="text-sm text-blue-700">Fraternidade Sacerdotal São Pio X</p>
        </div>

        {!showRegister ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">Acesso Administrativo</CardTitle>
              <CardDescription>
                Entre com suas credenciais de administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </form>
              
              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowRegister(true)}
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar Novo Administrador
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">Cadastro de Administrador</CardTitle>
              <CardDescription>
                Insira a chave de acesso para criar um novo administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessKey">Chave de Acesso</Label>
                  <Input
                    id="accessKey"
                    type="password"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="Digite a chave de acesso"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEmail">E-mail</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="novo@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegister(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-900 hover:bg-blue-800">
                    Cadastrar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
