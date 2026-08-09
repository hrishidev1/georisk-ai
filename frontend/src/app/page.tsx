"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isHydrated, isAuthenticated, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5 p-8 rounded-3xl bg-white border border-slate-100 shadow-lg">
        <div className="relative flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <div className="absolute h-4 w-4 rounded-full bg-blue-50/50 animate-pulse" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold text-slate-800 tracking-tight">Launching GeoRisk AI</p>
          <p className="text-xs text-slate-500 font-normal">Initializing geospatial intelligence environment...</p>
        </div>
      </div>
    </div>
  );
}
