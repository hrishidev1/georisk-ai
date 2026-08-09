import * as React from "react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full bg-[#FAFBFC] overflow-hidden">
        {/* Floating rounded sidebar on desktop */}
        <AppSidebar />

        {/* Main interactive content workspace */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Header />
          <main className="flex-1 px-6 sm:px-10 py-8 max-w-7xl w-full mx-auto animate-in-fade">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
