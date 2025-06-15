
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditFilters {
  search: string;
  userId: string;
  actionType: string;
  tableName: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface Administrator {
  user_id: string;
  name: string | null;
  email: string;
}

interface AuditFiltersProps {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
  administrators: Administrator[];
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const AuditFiltersComponent = ({
  filters,
  onFiltersChange,
  administrators,
  onClearFilters,
  activeFiltersCount,
}: AuditFiltersProps) => {
  const updateFilter = (key: keyof AuditFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const actionTypes = [
    { value: "INSERT", label: "Criação" },
    { value: "UPDATE", label: "Edição" },
    { value: "DELETE", label: "Exclusão" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
    { value: "PASSWORD_CHANGE", label: "Alteração de Senha" },
  ];

  const tableNames = [
    { value: "products", label: "Produtos" },
    { value: "sales", label: "Vendas" },
    { value: "categories", label: "Categorias" },
    { value: "administrators", label: "Administradores" },
    { value: "promotions", label: "Promoções" },
    { value: "auth", label: "Autenticação" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} ativo(s)</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Busca */}
        <div className="col-span-1 md:col-span-2">
          <Input
            placeholder="Buscar nos detalhes..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Usuário */}
        <div>
          <Select value={filters.userId} onValueChange={(value) => updateFilter("userId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              {administrators.map((admin) => (
                <SelectItem key={admin.user_id} value={admin.user_id}>
                  {admin.name || admin.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Ação */}
        <div>
          <Select value={filters.actionType} onValueChange={(value) => updateFilter("actionType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {actionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Módulo */}
        <div>
          <Select value={filters.tableName} onValueChange={(value) => updateFilter("tableName", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os módulos</SelectItem>
              {tableNames.map((table) => (
                <SelectItem key={table.value} value={table.value}>
                  {table.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data */}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {filters.dateFrom ? format(filters.dateFrom, "dd/MM", { locale: ptBR }) : "De"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom || undefined}
                onSelect={(date) => updateFilter("dateFrom", date)}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {filters.dateTo ? format(filters.dateTo, "dd/MM", { locale: ptBR }) : "Até"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo || undefined}
                onSelect={(date) => updateFilter("dateTo", date)}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
