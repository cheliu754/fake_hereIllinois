import { useState } from "react";
import { format } from "date-fns";
import { Eye, Calendar, User, FileText } from "lucide-react";
import { Card } from "../plugin-ui/card";
import { Button } from "../plugin-ui/button";
import { Badge } from "../plugin-ui/badge";
import { LogDetailDialog } from "./LogDetailDialog";
import type { AuditLog } from "../models/Log.model";

interface LogsTableProps {
  logs: AuditLog[];
}

export function LogsTable({ logs }: LogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const actionColors = {
    ADD: "bg-green-100 text-green-800",
    EDIT: "bg-[#FFF5F0] text-[#E84A27]",
    REMOVE: "bg-red-100 text-red-800",
  };

  if (logs.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <FileText className="size-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No audit logs found
          </h3>
          <p className="text-gray-500">
            Audit logs will appear here when attendance records are modified.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <User className="size-4" />
                    <span>Operation User</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Calendar className="size-4" />
                    <span>Time</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={actionColors[log.action]}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.operationUser}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(log.operationTime), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                      className="text-[#13294B] hover:text-[#E84A27] hover:bg-[#FFF5F0]"
                    >
                      <Eye className="size-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <LogDetailDialog
        log={selectedLog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}