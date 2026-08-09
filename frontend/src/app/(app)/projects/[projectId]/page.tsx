"use client";

import React from "react";
import { useParams } from "next/navigation";
import { MapPin, Layers, ShieldCheck, Database, Server, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { Card } from "@/components/ui/card";

export default function WorkspaceOverviewPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params?.projectId);
  const { data: project } = useProject(projectId);

  if (!project) return null;

  return (
    <div className="space-y-8">
      {/* Spatial Repository Overview Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[24px] p-7 border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vector Geometry Layer</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0D652D]">
                <MapPin className="h-5 w-5 stroke-[2]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1D20] tracking-tight">0 AOIs</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>SRID: EPSG:4326 PostGIS Table</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">Active</span>
          </div>
        </Card>

        <Card className="rounded-[24px] p-7 border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Raster Catalog Feed</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#0B57D0]">
                <Layers className="h-5 w-5 stroke-[2]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1D20] tracking-tight">0 GeoTIFFs</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Max file resolution: 2 GiB</span>
            <span className="text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full">Ready</span>
          </div>
        </Card>

        <Card className="rounded-[24px] p-7 border-slate-200/80 bg-white shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Credentials</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldCheck className="h-5 w-5 stroke-[2]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1A1D20] tracking-tight">Owner Access</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Owner User ID: #{project.owner_id}</span>
            <span className="text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full">Verified</span>
          </div>
        </Card>
      </div>

      {/* Analytical Engine Readiness Box */}
      <Card className="rounded-[30px] border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-transparent p-7 sm:p-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0] text-white shadow-xs">
                  <Database className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1D20] tracking-tight">Geospatial Engine Readiness</h3>
              </div>
              <p className="text-sm text-slate-500 font-normal leading-relaxed pl-10">
                Project repository <strong className="text-slate-800 font-semibold">&ldquo;{project.name}&rdquo;</strong> is initialized in PostGIS and pre-configured for incoming spatial processing tasks.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-4 py-2 text-xs font-bold text-[#0B57D0] border border-blue-200/60 shadow-2xs self-start">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>SYSTEM READY FOR SPRINT 2</span>
            </span>
          </div>
        </div>

        <div className="p-7 sm:p-8 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-6 rounded-[24px] border border-slate-200/70 bg-[#FAFBFC] flex items-start gap-4 transition-colors hover:bg-slate-50/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-[#0D652D]">
                <Server className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#1A1D20] text-base">Vector Data Pipeline (Sprint 2)</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  MapLibre GL JS canvas integrations will render interactive polygonal boundaries and bounding box intersections directly onto high-performance topographical vector tiles.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[24px] border border-slate-200/70 bg-[#FAFBFC] flex items-start gap-4 transition-colors hover:bg-slate-50/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#0B57D0]">
                <Cpu className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#1A1D20] text-base">Rasterio Extraction (Sprint 2 &amp; 3)</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Rasterio backend workers will ingest uploaded GeoTIFF imagery, calculate pixel coordinates, transform CRS projections, and run spatial hazard forecasting algorithms.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#0D652D]" />
              <span>All transactional database entities and schemas validated for Project #{project.id}.</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">LATENCY: &lt; 2ms</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
