"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Database, Cpu } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const formatSegment = (segment: string) => {
    if (segment === "dashboard") return "Project Repository";
    if (segment === "projects") return "Projects";
    if (segment === "settings") return "Configuration & Danger Zone";
    if (!isNaN(Number(segment))) return `Workspace #${segment}`;
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between px-6 glass-panel border-b border-slate-200/70">
      {/* Clean breadcrumb trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/dashboard"
          className="font-semibold text-slate-600 hover:text-[#0B57D0] transition-colors flex items-center gap-1.5"
        >
          <span>GeoRisk Studio</span>
        </Link>

        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;
          return (
            <React.Fragment key={href}>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-[#1A1D20] px-2 py-1 rounded-lg bg-slate-100/80 text-xs">
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-xs font-medium hover:text-[#0B57D0] transition-colors"
                >
                  {formatSegment(segment)}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Intelligent system indicators */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4EA] border border-emerald-100 text-[#0D652D] text-xs font-semibold shadow-2xs">
          <Database className="h-3.5 w-3.5" />
          <span>PostGIS EPSG:4326 Ready</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F6F8] text-slate-600 text-xs font-medium border border-slate-200/60">
          <Cpu className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden md:inline">Analytics Sandbox</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </header>
  );
}
