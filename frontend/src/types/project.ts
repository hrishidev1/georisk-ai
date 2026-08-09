/** Mirrors backend schemas/project.py — ProjectCreate */
export interface ProjectCreate {
  name: string;
  description?: string | null;
}

/** Mirrors backend schemas/project.py — ProjectUpdate */
export interface ProjectUpdate {
  name?: string | null;
  description?: string | null;
}

/** Mirrors backend schemas/project.py — ProjectResponse */
export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
}
