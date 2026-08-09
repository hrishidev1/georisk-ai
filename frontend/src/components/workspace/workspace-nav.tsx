"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, MapPin, Layers, Activity, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceNavProps {
  projectId: number;
}

export function WorkspaceNav({ projectId }: WorkspaceNavProps) {
  const pathname = usePathname();

  const activeTabs = [
    {
      name: "Overview & Status",
      href: `/projects/${projectId}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Raster Imagery Catalog",
      href: `/projects/${projectId}/rasters`,
      icon: Layers,
      exact: true,
    },
    {
      name: "Hazard Forecasting Analytics",
      href: `/projects/${projectId}/processing`,
      icon: Activity,
      exact: true,
    },
    {
      name: "Configuration",
      href: `/projects/${projectId}/settings`,
      icon: Settings,
      exact: false,
    },
  ];

  const futureTabs = [
    { name: "Interactive Map & AOIs", icon: MapPin, sprint: "Sprint 2" },
  ];

  return (
    <nav className="flex items-center gap-2 border-b border-slate-200/70 overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-1.5 shrink-0">
        {activeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-[#E8F0FE] text-[#0B57D0] shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#1A1D20]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-[#0B57D0]" : "text-slate-400 group-hover:text-slate-700"
                )}
              />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="h-6 w-px bg-slate-200 mx-3 shrink-0" />

      {/* Reserved future GIS expansion placeholders */}
      <div className="flex items-center gap-2 select-none pointer-events-none opacity-65 shrink-0">
        {futureTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <div
              key={tab.name}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-slate-50 border border-slate-200/60 text-slate-500 whitespace-nowrap"
            >
              <Icon className="h-3.5 w-3.5 text-slate-400" />
              <span>{tab.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ml-0.5">
                <Lock className="h-2.5 w-2.5" />
                {tab.sprint}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
