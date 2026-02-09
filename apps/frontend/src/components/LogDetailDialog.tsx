import { format } from "date-fns";
import { Calendar, User, FileText, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../plugin-ui/dialog";
import { Badge } from "../plugin-ui/badge";
import type { AuditLog } from "../models/Log.model";

interface LogDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDetailDialog({
  log,
  open,
  onOpenChange,
}: LogDetailDialogProps) {
  if (!log) return null;

  const actionColors = {
    ADD: "bg-green-100 text-green-800",
    EDIT: "bg-blue-100 text-blue-800",
    REMOVE: "bg-red-100 text-red-800",
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <FileText className="size-6 text-blue-600" />
            <span>Audit Log Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete information about this audit log entry including the action performed, changes made, and state snapshots.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-500 mb-1">Action</div>
                <Badge className={actionColors[log.action]}>{log.action}</Badge>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Log ID</div>
                <div className="text-sm font-mono text-gray-900">
                  {log._id}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                  <User className="size-3" />
                  <span>Operation User</span>
                </div>
                <div className="text-sm text-gray-900">{log.operationUser}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1 flex items-center space-x-1">
                  <Calendar className="size-3" />
                  <span>Operation Time</span>
                </div>
                <div className="text-sm text-gray-900">
                  {format(new Date(log.operationTime), "PPpp")}
                </div>
              </div>
            </div>
          </div>

          {/* Changes */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Changes Made</h3>
            {log.changes && log.changes.length > 0 ? (
              <div className="space-y-2">
                {log.changes.map((change, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="font-medium text-sm text-gray-700 mb-2">
                      Field: {change.field}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">Old Value</div>
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-900 font-mono">
                          {formatValue(change.oldValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">New Value</div>
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-green-900 font-mono">
                          {formatValue(change.newValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-500">
                {log.action === "ADD" 
                  ? "No changes (new record created)" 
                  : log.action === "REMOVE"
                  ? "No changes (record removed)"
                  : "No changes detected"}
              </div>
            )}
          </div>

          {/* Before & After Snapshots */}
          <div className="grid grid-cols-2 gap-4">
            {/* Before */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span>Before</span>
                {!log.before && (
                  <AlertCircle className="size-4 text-gray-400" />
                )}
              </h3>
              {log.before ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">UIN:</span>{" "}
                    <span className="font-medium">{log.before.uin}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Session:</span>{" "}
                    <span className="font-medium">{log.before.sessionId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Taken By:</span>{" "}
                    <span className="font-medium">{log.before.takenBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(log.before.date), "PPpp")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-500">
                  No previous state
                </div>
              )}
            </div>

            {/* After */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span>After</span>
                {!log.after && <AlertCircle className="size-4 text-gray-400" />}
              </h3>
              {log.after ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">UIN:</span>{" "}
                    <span className="font-medium">{log.after.uin}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Session:</span>{" "}
                    <span className="font-medium">{log.after.sessionId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Taken By:</span>{" "}
                    <span className="font-medium">{log.after.takenBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(log.after.date), "PPpp")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-500">
                  Record removed
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}