/** Mirrors backend schemas/user.py — UserCreate */
export interface UserCreate {
  email: string;
  password: string;
  full_name?: string | null;
}

/** Mirrors backend schemas/user.py — UserResponse */
export interface UserResponse {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}
