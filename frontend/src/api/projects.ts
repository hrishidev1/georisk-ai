import api from "@/lib/axios";
import type {
  ProjectCreate,
  ProjectResponse,
  ProjectUpdate,
} from "@/types/project";

export async function listProjects(): Promise<ProjectResponse[]> {
  const response = await api.get<ProjectResponse[]>("/projects");
  return response.data;
}

export async function getProject(projectId: number): Promise<ProjectResponse> {
  const response = await api.get<ProjectResponse>(`/projects/${projectId}`);
  return response.data;
}

export async function createProject(
  data: ProjectCreate,
): Promise<ProjectResponse> {
  const response = await api.post<ProjectResponse>("/projects", data);
  return response.data;
}

export async function updateProject(
  projectId: number,
  data: ProjectUpdate,
): Promise<ProjectResponse> {
  const response = await api.patch<ProjectResponse>(
    `/projects/${projectId}`,
    data,
  );
  return response.data;
}

export async function deleteProject(projectId: number): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}
