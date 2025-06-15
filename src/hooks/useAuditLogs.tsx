
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditFilters {
  search: string;
  userId: string;
  actionType: string;
  tableName: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

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

interface Administrator {
  user_id: string;
  name: string | null;
  email: string;
}

export const useAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(50);
  const { toast } = useToast();

  const [filters, setFilters] = useState<AuditFilters>({
    search: "",
    userId: "all",
    actionType: "all", 
    tableName: "all",
    dateFrom: null,
    dateTo: null,
  });

  const fetchAdministrators = async () => {
    try {
      const { data, error } = await supabase
        .from("administrators")
        .select("user_id, name, email")
        .order("name");

      if (error) throw error;
      setAdministrators(data || []);
    } catch (error) {
      console.error("Error fetching administrators:", error);
    }
  };

  const fetchAuditLogs = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("audit_logs")
        .select(`
          id, action_type, table_name, record_id, details, created_at, user_id,
          ip_address, user_agent, old_values, new_values
        `, { count: 'exact' });

      // Aplicar filtros
      if (currentFilters.search) {
        query = query.or(`details.ilike.%${currentFilters.search}%,table_name.ilike.%${currentFilters.search}%`);
      }

      if (currentFilters.userId !== "all") {
        query = query.eq("user_id", currentFilters.userId);
      }

      if (currentFilters.actionType !== "all") {
        query = query.eq("action_type", currentFilters.actionType);
      }

      if (currentFilters.tableName !== "all") {
        query = query.eq("table_name", currentFilters.tableName);
      }

      if (currentFilters.dateFrom) {
        query = query.gte("created_at", currentFilters.dateFrom.toISOString());
      }

      if (currentFilters.dateTo) {
        const endDate = new Date(currentFilters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDate.toISOString());
      }

      // Paginação
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: logs, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Associar administradores aos logs
      const logsWithAdmins = (logs || []).map((log) => ({
        ...log,
        administrator: administrators.find((admin) => admin.user_id === log.user_id) || null,
      }));

      setAuditLogs(logsWithAdmins);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      setCurrentPage(page);
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

  const handleFiltersChange = (newFilters: AuditFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchAuditLogs(1, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      userId: "all",
      actionType: "all",
      tableName: "all", 
      dateFrom: null,
      dateTo: null,
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    fetchAuditLogs(1, clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.userId !== "all") count++;
    if (filters.actionType !== "all") count++;
    if (filters.tableName !== "all") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  };

  useEffect(() => {
    fetchAdministrators();
  }, []);

  useEffect(() => {
    if (administrators.length > 0) {
      fetchAuditLogs(1);
    }
  }, [administrators]);

  useEffect(() => {
    // Escuta realtime
    const channel = supabase
      .channel("audit-logs-changes")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "audit_logs" 
      }, () => {
        fetchAuditLogs(currentPage);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentPage, filters]);

  return {
    auditLogs,
    administrators,
    loading,
    filters,
    currentPage,
    totalPages,
    itemsPerPage,
    handleFiltersChange,
    clearFilters,
    getActiveFiltersCount,
    fetchAuditLogs,
    setCurrentPage,
  };
};
