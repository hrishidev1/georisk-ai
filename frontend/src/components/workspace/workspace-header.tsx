"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Folder, Calendar, Clock, Database } from "lucide-react";
import type { ProjectResponse } from "@/types/project";
import { Button } from "@/components/ui/button";

interface WorkspaceHeaderProps {
  project: ProjectResponse;
}

export function WorkspaceHeader({ project }: WorkspaceHeaderProps) {
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 border-b border-slate-200/70 pb-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-9 px-3.5 rounded-full text-slate-500 hover:text-[#1A1D20] hover:bg-slate-100 -ml-2"
        >
          <Link href="/dashboard" className="flex items-center gap-1.5 font-medium text-xs">
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>All Study Areas</span>
          </Link>
        </Button>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 py-1 text-xs font-semibold text-[#0B57D0] shadow-2xs">
          <Database className="h-3.5 w-3.5" />
          <span>PostGIS ID #{project.id}</span>
        </span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#0B57D0] shadow-2xs border border-blue-100/50">
              <Folder className="h-6 w-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1D20] leading-tight">
              {project.name}
            </h1>
          </div>
          <p className="text-sm text-slate-600 pl-1 font-normal leading-relaxed">
            {project.description || (
              <span className="italic text-slate-400">
                No workspace description specified. You can configure analytical parameters in settings.
              </span>
            )}
          </p>
        </div>

        {/* Soft status timestamp pills */}
        <div className="flex flex-col sm:flex-row gap-3 text-xs font-medium text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-[#0D652D]">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <span>Created: <strong className="text-slate-800 font-semibold">{formatDateTime(project.created_at)}</strong></span>
          </div>
          <div className="hidden sm:inline text-slate-200 font-light">&vert;</div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-[#0B57D0]">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <span>Updated: <strong className="text-slate-800 font-semibold">{formatDateTime(project.updated_at)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
