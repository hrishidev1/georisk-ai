"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ["/login", "/register", "/"];

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated && !isPublicPath) {
        router.replace("/login");
      } else if (isAuthenticated && isPublicPath && pathname !== "/") {
        router.replace("/dashboard");
      } else {
        setIsReady(true);
      }
    }
  }, [isHydrated, isAuthenticated, isPublicPath, pathname, router]);

  if (!isHydrated || (!isReady && !isPublicPath)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FAFBFC]">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="relative flex items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#0B57D0] border-t-transparent" />
            <div className="absolute h-3 w-3 rounded-full bg-blue-100 animate-ping" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-xs font-semibold text-slate-700 tracking-tight uppercase">Secured Session</p>
            <p className="text-xs text-slate-500 font-normal">Verifying workspace permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
