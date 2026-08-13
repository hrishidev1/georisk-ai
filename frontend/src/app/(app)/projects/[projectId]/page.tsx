"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Layers,
  Cpu,
  Sparkles,
  CheckCircle2,
  Activity,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { useRasters } from "@/hooks/use-rasters";
import { useProcessingJobs } from "@/hooks/use-processing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RunProcessorDialog } from "@/components/processing/run-processor-dialog";
import type { ProcessingStatus } from "@/types/processing";

export default function WorkspaceOverviewPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params?.projectId);
  const { data: project } = useProject(projectId);
  const { data: rasters } = useRasters(projectId);
  const { data: jobs } = useProcessingJobs({ project_id: projectId }, 3000);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  if (!project) return null;

  const activeJobs =
    jobs?.filter(
      (j) =>
        j.status === "PENDING" ||
        j.status === "QUEUED" ||
        j.status === "RUNNING" ||
        j.status === "CANCELLING"
    ) || [];

  const completedJobs =
    jobs?.filter(
      (j) =>
        j.status === "COMPLETED" ||
        j.status === "FAILED" ||
        j.status === "CANCELLED"
    ) || [];

  const getStatusIcon = (status: ProcessingStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case "FAILED":
        return <AlertCircle className="h-3.5 w-3.5 text-red-600" />;
      case "CANCELLED":
        return <AlertCircle className="h-3.5 w-3.5 text-slate-500" />;
      case "RUNNING":
      case "CANCELLING":
        return <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: ProcessingStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200/60";
      case "CANCELLED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "RUNNING":
      case "CANCELLING":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
  };

  return (
    <div className="space-y-8">
      {/* Spatial Repository Overview Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[24px] p-7 border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vector Geometry Layer
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0D652D]">
                <MapPin className="h-5 w-5 stroke-[2]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1D20] tracking-tight">
              0 AOIs
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>SRID: EPSG:4326 PostGIS Table</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </Card>

        <Card className="rounded-[24px] p-7 border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Raster Catalog Feed
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#0B57D0]">
                <Layers className="h-5 w-5 stroke-[2]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1D20] tracking-tight">
              {rasters?.length ?? 0} GeoTIFFs
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate max-w-[150px]">
              {rasters && rasters.length > 0
                ? `Latest: ${rasters[0].name}`
                : "Upload via catalog"}
            </span>
            <Link
              href={`/projects/${projectId}/rasters`}
              className="text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              Manage
            </Link>
          </div>
        </Card>

        <Card className="rounded-[24px] p-7 border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Hazard Analytics Pipeline
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <Activity className="h-5 w-5 stroke-[2]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1D20] tracking-tight">
              {jobs?.length ?? 0} {jobs?.length === 1 ? "Job" : "Jobs"}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate max-w-[150px]">
              {activeJobs.length > 0
                ? `${activeJobs.length} active running`
                : jobs && jobs.length > 0
                ? `Latest: ${jobs[0].processor.toUpperCase()}`
                : "No active tasks"}
            </span>
            <Link
              href={`/projects/${projectId}/processing`}
              className="text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full hover:bg-purple-100 transition-colors"
            >
              Analytics
            </Link>
          </div>
        </Card>
      </div>

      {/* Analytical Engine Readiness & Live Processing Box */}
      <Card className="rounded-[30px] border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-transparent p-7 sm:p-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0] text-white shadow-xs">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1D20] tracking-tight">
                  Hazard Analytics &amp; Processing Engine
                </h3>
              </div>
              <p className="text-sm text-slate-500 font-normal leading-relaxed pl-10">
                Workspace <strong className="text-slate-800 font-semibold">&ldquo;{project.name}&rdquo;</strong> geospatial analytics pipelines for terrain derivatives and hazard forecasting.
              </p>
            </div>

            {activeJobs.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 border border-blue-200/60 shadow-2xs self-start">
                <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                <span>{activeJobs.length} ACTIVE {activeJobs.length === 1 ? "TASK" : "TASKS"}</span>
              </span>
            ) : jobs && jobs.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200/60 shadow-2xs self-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{completedJobs.length} JOBS PROCESSED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-4 py-2 text-xs font-bold text-[#0B57D0] border border-blue-200/60 shadow-2xs self-start">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>ENGINE READY</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-7 sm:p-8 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Active / Recent Task Summary */}
            <div className="p-6 rounded-[24px] border border-slate-200/70 bg-[#FAFBFC] flex flex-col justify-between gap-4 transition-colors hover:bg-slate-50/80">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#0B57D0]">
                      <Activity className="h-4 w-4 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1A1D20] text-sm">
                        Recent Processing Activity
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {jobs && jobs.length > 0
                          ? `${jobs.length} total tasks executed`
                          : "No tasks submitted yet"}
                      </p>
                    </div>
                  </div>
                  {activeJobs.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      Running
                    </span>
                  )}
                </div>

                {jobs && jobs.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {jobs.slice(0, 2).map((job) => (
                      <div
                        key={job.id}
                        className="rounded-xl border border-slate-200/60 bg-white p-3 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getStatusIcon(job.status)}
                          <span className="text-xs font-semibold text-slate-700 truncate">
                            {job.processor.toUpperCase()}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${getStatusBadge(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed font-normal pt-1">
                    Execute derivative terrain algorithms (Hillshade, Slope, Aspect) directly on your catalog rasters.
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Active: <strong className="text-slate-700">{activeJobs.length}</strong> | Completed: <strong className="text-slate-700">{completedJobs.length}</strong>
                </span>
                <Link
                  href={`/projects/${projectId}/processing`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B57D0] hover:text-blue-700"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Terrain & Processing Capabilities */}
            <div className="p-6 rounded-[24px] border border-slate-200/70 bg-[#FAFBFC] flex flex-col justify-between gap-4 transition-colors hover:bg-slate-50/80">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-[#0D652D]">
                    <Cpu className="h-4 w-4 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1D20] text-sm">
                      Geospatial Processors
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      High-performance GDAL &amp; Rasterio engines
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Raster processing workers calculate pixel derivatives, extract surface metrics, generate previews/thumbnails, and run hazard analytics with full provenance tracking.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Processors: Hillshade, Slope, Aspect, Color Relief, Contours
                </span>
                {!rasters || rasters.length === 0 ? (
                  <Link
                    href={`/projects/${projectId}/rasters`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D652D] hover:text-emerald-800"
                  >
                    <span>Upload Raster</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : rasters.length === 1 ? (
                  <RunProcessorDialog rasterId={rasters[0].id} />
                ) : (
                  <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2 rounded-full px-4 text-xs font-semibold"
                      >
                        <Activity className="h-4 w-4" />
                        Launch Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] rounded-3xl border-slate-200 shadow-xl">
                      <DialogHeader className="space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#0B57D0] shadow-sm">
                          <Layers className="h-6 w-6 stroke-[2]" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold text-[#1A1D20]">
                          Select Target Raster
                        </DialogTitle>
                        <DialogDescription className="text-center text-slate-500">
                          Choose a dataset from the catalog to submit for analytical processing.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="max-h-[320px] overflow-y-auto space-y-2 py-2 scrollbar-thin">
                        {rasters.map((raster) => (
                          <div
                            key={raster.id}
                            className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                                  {raster.type}
                                </span>
                                {raster.source === "GENERATED" && (
                                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                    Processed
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-[#1A1D20] truncate">
                                {raster.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {raster.width && raster.height
                                  ? `${raster.width} × ${raster.height} px`
                                  : "GeoTIFF"}
                                {raster.file_size
                                  ? ` • ${(raster.file_size / (1024 * 1024)).toFixed(1)} MB`
                                  : ""}
                              </p>
                            </div>

                            <div className="shrink-0">
                              <RunProcessorDialog rasterId={raster.id} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#0D652D] shrink-0" />
              <span>
                {jobs && jobs.length > 0
                  ? `${jobs.length} geospatial processing ${jobs.length === 1 ? "job" : "jobs"} recorded for Project #${project.id}.`
                  : `Analytics engine initialized and ready for Project #${project.id}.`}
              </span>
            </div>
            <Link
              href={`/projects/${projectId}/processing`}
              className="font-semibold text-[#0B57D0] hover:underline shrink-0"
            >
              Open Hazard Analytics &rarr;
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
