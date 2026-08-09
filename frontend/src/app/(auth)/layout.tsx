import React from "react";
import { Globe } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#FAFBFC] p-6 sm:p-10 relative overflow-hidden">
      {/* Subtle decorative atmosphere background blur */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-blue-100/50 via-sky-50/20 to-transparent blur-3xl opacity-80" />

      <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-blue-600/20">
            <Globe className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              GeoRisk AI
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Spatial Intelligence
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#E8F0FE] px-3.5 py-1 text-xs font-semibold text-[#0B57D0]">
            v0.1.0-preview
          </span>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center my-8">
        <div className="w-full max-w-[440px] animate-in-fade">
          {children}
        </div>
      </main>

      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full text-xs text-slate-400 gap-4 pt-4 border-t border-slate-200/60">
        <p className="font-normal text-slate-500">
          &copy; {new Date().getFullYear()} GeoRisk AI. Engineered for analytical accuracy and clarity.
        </p>
        <div className="flex items-center space-x-6 text-slate-500 font-medium">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Security Protocol</span>
          <span>&bull;</span>
          <span className="hover:text-slate-800 transition-colors cursor-pointer">PostGIS Engine</span>
          <span>&bull;</span>
          <span className="hover:text-slate-800 transition-colors cursor-pointer">System Status</span>
        </div>
      </footer>
    </div>
  );
}
