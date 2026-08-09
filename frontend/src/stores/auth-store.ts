import { create } from "zustand";
import type { UserResponse } from "@/types/user";

const TOKEN_KEY = "georisk_token";

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  setUser: (user: UserResponse) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  login: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user });
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      set({
        token,
        isAuthenticated: !!token,
        isHydrated: true,
      });
    }
  },
}));
