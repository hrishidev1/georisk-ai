/** Mirrors backend schemas/auth.py — LoginRequest */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors backend schemas/auth.py — TokenResponse */
export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}
