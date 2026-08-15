import api from "@/lib/axios";
import type { AOICreate, AOIResponse, AOIUpdate } from "@/types/aoi";

export async function listAOIs(projectId: number): Promise<AOIResponse[]> {
  const response = await api.get<AOIResponse[]>(`/projects/${projectId}/aois`);
  return response.data;
}

export async function getAOI(
  projectId: number,
  aoiId: number
): Promise<AOIResponse> {
  const response = await api.get<AOIResponse>(
    `/projects/${projectId}/aois/${aoiId}`
  );
  return response.data;
}

export async function createAOI(
  projectId: number,
  data: AOICreate
): Promise<AOIResponse> {
  const response = await api.post<AOIResponse>(
    `/projects/${projectId}/aois`,
    data
  );
  return response.data;
}

export async function updateAOI(
  projectId: number,
  aoiId: number,
  data: AOIUpdate
): Promise<AOIResponse> {
  const response = await api.patch<AOIResponse>(
    `/projects/${projectId}/aois/${aoiId}`,
    data
  );
  return response.data;
}

export async function deleteAOI(
  projectId: number,
  aoiId: number
): Promise<void> {
  await api.delete(`/projects/${projectId}/aois/${aoiId}`);
}
