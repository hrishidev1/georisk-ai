"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Layers } from "lucide-react";
import { RasterList } from "@/components/rasters/raster-list";
import { UploadRasterDialog } from "@/components/rasters/upload-raster-dialog";

export default function RastersPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params?.projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#0B57D0]">
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1D20]">Raster Imagery Catalog</h2>
          </div>
          <p className="text-sm text-slate-500 pl-10">
            Upload, manage, and inspect geospatial raster datasets (GeoTIFFs).
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <UploadRasterDialog projectId={projectId} />
        </div>
      </div>

      <RasterList projectId={projectId} />
    </div>
  );
}
