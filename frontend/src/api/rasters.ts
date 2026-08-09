import api from "@/lib/axios";
import type { RasterResponse, RasterCreate } from "@/types/raster";

export async function uploadRaster(
  projectId: number,
  data: RasterCreate,
  file: File
): Promise<RasterResponse> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("type", data.type);
  if (data.description) {
    formData.append("description", data.description);
  }
  formData.append("file", file);

  const response = await api.post<RasterResponse>(
    `/projects/${projectId}/rasters/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function listRasters(projectId: number): Promise<RasterResponse[]> {
  const response = await api.get<RasterResponse[]>(`/projects/${projectId}/rasters`);
  return response.data;
}

export async function getRaster(
  projectId: number,
  rasterId: number
): Promise<RasterResponse> {
  const response = await api.get<RasterResponse>(
    `/projects/${projectId}/rasters/${rasterId}`
  );
  return response.data;
}

export async function deleteRaster(
  projectId: number,
  rasterId: number
): Promise<void> {
  await api.delete(`/projects/${projectId}/rasters/${rasterId}`);
}
