import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../plugin-ui/dialog";
import { Button } from "../plugin-ui/button";
import { Input } from "../plugin-ui/input";
import { Label } from "../plugin-ui/label";
import { Badge } from "../plugin-ui/badge";
import type { Attendance } from "../models/Attendance.model";

interface EditAttendanceDialogProps {
  record: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Attendance) => Promise<void>;
}

export function EditAttendanceDialog({
  record,
  open,
  onOpenChange,
  onSubmit,
}: EditAttendanceDialogProps) {
  const [formData, setFormData] = useState<Attendance>({
    uin: "",
    sessionId: "",
    takenBy: "",
    operationUser: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        uin: record.uin,
        sessionId: record.sessionId,
        takenBy: record.takenBy,
        operationUser: "", // User needs to fill this
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.uin || !formData.sessionId || !formData.takenBy || !formData.operationUser) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      // Dialog will be closed by parent component after successful update
    } catch (error) {
      console.error("Failed to update record:", error);
      // Keep dialog open on error so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof Attendance, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-semibold text-[#13294B]">
                Edit Attendance Record
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update the attendance record details below.
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* UIN Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-uin" className="text-sm font-medium text-gray-700">
                UIN (Student ID) *
              </Label>
              <Input
                id="edit-uin"
                type="text"
                value={formData.uin}
                onChange={(e) => handleChange("uin", e.target.value)}
                placeholder="e.g., 123456789"
                required
                className="w-full"
              />
            </div>

            {/* Session ID Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-sessionId" className="text-sm font-medium text-gray-700">
                Session ID *
              </Label>
              <Input
                id="edit-sessionId"
                type="text"
                value={formData.sessionId}
                onChange={(e) => handleChange("sessionId", e.target.value)}
                placeholder="e.g., CS101-Fall2024"
                required
                className="w-full"
              />
            </div>

            {/* Taken By Field - Badge Display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Taken By
              </Label>
              <div className="flex items-center">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-2 py-0.5 text-xs border border-blue-200">
                  {formData.takenBy}
                </Badge>
              </div>
            </div>

            {/* Operation User Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-operationUser" className="text-sm font-medium text-gray-700">
                Operation User *
              </Label>
              <Input
                id="edit-operationUser"
                type="text"
                value={formData.operationUser || ""}
                onChange={(e) => handleChange("operationUser", e.target.value)}
                placeholder="e.g., Jane Smith"
                required
                className="w-full"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.uin ||
                  !formData.sessionId ||
                  !formData.takenBy ||
                  !formData.operationUser
                }
                className="bg-[#E84A27] hover:bg-[#d43f1f] text-white"
              >
                {isSubmitting ? "Updating..." : "Update Record"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}