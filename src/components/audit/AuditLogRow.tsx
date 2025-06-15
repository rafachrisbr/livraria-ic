
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, User, Globe, Smartphone } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

interface AuditLogRowProps {
  log: AuditLog;
}

export const AuditLogRow = ({ log }: AuditLogRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "INSERT":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "LOGIN":
        return "bg-purple-100 text-purple-800";
      case "LOGOUT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  const renderValueChanges = () => {
    if (!log.old_values && !log.new_values) return null;

    const oldValues = log.old_values || {};
    const newValues = log.new_values || {};
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    
    // Filtrar campos que não queremos mostrar
    const excludeFields = ['id', 'created_at', 'updated_at', 'password', 'encrypted_password'];
    const relevantKeys = Array.from(allKeys).filter(key => 
      !excludeFields.includes(key) && 
      oldValues[key] !== newValues[key]
    );

    if (relevantKeys.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        <h4 className="font-medium text-sm">Alterações:</h4>
        <div className="bg-gray-50 p-3 rounded space-y-2">
          {relevantKeys.map((key) => (
            <div key={key} className="text-sm">
              <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
              <div className="mt-1 space-y-1">
                {oldValues[key] && (
                  <div className="text-red-600">
                    <span className="text-gray-500">Antes:</span> {String(oldValues[key])}
                  </div>
                )}
                {newValues[key] && (
                  <div className="text-green-600">
                    <span className="text-gray-500">Depois:</span> {String(newValues[key])}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <CollapsibleTrigger asChild>
          <div className="flex items-start justify-between cursor-pointer">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={getActionTypeColor(log.action_type)}>
                  {getActionTypeLabel(log.action_type)}
                </Badge>
                <span className="font-medium">{getTableDisplayName(log.table_name)}</span>
                <span className="text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
              
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {log.administrator?.name || log.administrator?.email || "N/A"}
                  </span>
                </div>
                
                {log.details && (
                  <p className="text-gray-600 mt-1">{formatDetails(log.details)}</p>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4 pt-4 border-t space-y-3">
            {/* Informações técnicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {log.ip_address && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">IP:</span>
                  <span>{log.ip_address}</span>
                </div>
              )}
              
              {log.user_agent && (
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Dispositivo:</span>
                  <span className="truncate">{log.user_agent}</span>
                </div>
              )}
              
              {log.record_id && (
                <div className="col-span-1 md:col-span-2">
                  <span className="text-gray-500">ID do Registro:</span>
                  <span className="ml-2 font-mono text-xs">{log.record_id}</span>
                </div>
              )}
            </div>

            {/* Alterações de valores */}
            {renderValueChanges()}

            {/* Detalhes completos em JSON */}
            {log.details && (
              <div>
                <h4 className="font-medium text-sm mb-2">Detalhes completos:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
