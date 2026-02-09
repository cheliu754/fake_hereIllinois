import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "./utils";
import { LogsPage } from "../pages/LogsPage";
import { server } from "./setup";
import { http, HttpResponse } from "msw";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock date-fns format
vi.mock("date-fns", () => ({
  format: (date: Date) => new Date(date).toLocaleDateString(),
}));

describe("LogsPage", () => {
  it("renders page title and description", async () => {
    render(<LogsPage />);

    expect(screen.getByRole("heading", { name: /Audit Logs/i })).toBeInTheDocument();
    expect(
      screen.getByText(/View and track all changes/i)
    ).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<LogsPage />);

    expect(screen.getByText(/Loading audit logs/i)).toBeInTheDocument();
  });

  it("loads and displays audit logs", async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getAllByText("John Doe")).toHaveLength(2);
    });

    expect(screen.getAllByText("ADD")).toHaveLength(2);
  });

  it("displays log count after loading", async () => {
    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 logs/i)).toBeInTheDocument();
    });
  });

  it("shows error toast when fetch fails", async () => {
    const { toast } = await import("sonner");

    server.use(
      http.get("https://api.here.illinihouse.space/logs", () => {
        return HttpResponse.json({ message: "Server error" }, { status: 500 });
      })
    );

    render(<LogsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("handles empty logs gracefully", async () => {
    server.use(
      http.get("https://api.here.illinihouse.space/logs", () => {
        return HttpResponse.json([]);
      })
    );

    render(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No audit logs found/i)).toBeInTheDocument();
    });
  });
});
