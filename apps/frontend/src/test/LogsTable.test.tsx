import { describe, it, expect, vi } from "vitest";
import { render, screen } from "./utils";
import userEvent from "@testing-library/user-event";
import { LogsTable } from "../components/LogsTable";
import type { AuditLog } from "../models/Log.model";

// Mock date-fns format
vi.mock("date-fns", () => ({
  format: (date: Date) => date.toISOString().split("T")[0],
}));

describe("LogsTable", () => {
  const mockLogs: AuditLog[] = [
    {
      _id: "log1",
      attendanceId: "1",
      operationUser: "John Doe",
      operationTime: "2026-02-08T10:00:00.000Z",
      action: "ADD",
      changes: [],
      before: null,
      after: {
        _id: "1",
        uin: "123456789",
        sessionId: "20260208",
        date: "2026-02-08T10:00:00.000Z",
        takenBy: "John Doe",
      },
    },
    {
      _id: "log2",
      attendanceId: "1",
      operationUser: "Jane Smith",
      operationTime: "2026-02-08T11:00:00.000Z",
      action: "EDIT",
      changes: [
        {
          field: "sessionId",
          oldValue: "20260208",
          newValue: "20260209",
        },
      ],
      before: {
        _id: "1",
        uin: "123456789",
        sessionId: "20260208",
        date: "2026-02-08T10:00:00.000Z",
        takenBy: "John Doe",
      },
      after: {
        _id: "1",
        uin: "123456789",
        sessionId: "20260209",
        date: "2026-02-08T10:00:00.000Z",
        takenBy: "John Doe",
      },
    },
  ];

  it("displays empty state when no logs", () => {
    render(<LogsTable logs={[]} />);

    expect(screen.getByText(/No audit logs found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Audit logs will appear here/i)
    ).toBeInTheDocument();
  });

  it("displays logs in a table", () => {
    render(<LogsTable logs={mockLogs} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("ADD")).toBeInTheDocument();
    expect(screen.getByText("EDIT")).toBeInTheDocument();
  });

  it("displays table headers", () => {
    render(<LogsTable logs={mockLogs} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Operation User")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("shows view button for each log entry", () => {
    render(<LogsTable logs={mockLogs} />);

    const viewButtons = screen.getAllByRole("button", { name: /View/i });
    expect(viewButtons).toHaveLength(2);
  });

  it("applies correct color classes for different actions", () => {
    const logsWithAllActions: AuditLog[] = [
      { ...mockLogs[0], action: "ADD" },
      { ...mockLogs[0], _id: "log3", action: "EDIT" },
      { ...mockLogs[0], _id: "log4", action: "REMOVE" },
    ];

    render(<LogsTable logs={logsWithAllActions} />);

    const addBadge = screen.getByText("ADD");
    const editBadge = screen.getByText("EDIT");
    const removeBadge = screen.getByText("REMOVE");

    expect(addBadge).toHaveClass("bg-green-100");
    expect(editBadge).toHaveClass("bg-[#FFF5F0]");
    expect(removeBadge).toHaveClass("bg-red-100");
  });
});
