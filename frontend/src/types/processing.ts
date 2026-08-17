export type ProcessorType =
  | "metadata"
  | "hillshade"
  | "slope"
  | "aspect"
  | "color_relief"
  | "custom"
  | "clip"
  | "merge"
  | "reproject";
export type ProcessingStatus =
  | "PENDING"
  | "QUEUED"
  | "RUNNING"
  | "CANCELLING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface ProcessingRequest {
  raster_id: number;
  processor: ProcessorType;
  parameters: Record<string, unknown>;
}

export interface ProcessingJobResponse {
  id: number;
  raster_id: number;
  processor: ProcessorType;
  status: ProcessingStatus;
  progress: number;
  parameters: Record<string, unknown> | null;
  processor_version: string;
  executor: string;
  message: string | null;
  started_at: string | null;
  finished_at: string | null;
  cancel_requested_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessingJobListResponse {
  jobs: ProcessingJobResponse[];
}
