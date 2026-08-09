"use client";

import { useProjects } from "@/hooks/use-projects";
import { ProjectList } from "@/components/projects/project-list";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { FolderKanban, Sparkles, Server } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: projects, isLoading, error } = useProjects();

  return (
    <div className="space-y-10 pb-12">
      {/* Spacious Header with Intelligent Hierarchy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/70 pb-8">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-3.5 py-1 text-xs font-semibold text-[#0B57D0]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Spatial Intelligence Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1D20]">
            Project Repositories
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed font-normal">
            Manage your geospatial study regions, vector boundary layers, and raster hazard forecasting models. All projects are backed by PostGIS transactions.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <CreateProjectDialog />
        </div>
      </div>

      {/* Analytics Summary Banner */}
      {!isLoading && !error && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 bg-[#FAFBFC] border-slate-200/60 rounded-2xl flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0B57D0]">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1A1D20]">{projects.length}</div>
              <div className="text-xs font-medium text-slate-500">Active Study Areas</div>
            </div>
          </Card>

          <Card className="p-5 bg-[#FAFBFC] border-slate-200/60 rounded-2xl flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-[#0D652D]">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1A1D20]">100%</div>
              <div className="text-xs font-medium text-slate-500">PostGIS Sync Status</div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Project Repository Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1A1D20] tracking-tight">
            Recent Workspaces
          </h2>
          <span className="text-xs font-medium text-slate-400 font-mono">
            {projects?.length ?? 0} total entries
          </span>
        </div>

        <ProjectList
          projects={projects}
          isLoading={isLoading}
          error={error as Error | null}
        />
      </div>
    </div>
  );
}
