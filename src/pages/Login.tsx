
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const { signIn, signUp, loading, user, isAdmin } = useAuth();

  // Se já está logado e é admin, redireciona para página de boas-vindas
  if (user && isAdmin) {
    window.location.href = '/welcome';
    return null;
  }

  // Se já está logado mas ainda verificando status de admin, mostra loading
  if (user && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-blue-600">Verificando Permissões</CardTitle>
            <CardDescription className="text-center">
              Verificando suas permissões de administrador...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Carregando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se já está logado e não é admin (após verificação completa), mostra mensagem específica
  if (user && !loading && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
            <CardDescription className="text-center">
              Sua conta não possui permissões de administrador para acessar este sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Usuário conectado: {user.email}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Recarregar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas. Verifique seu email e senha.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Verificando permissões...",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessKey !== 'salvemaria') {
      toast({
        title: "Chave de acesso inválida",
        description: "A chave de acesso está incorreta.",
        variant: "destructive",
      });
      return;
    }

    if (!email || !password || !name) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await signUp(email, password, name);
    
    if (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta de administrador.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta antes de fazer login.",
      });
      setShowSignUp(false);
      setIsSignUp(false);
      // Limpar campos
      setEmail('');
      setPassword('');
      setName('');
      setAccessKey('');
    }
  };

  const toggleSignUp = () => {
    setShowSignUp(!showSignUp);
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setName('');
    setAccessKey('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md space-y-6">
        {/* FSSPX Logo Header */}
        <div className="text-center">
          <img 
            src="https://cadastro.fsspx.com.br/wp-content/uploads/2023/04/fsspx-logo-novo-png-large-3.png" 
            alt="Fraternidade Sacerdotal São Pio X"
            className="mx-auto h-16 sm:h-20 w-auto object-contain mb-4"
            onError={(e) => {
              // Fallback para logo alternativo se o primeiro não carregar
              e.currentTarget.src = "https://static.wixstatic.com/media/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png/v1/fill/w_184,h_184,al_c,usm_0.66_1.00_0.01/ecc2b9_af29ba9d8fb542baae713a67ff8faafa~mv2.png";
            }}
          />
        </div>

        {/* Main Content Card with Background Image */}
        <div className="relative">
          {/* Background Image for larger screens */}
          <div className="hidden sm:block absolute inset-0 opacity-10 rounded-lg overflow-hidden">
            <img 
              src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
              alt="Imaculada Conceição"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Organization Info */}
          <div className="relative text-center mb-6">
            <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">
                Livraria Imaculada Conceição
              </h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Capela Imaculada Conceição
                </p>
                <p className="text-sm text-gray-600">
                  Indaiatuba - SP
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-blue-600 font-medium">
                  Sistema Administrativo
                </p>
              </div>
            </div>
          </div>

          {/* Login/SignUp Form */}
          <Card className="shadow-xl relative backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl text-center">
                {isSignUp ? 'Cadastrar Administrador' : 'Login Administrativo'}
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                {isSignUp 
                  ? 'Cadastre um novo administrador no sistema' 
                  : 'Acesse o sistema da livraria'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="accessKey" className="text-sm font-medium">
                        Chave de Acesso *
                      </label>
                      <Input
                        id="accessKey"
                        type="password"
                        placeholder="Digite a chave de acesso"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                        required
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nome Completo *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Digite seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="min-h-[44px]"
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="administrador@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="min-h-[44px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Senha *
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="min-h-[44px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 min-h-[44px]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? 'Cadastrando...' : 'Entrando...'}
                    </>
                  ) : (
                    isSignUp ? 'Cadastrar Administrador' : 'Entrar'
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  onClick={toggleSignUp}
                  className="text-blue-600 hover:text-blue-700 min-h-[44px]"
                >
                  {isSignUp 
                    ? 'Já tem uma conta? Fazer login' 
                    : 'Cadastrar novo administrador'
                  }
                </Button>
              </div>

              {isSignUp && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Nota:</strong> Após o cadastro, você receberá um email de confirmação. 
                    É necessário confirmar seu email antes de poder fazer login no sistema.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile Image - Only visible on small screens */}
        <div className="sm:hidden text-center">
          <img 
            src="https://osaopaulo.org.br/wp-content/uploads/2020/12/dgh.jpg" 
            alt="Imaculada Conceição"
            className="mx-auto h-24 w-auto object-contain opacity-30"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
