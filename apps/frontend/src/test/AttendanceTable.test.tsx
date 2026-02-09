import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./utils";
import userEvent from "@testing-library/user-event";
import { AttendanceTable } from "../components/AttendanceTable";
import type { Attendance } from "../models/Attendance.model";

describe("AttendanceTable", () => {
  const mockRecords: Attendance[] = [
    {
      _id: "1",
      uin: "123456789",
      sessionId: "20260208",
      date: "2026-02-08T10:00:00.000Z",
      takenBy: "John Doe",
    },
    {
      _id: "2",
      uin: "987654321",
      sessionId: "20260208",
      date: "2026-02-08T10:05:00.000Z",
      takenBy: "Jane Smith",
    },
  ];

  it("displays empty state when no records", () => {
    render(<AttendanceTable records={[]} />);

    expect(screen.getByText(/No attendance records/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Add your first attendance record/i)
    ).toBeInTheDocument();
  });

  it("displays records in a table", () => {
    render(<AttendanceTable records={mockRecords} />);

    // Elements appear twice due to desktop table + mobile card views
    expect(screen.getAllByText("123456789").length).toBeGreaterThan(0);
    expect(screen.getAllByText("987654321").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20260208").length).toBeGreaterThan(0);
    expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jane Smith").length).toBeGreaterThan(0);
  });

  it("displays table headers", () => {
    render(<AttendanceTable records={mockRecords} />);

    expect(screen.getByText("UIN")).toBeInTheDocument();
    expect(screen.getByText("Session ID")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Taken By")).toBeInTheDocument();
  });

  it("shows edit button when onEdit is provided", () => {
    const mockOnEdit = vi.fn();
    render(<AttendanceTable records={mockRecords} onEdit={mockOnEdit} />);

    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("hides actions column when onEdit is not provided", () => {
    render(<AttendanceTable records={mockRecords} />);

    expect(screen.queryByText("Actions")).not.toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const mockOnEdit = vi.fn();
    render(<AttendanceTable records={mockRecords} onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByRole("button");
    await userEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockRecords[0]);
  });

  it("formats dates correctly", () => {
    render(<AttendanceTable records={mockRecords} />);

    expect(screen.getAllByText(/Feb 8, 2026/i).length).toBeGreaterThan(0);
  });
});
