// API Service for fake_hereIllinois backend
const API_BASE_URL = "https://api.here.illinihouse.space";

// Generic API error handler
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] Fetching: ${url}`, options);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    console.log(`[API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`[API] Error response:`, errorData);
      throw new ApiError(
        errorData?.message || `HTTP error ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    console.log(`[API] Response data:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Fetch error:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred"
    );
  }
}

// Attendance API
export const attendanceApi = {
  // Get all attendance records
  getAll: async () => {
    return fetchApi<any>("/attendance");
  },

  // Create new attendance record
  create: async (data: {
    uin: string;
    sessionId: string;
    takenBy: string;
  }) => {
    return fetchApi<any>("/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update attendance record (PUT: full replacement, operationUser becomes takenBy, date is recalculated)
  update: async (data: {
    id: string;
    uin: string;
    sessionId: string;
    operationUser: string;
  }) => {
    const { id, ...updateData } = data;
    return fetchApi<any>(`/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  },
};

// Audit Log API
export const auditLogApi = {
  // Get all audit logs
  getAll: async () => {
    return fetchApi<any>("/logs");
  },
};