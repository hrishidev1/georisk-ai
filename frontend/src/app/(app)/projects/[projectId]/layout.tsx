"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { useProject } from "@/hooks/use-projects";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceNav } from "@/components/workspace/workspace-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params?.projectId);

  const { data: project, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <Skeleton className="h-6 w-36 rounded-full" />
          <div className="flex justify-between items-center gap-6">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-10 w-80 rounded-xl" />
              <Skeleton className="h-5 w-2/3 rounded-lg" />
            </div>
            <Skeleton className="h-14 w-64 rounded-2xl shrink-0" />
          </div>
        </div>
        <div className="flex gap-3 border-b border-slate-200 pb-3">
          <Skeleton className="h-10 w-36 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-[#FCE8E6]/70 p-10 text-center max-w-lg mx-auto my-12 space-y-5 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-[#B3261E] shadow-2xs">
          <AlertCircle className="h-7 w-7 stroke-[2]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#8C1D18]">Project Repository Unreachable</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {error?.message || "The designated geospatial workspace could not be found or your session lacks read privileges in PostGIS."}
          </p>
        </div>
        <div className="pt-2">
          <Button asChild variant="outline" className="rounded-full font-semibold border-slate-300 hover:bg-white text-xs px-6 h-10">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Repository Hub
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <WorkspaceHeader project={project} />
      <WorkspaceNav projectId={project.id} />
      <div className="pt-2 animate-in-fade">
        {children}
      </div>
    </div>
  );
}
