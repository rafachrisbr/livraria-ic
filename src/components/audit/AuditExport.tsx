
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  action_type: string;
  table_name: string;
  record_id: string | null;
  details: any;
  created_at: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  old_values: any;
  new_values: any;
  administrator?: {
    name: string | null;
    email: string;
  } | null;
}

interface AuditExportProps {
  logs: AuditLog[];
  isLoading: boolean;
}

export const AuditExport = ({ logs, isLoading }: AuditExportProps) => {
  const { toast } = useToast();

  const getActionTypeLabel = (actionType: string) => {
    const labels = {
      INSERT: "Criação",
      UPDATE: "Edição", 
      DELETE: "Exclusão",
      LOGIN: "Login",
      LOGOUT: "Logout",
      PASSWORD_CHANGE: "Alteração de Senha",
    };
    return labels[actionType as keyof typeof labels] || actionType;
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames = {
      products: "Produtos",
      sales: "Vendas",
      categories: "Categorias",
      administrators: "Administradores",
      promotions: "Promoções",
      auth: "Autenticação",
    };
    return tableNames[tableName as keyof typeof tableNames] || tableName;
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Data/Hora",
      "Usuário",
      "Email",
      "Ação",
      "Módulo",
      "Detalhes",
      "IP",
      "Dispositivo",
      "ID do Registro"
    ];

    const csvData = logs.map(log => [
      new Date(log.created_at).toLocaleString("pt-BR"),
      log.administrator?.name || "N/A",
      log.administrator?.email || "N/A",
      getActionTypeLabel(log.action_type),
      getTableDisplayName(log.table_name),
      log.details ? JSON.stringify(log.details) : "",
      log.ip_address || "",
      log.user_agent || "",
      log.record_id || ""
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { 
      type: "text/csv;charset=utf-8;" 
    });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Sucesso",
      description: "Relatório CSV exportado com sucesso",
    });
  };

  const exportToPDF = () => {
    if (logs.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    // Criar conteúdo HTML para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Auditoria - Livraria Imaculada Conceição</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #333; }
          .report-title { font-size: 18px; color: #666; margin-top: 10px; }
          .meta-info { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .action-badge { 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold;
            display: inline-block;
          }
          .action-insert { background-color: #dcfce7; color: #166534; }
          .action-update { background-color: #dbeafe; color: #1e40af; }
          .action-delete { background-color: #fee2e2; color: #dc2626; }
          .action-login { background-color: #f3e8ff; color: #7c3aed; }
          .action-logout { background-color: #f1f5f9; color: #475569; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Livraria Imaculada Conceição</div>
          <div class="report-title">Relatório de Auditoria do Sistema</div>
        </div>
        
        <div class="meta-info">
          <strong>Período:</strong> ${new Date().toLocaleDateString("pt-BR")}<br>
          <strong>Total de registros:</strong> ${logs.length}<br>
          <strong>Gerado em:</strong> ${new Date().toLocaleString("pt-BR")}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Módulo</th>
              <th>Detalhes</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td>${new Date(log.created_at).toLocaleString("pt-BR")}</td>
                <td>${log.administrator?.name || log.administrator?.email || "N/A"}</td>
                <td>
                  <span class="action-badge action-${log.action_type.toLowerCase()}">
                    ${getActionTypeLabel(log.action_type)}
                  </span>
                </td>
                <td>${getTableDisplayName(log.table_name)}</td>
                <td>${log.details ? JSON.stringify(log.details).slice(0, 100) + "..." : ""}</td>
                <td>${log.ip_address || ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div class="footer">
          Relatório gerado automaticamente pelo Sistema de Auditoria<br>
          © ${new Date().getFullYear()} Livraria Imaculada Conceição
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Sucesso",
      description: "Relatório PDF gerado com sucesso",
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        disabled={isLoading || logs.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar CSV
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={isLoading || logs.length === 0}
      >
        <FileText className="h-4 w-4 mr-2" />
        Exportar PDF
      </Button>
    </div>
  );
};
