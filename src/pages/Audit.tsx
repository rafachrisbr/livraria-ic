

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuditFiltersComponent } from "@/components/audit/AuditFilters";
import { AuditLogRow } from "@/components/audit/AuditLogRow";
import { AuditExport } from "@/components/audit/AuditExport";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Audit = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Verificar se o usuário é o Rafael
  const isRafael = user?.email === 'rafael.christiano@yahoo.com.br';

  // Redirecionar se não for o Rafael
  useEffect(() => {
    if (user && !isRafael) {
      console.log('Acesso negado para usuário:', user.email);
      navigate('/');
    }
  }, [user, isRafael, navigate]);

  const {
    auditLogs,
    administrators,
    loading,
    filters,
    currentPage,
    totalPages,
    handleFiltersChange,
    clearFilters,
    getActiveFiltersCount,
    fetchAuditLogs,
    setCurrentPage,
  } = useAuditLogs();

  const handleLogout = async () => {
    await signOut();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAuditLogs(page);
  };

  // Se não for o Rafael, não renderizar nada (redirecionamento já aconteceu)
  if (user && !isRafael) {
    return null;
  }

  // Se ainda estiver carregando o usuário, mostrar loading
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader title="Auditoria" subtitle="Logs do sistema" />
        <main className="px-4 py-6 space-y-4">
          {/* Filtros */}
          <AuditFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            administrators={administrators}
            onClearFilters={clearFilters}
            activeFiltersCount={getActiveFiltersCount()}
          />

          {/* Exportação */}
          <div className="flex justify-end">
            <AuditExport logs={auditLogs} isLoading={loading} />
          </div>

          {/* Lista de Logs */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Logs de Auditoria</span>
                </div>
                <span className="text-sm font-normal text-gray-500">
                  {auditLogs.length} registros
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Carregando logs...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhum log de auditoria encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <AuditLogRow key={log.id} log={log} />
                  ))}
                </div>
              )}

              {/* Paginação Mobile */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Auditoria do Sistema</h1>
                <p className="text-gray-600">Gestão da Livraria IC</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filtros */}
        <AuditFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          administrators={administrators}
          onClearFilters={clearFilters}
          activeFiltersCount={getActiveFiltersCount()}
        />

        {/* Header com exportação */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Logs de Auditoria</h2>
            <p className="text-gray-600">{auditLogs.length} registros encontrados</p>
          </div>
          <AuditExport logs={auditLogs} isLoading={loading} />
        </div>

        {/* Lista de Logs */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando logs de auditoria...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Nenhum log de auditoria encontrado</p>
                <p className="text-slate-400 text-sm mt-2">
                  Tente ajustar os filtros para ver mais resultados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <AuditLogRow key={log.id} log={log} />
                ))}
              </div>
            )}

            {/* Paginação Desktop */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Audit;
