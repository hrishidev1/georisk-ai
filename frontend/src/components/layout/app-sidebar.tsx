"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderKanban,
  MapPin,
  Layers,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out of your workspace session.");
    router.replace("/login");
  };

  const navItems = [
    {
      title: "Projects Hub",
      href: "/dashboard",
      icon: FolderKanban,
      active: pathname === "/dashboard",
      badge: "Active",
    },
    {
      title: "Interactive Maps",
      href: "#",
      icon: MapPin,
      active: false,
      locked: true,
      sprint: "Sprint 2",
    },
    {
      title: "Raster Catalogs",
      href: "#",
      icon: Layers,
      active: false,
      locked: true,
      sprint: "Sprint 2",
    },
    {
      title: "Risk Analytics",
      href: "#",
      icon: BarChart3,
      active: false,
      locked: true,
      sprint: "Sprint 3",
    },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between my-4 ml-4 rounded-[26px] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 ease-out z-30 shrink-0",
        isCollapsed ? "w-[84px] p-3.5" : "w-[268px] p-5"
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0B57D0] text-white shadow-md shadow-blue-600/20 group-hover:bg-[#1A73E8] transition-colors">
                <Globe className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-base font-bold tracking-tight text-[#1A1D20] leading-tight">
                  GeoRisk AI
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  PostGIS Engine
                </span>
              </div>
            </Link>
          )}

          {isCollapsed && (
            <Link href="/dashboard" className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B57D0] text-white shadow-md shadow-blue-600/20 hover:bg-[#1A73E8] transition-colors">
              <Globe className="h-5 w-5 stroke-[2.2]" />
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon_sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 hidden lg:flex shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspace Core
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.locked) {
              return (
                <div
                  key={item.title}
                  title={isCollapsed ? `${item.title} (${item.sprint})` : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-slate-400 select-none cursor-not-allowed opacity-60 bg-slate-50/50 border border-transparent",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between truncate">
                      <span className="truncate">{item.title}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        <Lock className="h-2.5 w-2.5" />
                        {item.sprint}
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                  item.active
                    ? "bg-[#E8F0FE] text-[#0B57D0] shadow-2xs"
                    : "text-slate-600 hover:bg-[#F4F6F8] hover:text-slate-900",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    item.active ? "text-[#0B57D0]" : "text-slate-500 group-hover:text-slate-800"
                  )}
                />
                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between truncate">
                    <span className="truncate">{item.title}</span>
                    {item.active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0B57D0]" />
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 transition-colors hover:bg-slate-100/70">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B57D0] font-bold text-white text-xs shadow-xs">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
              <div className="flex flex-col truncate">
                <span className="truncate text-xs font-semibold text-slate-800">
                  {user?.full_name || "Analyst Profile"}
                </span>
                <span className="truncate text-[11px] text-slate-500 font-mono">
                  {user?.email || "Authenticated"}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon_sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-[#B3261E] hover:bg-red-50 rounded-xl shrink-0 h-8 w-8"
              title="Sign out of workspace"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#B3261E] hover:bg-red-50 p-0"
            title="Sign out of workspace"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </aside>
  );
}
