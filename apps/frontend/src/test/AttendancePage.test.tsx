import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "./utils";
import userEvent from "@testing-library/user-event";
import { AttendancePage } from "../pages/AttendancePage";
import { server } from "./setup";
import { http, HttpResponse } from "msw";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AttendancePage", () => {
  it("renders page title and description", async () => {
    render(<AttendancePage />);

    expect(screen.getByRole("heading", { name: /Attendance Records/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Manage student attendance records/i)
    ).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<AttendancePage />);

    expect(screen.getByText(/Loading attendance records/i)).toBeInTheDocument();
  });

  it("loads and displays attendance records", async () => {
    render(<AttendancePage />);

    // Elements appear twice due to desktop table + mobile card views
    await waitFor(() => {
      expect(screen.getAllByText("123456789").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("987654321").length).toBeGreaterThan(0);
    expect(screen.getAllByText("456789123").length).toBeGreaterThan(0);
  });

  it("displays record count after loading", async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText(/3 records/i)).toBeInTheDocument();
    });
  });

  it("shows error toast when fetch fails", async () => {
    const { toast } = await import("sonner");

    server.use(
      http.get("https://api.here.illinihouse.space/attendance", () => {
        return HttpResponse.json({ message: "Server error" }, { status: 500 });
      })
    );

    render(<AttendancePage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("submits new attendance record", async () => {
    const { toast } = await import("sonner");

    render(<AttendancePage />);

    // Wait for records to load (elements appear twice due to desktop + mobile views)
    await waitFor(() => {
      expect(screen.getAllByText("123456789").length).toBeGreaterThan(0);
    });

    const uinInput = screen.getByLabelText(/UIN/i);
    const sessionIdInput = screen.getByLabelText(/Session ID/i);
    const takenByInput = screen.getByLabelText(/Taken By/i);

    await userEvent.type(uinInput, "111222333");
    await userEvent.type(sessionIdInput, "20260209");
    await userEvent.type(takenByInput, "Test User");

    const submitButton = screen.getByRole("button", { name: /Add Record/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Attendance record added successfully"
      );
    });
  });

  it("handles empty records gracefully", async () => {
    server.use(
      http.get("https://api.here.illinihouse.space/attendance", () => {
        return HttpResponse.json([]);
      })
    );

    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText(/No attendance records/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/0 records/i)).toBeInTheDocument();
  });
});
