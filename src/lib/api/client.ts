import { getStoredStudyData } from "../persistence";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export interface ApiError {
  statusCode: number;
  message: string;
  detail?: any;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("poforge_jwt_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = "An error occurred while communicating with the server.";
      let detail = null;
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
        detail = errorData.detail;
      } catch (e) {
        // Fallback for non-JSON error
      }

      const statusMap: Record<number, string> = {
        400: "Invalid request parameters. Please verify input fields.",
        401: "Authentication required. Please sign in.",
        403: "You do not have permission to perform this action.",
        404: "Requested resource was not found.",
        409: "Conflict with current server state.",
        422: "Validation error. Submitted data is invalid.",
        429: "Too many requests. Please try again shortly.",
        500: "Service temporarily unavailable. Please retry.",
      };

      if (res.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("poforge_jwt_token");
        localStorage.removeItem("poforge_user_id");
        window.dispatchEvent(new CustomEvent("poforge_unauthorized", { detail: { status: 401 } }));
      }

      const friendlyMessage = statusMap[res.status] || errorMessage;
      const apiError: ApiError = {
        statusCode: res.status,
        message: friendlyMessage,
        detail,
      };
      throw apiError;
    }

    return (await res.json()) as T;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw {
      statusCode: 503,
      message: "Unable to connect to POForge backend service.",
      detail: error.message,
    } as ApiError;
  }
}
