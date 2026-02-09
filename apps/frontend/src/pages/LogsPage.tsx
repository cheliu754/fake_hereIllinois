import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { LogsFilter, LogFilters } from "../components/LogsFilter";
import { LogsTable } from "../components/LogsTable";
import { auditLogApi, ApiError } from "../api/api";
import type { AuditLog } from "../models/Log.model";

export function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<LogFilters>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      console.log("[LogsPage] Fetching logs...");
      const response = await auditLogApi.getAll();
      console.log("[LogsPage] API response:", response);
      
      // Handle different response formats
      let logsData = [];
      if (Array.isArray(response)) {
        // Direct array response
        logsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        // { data: [...] } format
        logsData = response.data;
      } else if (response.logs && Array.isArray(response.logs)) {
        // { logs: [...] } format
        logsData = response.logs;
      }
      
      console.log("[LogsPage] Extracted logs:", logsData);
      setLogs(logsData);
    } catch (error) {
      console.error("[LogsPage] Failed to fetch audit logs:", error);
      setLogs([]);
      if (error instanceof ApiError) {
        toast.error(`Failed to load logs: ${error.message}`);
      } else {
        toast.error("Failed to load audit logs");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filters.action && log.action !== filters.action) return false;
      
      // Filter by UIN - check both before and after snapshots
      if (filters.uin) {
        const uinMatch = 
          (log.before && log.before.uin.includes(filters.uin)) ||
          (log.after && log.after.uin.includes(filters.uin));
        if (!uinMatch) return false;
      }
      
      // Filter by Session ID - check both before and after snapshots
      if (filters.sessionId) {
        const sessionMatch = 
          (log.before && log.before.sessionId.includes(filters.sessionId)) ||
          (log.after && log.after.sessionId.includes(filters.sessionId));
        if (!sessionMatch) return false;
      }
      
      if (
        filters.operationUser &&
        !log.operationUser.toLowerCase().includes(filters.operationUser.toLowerCase())
      )
        return false;
      return true;
    });
  }, [logs, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Audit Logs
        </h1>
        <p className="text-gray-600">
          View and track all changes made to attendance records.
        </p>
      </div>

      <LogsFilter filters={filters} onFilterChange={setFilters} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Log Entries</h2>
          <span className="text-sm text-gray-500">
            {isLoading
              ? "Loading..."
              : `Showing ${filteredLogs?.length ?? 0} of ${logs?.length ?? 0} ${(logs?.length ?? 0) === 1 ? "log" : "logs"}`}
          </span>
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading audit logs...
          </div>
        ) : (
          <LogsTable logs={filteredLogs} />
        )}
      </div>
    </div>
  );
}