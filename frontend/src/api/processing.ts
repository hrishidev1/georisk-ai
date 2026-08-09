import api from "@/lib/axios";
import type {
  ProcessingJobResponse,
  ProcessingRequest,
  ProcessingStatus,
} from "@/types/processing";

export async function createJob(
  data: ProcessingRequest
): Promise<ProcessingJobResponse> {
  const response = await api.post<ProcessingJobResponse>("/processing/jobs", data);
  return response.data;
}

export async function getJob(jobId: number): Promise<ProcessingJobResponse> {
  const response = await api.get<ProcessingJobResponse>(`/processing/jobs/${jobId}`);
  return response.data;
}

export async function listJobs(params?: {
  project_id?: number;
  raster_id?: number;
  status?: ProcessingStatus;
}): Promise<ProcessingJobResponse[]> {
  const response = await api.get<ProcessingJobResponse[]>("/processing/jobs", { params });
  return response.data;
}

export async function cancelJob(jobId: number): Promise<ProcessingJobResponse> {
  const response = await api.delete<ProcessingJobResponse>(`/processing/jobs/${jobId}`);
  return response.data;
}
