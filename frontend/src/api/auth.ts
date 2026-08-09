import api from "@/lib/axios";
import type { LoginRequest, TokenResponse } from "@/types/auth";
import type { UserCreate, UserResponse } from "@/types/user";

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/login", data);
  return response.data;
}

export async function register(data: UserCreate): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/auth/register", data);
  return response.data;
}

export async function getMe(): Promise<UserResponse> {
  const response = await api.get<UserResponse>("/auth/me");
  return response.data;
}
