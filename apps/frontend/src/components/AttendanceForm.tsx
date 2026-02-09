import { useState, useEffect } from "react";
import { Plus, Scan } from "lucide-react";
import { Card } from "../plugin-ui/card";
import { Button } from "../plugin-ui/button";
import { Input } from "../plugin-ui/input";
import { Label } from "../plugin-ui/label";
import type { AttendanceFormData } from "../models/Attendance.model";

interface AttendanceFormProps {
  onSubmit: (data: AttendanceFormData) => void;
  onScannerOpen: () => void;
  scannedUin?: string;
}

export function AttendanceForm({
  onSubmit,
  onScannerOpen,
  scannedUin,
}: AttendanceFormProps) {
  const [formData, setFormData] = useState<AttendanceFormData>({
    uin: "",
    sessionId: "",
    takenBy: "",
  });

  // Update UIN when scanned
  useEffect(() => {
    if (scannedUin) {
      setFormData((prev) => ({ ...prev, uin: scannedUin }));
    }
  }, [scannedUin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Only clear UIN after submission, keep sessionId and takenBy
    setFormData((prev) => ({ ...prev, uin: "" }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Add Attendance Record
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="uin">UIN (Student ID)</Label>
            <div className="flex space-x-2">
              <Input
                id="uin"
                type="text"
                placeholder="Enter or scan UIN"
                value={formData.uin}
                onChange={(e) => setFormData({ ...formData, uin: e.target.value })}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={onScannerOpen}
                className="flex items-center space-x-1 px-3"
                title="Scan barcode or QR code"
              >
                <Scan className="size-4" />
                <span className="hidden sm:inline">Scan</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionId">Session ID</Label>
            <Input
              id="sessionId"
              type="text"
              placeholder="e.g., 20260208"
              value={formData.sessionId}
              onChange={(e) =>
                setFormData({ ...formData, sessionId: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="takenBy">Taken By</Label>
            <Input
              id="takenBy"
              type="text"
              placeholder="e.g., John Doe"
              value={formData.takenBy}
              onChange={(e) => setFormData({ ...formData, takenBy: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button type="submit" className="flex items-center space-x-2">
            <Plus className="size-4" />
            <span>Add Record</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}