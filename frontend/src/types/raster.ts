export type RasterType = "dem" | "satellite" | "land_cover" | "slope" | "aspect" | "hillshade" | "prediction" | "uncertainty" | "other";
export type RasterSource = "UPLOADED" | "GENERATED";
export type RasterStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";

export interface RasterCreate {
  name: string;
  description?: string | null;
  type: RasterType;
}

export interface RasterResponse {
  id: number;
  project_id: number;
  parent_raster_id: number | null;
  name: string;
  description: string | null;
  type: RasterType;
  source: RasterSource;
  status: RasterStatus;
  file_path: string;
  crs: string | null;
  width: number | null;
  height: number | null;
  band_count: number | null;
  pixel_size_x: number | null;
  pixel_size_y: number | null;
  min_x: number | null;
  min_y: number | null;
  max_x: number | null;
  max_y: number | null;
  file_size: number | null;

  processor: string | null;
  processor_version: string | null;
  processing_parameters: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;
}
