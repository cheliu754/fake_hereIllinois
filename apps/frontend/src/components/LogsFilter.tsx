import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Card } from "../plugin-ui/card";
import { Button } from "../plugin-ui/button";
import { Input } from "../plugin-ui/input";
import { Label } from "../plugin-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../plugin-ui/select";

export interface LogFilters {
  action?: string;
  uin?: string;
  sessionId?: string;
  operationUser?: string;
}

interface LogsFilterProps {
  filters: LogFilters;
  onFilterChange: (filters: LogFilters) => void;
}

export function LogsFilter({ filters, onFilterChange }: LogsFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== ""
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="size-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-600"
            >
              <X className="size-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <Label htmlFor="action">Action Type</Label>
            <Select
              value={filters.action || "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  action: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger id="action">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="ADD">Add</SelectItem>
                <SelectItem value="EDIT">Edit</SelectItem>
                <SelectItem value="REMOVE">Remove</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uin">UIN</Label>
            <Input
              id="uin"
              type="text"
              placeholder="Filter by UIN"
              value={filters.uin || ""}
              onChange={(e) =>
                onFilterChange({ ...filters, uin: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionId">Session ID</Label>
            <Input
              id="sessionId"
              type="text"
              placeholder="Filter by session"
              value={filters.sessionId || ""}
              onChange={(e) =>
                onFilterChange({ ...filters, sessionId: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operationUser">Operation User</Label>
            <Input
              id="operationUser"
              type="text"
              placeholder="Filter by user"
              value={filters.operationUser || ""}
              onChange={(e) =>
                onFilterChange({ ...filters, operationUser: e.target.value })
              }
            />
          </div>
        </div>
      )}
    </Card>
  );
}
