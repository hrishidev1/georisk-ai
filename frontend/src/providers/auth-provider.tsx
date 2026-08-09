"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/hooks/use-auth";

/**
 * Hydrates the auth store from localStorage on mount,
 * then validates the token by calling GET /auth/me.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // This validates the stored token against the backend
  useCurrentUser();

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
