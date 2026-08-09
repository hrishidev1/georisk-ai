"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { EditProjectForm } from "@/components/projects/edit-project-form";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WorkspaceSettingsPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = Number(params?.projectId);
  const { data: project } = useProject(projectId);

  if (!project) return null;

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Configuration Metadata Form */}
      <EditProjectForm project={project} />

      {/* Danger Zone */}
      <Card className="rounded-[28px] border-red-200/80 bg-[#FCE8E6]/40 shadow-sm overflow-hidden">
        <div className="p-7 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 text-[#B3261E]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-[#B3261E]">
              <AlertTriangle className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#8C1D18]">Danger Zone &amp; Irreversible Actions</h3>
              <p className="text-xs text-slate-600 font-normal">
                Destructive repository operations. Please exercise caution when performing structural deletion.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-[22px] bg-white border border-red-200/60 shadow-xs">
            <div className="space-y-1 max-w-xl">
              <h4 className="font-bold text-[#1A1D20] text-base">Eradicate Project Workspace</h4>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Permanently eliminate this study area along with all future associated AOI features, raster catalogs, and analysis output files.
              </p>
            </div>

            <DeleteProjectDialog
              projectId={project.id}
              projectName={project.name}
              onSuccess={() => router.replace("/dashboard")}
              trigger={
                <Button variant="destructive" className="rounded-full font-semibold px-6 h-11 text-xs shrink-0 bg-[#B3261E] hover:bg-[#9C1C14] text-white shadow-sm cursor-pointer">
                  Delete Study Area
                </Button>
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
