"use client";

import React from "react";
import type { ProjectResponse } from "@/types/project";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, AlertCircle } from "lucide-react";

interface ProjectListProps {
  projects?: ProjectResponse[];
  isLoading: boolean;
  error: Error | null;
}

export function ProjectList({ projects, isLoading, error }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-[22px] border border-slate-200/70 bg-white p-7 space-y-6 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-red-200/80 bg-[#FCE8E6]/60 p-8 text-center max-w-lg mx-auto my-8 space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-[#B3261E]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-[#8C1D18]">Unable to Connect to Repository</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {error.message || "Failed to synchronize geospatial project records from the FastAPI endpoint. Please verify server status."}
        </p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-[32px] border border-slate-200/80 bg-white p-12 text-center max-w-2xl mx-auto my-6 space-y-6 shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E8F0FE] text-[#0B57D0] shadow-md shadow-blue-500/10">
          <FolderOpen className="h-10 w-10 stroke-[1.8]" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-[#1A1D20]">No spatial study areas initialized</h3>
          <p className="text-sm text-slate-500 font-normal leading-relaxed">
            Create your first project repository to begin organizing geographic areas of interest, raster catalogs, and hazard forecasting simulations.
          </p>
        </div>
        <div className="pt-2">
          <CreateProjectDialog />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in-fade">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
