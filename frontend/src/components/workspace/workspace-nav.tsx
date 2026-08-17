"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, MapPin, Layers, Activity } from "lucide-react";
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
      name: "Interactive GIS & AOIs",
      href: `/projects/${projectId}/map`,
      icon: MapPin,
      exact: false,
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
    </nav>
  );
}

