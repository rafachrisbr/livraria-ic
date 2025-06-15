
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuditLog {
  id: string;
  action_type: string;
  table_name: string;
  record_id: string | null;
  details: any;
  created_at: string;
  user_id: string;
  administrator?: {
    name: string | null;
    email: string;
  } | null;
}

interface Administrator {
  user_id: string;
  name: string | null;
  email: string;
}

const Audit = () => {
  const { user, signOut } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    fetchAuditLogs();

    // Escuta realtime
    const channel = supabase
      .channel("audit-logs-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" }, fetchAuditLogs)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // Buscar todos administradores
      const { data: admins, error: adminError } = await supabase
        .from("administrators")
        .select("user_id, name, email");
      if (adminError) throw adminError;

      // Buscar logs
      const { data: logs, error: auditError } = await supabase
        .from("audit_logs")
        .select(`id, action_type, table_name, record_id, details, created_at, user_id`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (auditError) throw auditError;

      // Associar admin ao log
      const logsWithAdmins = (logs || []).map((log) => ({
        ...log,
        administrator: admins?.find((admin) => admin.user_id === log.user_id) || null,
      }));

      setAuditLogs(logsWithAdmins);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar logs de auditoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "CREATE":
      case "INSERT":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames = {
      products: "Produtos",
      sales: "Vendas",
      categories: "Categorias",
      administrators: "Administradores",
    };
    return tableNames[tableName as keyof typeof tableNames] || tableName;
  };

  const formatDetails = (details: any) => {
    if (!details) return "";
    if (details.product_name) {
      return `${details.product_name} - Qtd: ${details.quantity || ""} - Valor: R$ ${
        details.total_price || details.price || ""
      }`;
    }
    if (details.name) {
      return details.name;
    }
    return JSON.stringify(details).slice(0, 100) + "...";
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MobileHeader title="Auditoria" subtitle="Logs do sistema" showBackButton />
        <main className="px-4 py-6">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Logs de Auditoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando logs...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhum log de auditoria encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getActionTypeColor(log.action_type)}>{log.action_type}</Badge>
                        <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{getTableDisplayName(log.table_name)}</p>
                        <p className="text-gray-600">
                          {log.administrator?.name || log.administrator?.email || "N/A"}
                        </p>
                        {log.details && (
                          <p className="text-gray-500 text-xs mt-1">{formatDetails(log.details)}</p>
                        )}
                      </div>
                    </div>
                  ))}
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
                <p className="text-gray-600">Livraria Imaculada Conceição</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Logs de Auditoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Carregando logs...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum log de auditoria encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ação</TableHead>
                      <TableHead>Tabela</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={getActionTypeColor(log.action_type)}>
                            {log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getTableDisplayName(log.table_name)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.administrator?.name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.administrator?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(log.created_at).toLocaleDateString("pt-BR")}
                            <br />
                            <span className="text-gray-500">
                              {new Date(log.created_at).toLocaleTimeString("pt-BR")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate" title={formatDetails(log.details)}>
                            {formatDetails(log.details)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Audit;
