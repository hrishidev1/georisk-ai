import React from "react";
import { useRasters, useDeleteRaster } from "@/hooks/use-rasters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Cpu, FileType, MapPin, Layers } from "lucide-react";
import { RunProcessorDialog } from "@/components/processing/run-processor-dialog";
import { RasterMapViewer } from "@/components/rasters/raster-map-viewer";
import { RasterStatsDialog } from "@/components/rasters/raster-stats-dialog";
import { toast } from "sonner";

interface RasterListProps {
  projectId: number;
}

export function RasterList({ projectId }: RasterListProps) {
  const { data: rasters, isLoading } = useRasters(projectId);
  const deleteRaster = useDeleteRaster(projectId);

  const handleDelete = (rasterId: number) => {
    if (confirm("Are you sure you want to delete this raster?")) {
      deleteRaster.mutate(rasterId, {
        onSuccess: () => toast.success("Raster deleted"),
        onError: () => toast.error("Failed to delete raster"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-64 rounded-[24px] border border-slate-200/80 p-6 bg-white" />
        ))}
      </div>
    );
  }

  if (!rasters || rasters.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm mb-4">
          <Layers className="h-8 w-8 text-slate-400 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-[#1A1D20] mb-2">No Rasters Found</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Upload a GeoTIFF dataset to begin geospatial processing and hazard forecasting.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {rasters.map((raster) => (
        <Card key={raster.id} className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 tracking-wider">
                  {raster.type}
                </span>
                {raster.source === "GENERATED" && (
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 tracking-wider">
                    PROCESSED
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-[#1A1D20]">{raster.name}</h3>
              {raster.description && (
                <p className="text-xs text-slate-500 line-clamp-1">{raster.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <RasterMapViewer raster={raster} />
              <RasterStatsDialog raster={raster} />
              <RunProcessorDialog rasterId={raster.id} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(raster.id)}
                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Spatial Details
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">CRS</span>
                  <span className="font-medium text-slate-700">{raster.crs || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution</span>
                  <span className="font-medium text-slate-700">
                    {raster.width && raster.height ? `${raster.width} × ${raster.height}` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pixel Size</span>
                  <span className="font-medium text-slate-700">
                    {raster.pixel_size_x ? `${raster.pixel_size_x.toFixed(4)}` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileType className="h-3 w-3" /> File Info
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-bold text-[#0B57D0]">{raster.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Size</span>
                  <span className="font-medium text-slate-700">
                    {raster.file_size ? `${(raster.file_size / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="font-medium text-slate-700">
                    {new Date(raster.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {raster.source === "GENERATED" && raster.processor && (
              <div className="col-span-2 pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu className="h-3 w-3" /> Data Provenance (Auto-tracked)
                </h4>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Processor Engine</span>
                    <span className="font-mono font-medium text-[#0B57D0] bg-blue-100 px-2 py-0.5 rounded-md">
                      {raster.processor} v{raster.processor_version}
                    </span>
                  </div>
                  {raster.processing_parameters && Object.keys(raster.processing_parameters).length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Parameters</span>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(raster.processing_parameters).map(([k, v]) => (
                          <div key={k} className="bg-white border border-slate-200 rounded p-1.5 flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">{k}</span>
                            <span className="font-mono text-slate-700">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
