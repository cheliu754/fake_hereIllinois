import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "./utils";
import userEvent from "@testing-library/user-event";
import { AttendanceForm } from "../components/AttendanceForm";

describe("AttendanceForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnScannerOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(
      <AttendanceForm
        onSubmit={mockOnSubmit}
        onScannerOpen={mockOnScannerOpen}
      />
    );

    expect(screen.getByLabelText(/UIN/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Session ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Taken By/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Record/i })).toBeInTheDocument();
  });

  it("opens scanner when scan button is clicked", async () => {
    render(
      <AttendanceForm
        onSubmit={mockOnSubmit}
        onScannerOpen={mockOnScannerOpen}
      />
    );

    const scanButton = screen.getByTitle(/Scan barcode or QR code/i);
    await userEvent.click(scanButton);

    expect(mockOnScannerOpen).toHaveBeenCalledTimes(1);
  });

  it("submits form with entered data", async () => {
    render(
      <AttendanceForm
        onSubmit={mockOnSubmit}
        onScannerOpen={mockOnScannerOpen}
      />
    );

    const uinInput = screen.getByLabelText(/UIN/i);
    const sessionIdInput = screen.getByLabelText(/Session ID/i);
    const takenByInput = screen.getByLabelText(/Taken By/i);

    await userEvent.type(uinInput, "123456789");
    await userEvent.type(sessionIdInput, "20260208");
    await userEvent.type(takenByInput, "John Doe");

    const submitButton = screen.getByRole("button", { name: /Add Record/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      uin: "123456789",
      sessionId: "20260208",
      takenBy: "John Doe",
    });
  });

  it("clears only UIN field after submission", async () => {
    render(
      <AttendanceForm
        onSubmit={mockOnSubmit}
        onScannerOpen={mockOnScannerOpen}
      />
    );

    const uinInput = screen.getByLabelText(/UIN/i);
    const sessionIdInput = screen.getByLabelText(/Session ID/i);
    const takenByInput = screen.getByLabelText(/Taken By/i);

    await userEvent.type(uinInput, "123456789");
    await userEvent.type(sessionIdInput, "20260208");
    await userEvent.type(takenByInput, "John Doe");

    const submitButton = screen.getByRole("button", { name: /Add Record/i });
    await userEvent.click(submitButton);

    expect(uinInput).toHaveValue("");
    expect(sessionIdInput).toHaveValue("20260208");
    expect(takenByInput).toHaveValue("John Doe");
  });

  it("populates UIN from scannedUin prop", () => {
    render(
      <AttendanceForm
        onSubmit={mockOnSubmit}
        onScannerOpen={mockOnScannerOpen}
        scannedUin="987654321"
      />
    );

    const uinInput = screen.getByLabelText(/UIN/i);
    expect(uinInput).toHaveValue("987654321");
  });

  it("updates UIN when scannedUin prop changes", () => {
    const { rerender } = render(
      <AttendanceForm
        onSubmit={mockOnSubmit}
        onScannerOpen={mockOnScannerOpen}
      />
    );

    const uinInput = screen.getByLabelText(/UIN/i);
    expect(uinInput).toHaveValue("");

    rerender(
      <AttendanceForm
        onSubmit={mockOnSubmit}
        onScannerOpen={mockOnScannerOpen}
        scannedUin="111222333"
      />
    );

    expect(uinInput).toHaveValue("111222333");
  });

  it("requires all fields before submission", async () => {
    render(
      <AttendanceForm
        onSubmit={mockOnSubmit}
        onScannerOpen={mockOnScannerOpen}
      />
    );

    const submitButton = screen.getByRole("button", { name: /Add Record/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
