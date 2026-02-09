import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AttendanceForm } from "../components/AttendanceForm";
import { AttendanceTable } from "../components/AttendanceTable";
import { Scanner } from "../components/Scanner";
import { EditAttendanceDialog } from "../components/EditAttendanceDialog";
import { attendanceApi, ApiError } from "../api/api";
import type { Attendance, AttendanceFormData } from "../models/Attendance.model";

export function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedUin, setScannedUin] = useState<string | undefined>(undefined);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch attendance records on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      console.log("[AttendancePage] Fetching records...");
      const response = await attendanceApi.getAll();
      console.log("[AttendancePage] API response:", response);
      
      // Handle different response formats
      let recordsData = [];
      if (Array.isArray(response)) {
        // Direct array response
        recordsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        // { data: [...] } format
        recordsData = response.data;
      } else if (response.records && Array.isArray(response.records)) {
        // { records: [...] } format
        recordsData = response.records;
      }
      
      console.log("[AttendancePage] Extracted records:", recordsData);
      // Sort by date descending (newest first)
      recordsData.sort((a: Attendance, b: Attendance) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecords(recordsData);
    } catch (error) {
      console.error("[AttendancePage] Failed to fetch attendance records:", error);
      setRecords([]);
      if (error instanceof ApiError) {
        toast.error(`Failed to load records: ${error.message}`);
      } else {
        toast.error("Failed to load attendance records");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: AttendanceFormData) => {
    try {
      // Add new record
      console.log("[AttendancePage] Creating record:", data);
      const response = await attendanceApi.create(data);
      console.log("[AttendancePage] Create response:", response);
      toast.success("Attendance record added successfully");
      setScannedUin(undefined); // Clear scanned UIN after submission
      // Refresh records after create
      await fetchRecords();
    } catch (error) {
      console.error("[AttendancePage] Failed to submit attendance record:", error);
      if (error instanceof ApiError && error.status === 409) {
        toast.error("This student's attendance has already been taken for this session");
      } else if (error instanceof ApiError) {
        toast.error(`Failed to save record: ${error.message}`);
      } else {
        toast.error("Failed to save attendance record");
      }
    }
  };

  const handleEditSubmit = async (data: AttendanceFormData) => {
    if (!editingRecord) return;
    
    try {
      console.log("[AttendancePage] Updating record:", editingRecord._id, data);

      // PUT: full replacement, send all required fields
      const updatePayload = {
        id: editingRecord._id,
        uin: data.uin,
        sessionId: data.sessionId,
        operationUser: data.operationUser!,
      };

      console.log("[AttendancePage] Sending update payload:", updatePayload);
      const response = await attendanceApi.update(updatePayload);
      console.log("[AttendancePage] Update response:", response);
      
      // Close the dialog first
      setEditDialogOpen(false);
      setEditingRecord(null);
      
      // Show success message
      toast.success("Attendance record updated successfully");
      
      // Refresh records after update
      console.log("[AttendancePage] Refreshing records after update...");
      await fetchRecords();
      console.log("[AttendancePage] Records refreshed");
    } catch (error) {
      console.error("[AttendancePage] Failed to update attendance record:", error);
      if (error instanceof ApiError && error.status === 409) {
        toast.error("This student's attendance has already been taken for this session");
      } else if (error instanceof ApiError) {
        toast.error(`Failed to update record: ${error.message}`);
      } else {
        toast.error("Failed to update attendance record");
      }
      throw error; // Re-throw to keep dialog open on error
    }
  };

  const handleEdit = (record: Attendance) => {
    setEditingRecord(record);
    setEditDialogOpen(true);
  };

  const handleScanSuccess = (uin: string) => {
    setScannedUin(uin);
    setScannerOpen(false);
    toast.success(`UIN scanned: ${uin}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Attendance Records
        </h1>
        <p className="text-gray-600">
          Manage student attendance records with barcode/QR code scanning
          support.
        </p>
      </div>

      <AttendanceForm
        onSubmit={handleSubmit}
        onScannerOpen={() => setScannerOpen(true)}
        scannedUin={scannedUin}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Current Records
          </h2>
          <span className="text-sm text-gray-500">
            {isLoading
              ? "Loading..."
              : `${records?.length ?? 0} ${(records?.length ?? 0) === 1 ? "record" : "records"}`}
          </span>
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading attendance records...
          </div>
        ) : (
          <AttendanceTable
            records={records}
            onEdit={handleEdit}
          />
        )}
      </div>

      <Scanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <EditAttendanceDialog
        record={editingRecord}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}