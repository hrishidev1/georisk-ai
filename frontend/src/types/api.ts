/**
 * Standard API error shape returned by the FastAPI backend.
 * All AppException subclasses produce { detail: string }.
 */
export interface ApiError {
  detail: string;
}

/**
 * Extract the error message from an Axios error response.
 */
export function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as Record<string, unknown>).response === "object"
  ) {
    const response = (error as { response: { data?: ApiError } }).response;
    if (response.data?.detail) {
      return response.data.detail;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}
