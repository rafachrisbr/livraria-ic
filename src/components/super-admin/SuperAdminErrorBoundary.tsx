
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class SuperAdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('SuperAdmin Error Boundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SuperAdmin Error details:', error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Erro no Super Admin
              </CardTitle>
              <CardDescription className="text-center">
                Ocorreu um erro no painel de administração.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Erro:</strong> {this.state.error?.message}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">Detalhes técnicos</summary>
                    <pre className="text-xs mt-1 whitespace-pre-wrap">{this.state.errorInfo}</pre>
                  </details>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                  className="flex-1"
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
