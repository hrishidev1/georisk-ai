"use client";

import React from "react";
import Link from "next/link";
import { Folder, ArrowUpRight, Calendar } from "lucide-react";
import type { ProjectResponse } from "@/types/project";
import { Card } from "@/components/ui/card";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: ProjectResponse;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      interactive
      className="group flex flex-col justify-between rounded-[22px] border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 min-h-[220px]"
    >
      <div className="space-y-4">
        {/* Header styling */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#0B57D0] shadow-2xs group-hover:bg-[#0B57D0] group-hover:text-white transition-colors duration-300">
            <Folder className="h-6 w-6" />
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              ID #{project.id}
            </span>
            <DeleteProjectDialog
              projectId={project.id}
              projectName={project.name}
            />
          </div>
        </div>

        {/* Title & description */}
        <div className="space-y-1.5 pt-1">
          <Link href={`/projects/${project.id}`} className="block focus:outline-none">
            <h3 className="text-lg font-bold tracking-tight text-[#1A1D20] group-hover:text-[#0B57D0] transition-colors flex items-center justify-between">
              <span className="truncate pr-2">{project.name}</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </h3>
          </Link>
          <p className="text-sm text-slate-500 line-clamp-2 font-normal leading-relaxed">
            {project.description || (
              <span className="italic text-slate-400">No project scope summary specified.</span>
            )}
          </p>
        </div>
      </div>

      {/* Card footer details */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5" title="Date Initialized">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Created {formatDate(project.created_at)}</span>
        </div>
        
        <Button asChild variant="link" className="p-0 h-auto text-xs text-[#0B57D0] font-semibold group-hover:underline">
          <Link href={`/projects/${project.id}`}>
            Open Study Area &rarr;
          </Link>
        </Button>
      </div>
    </Card>
  );
}
