import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";
import type { RasterResponse } from "@/types/raster";
import { useRasterPreview, useRasterStatistics } from "@/hooks/use-rasters";

interface RasterStatsDialogProps {
  raster: RasterResponse;
}

export function RasterStatsDialog({ raster }: RasterStatsDialogProps) {
  const { data: previewUrl, isLoading: isPreviewLoading, isError: isPreviewError } = useRasterPreview(raster.project_id, raster.id);
  const { data: statsData, isLoading: isStatsLoading, isError: isStatsError } = useRasterStatistics(raster.project_id, raster.id);

  const primaryBand = statsData?.bands ? Object.keys(statsData.bands)[0] : null;
  const stats = primaryBand ? statsData!.bands[primaryBand] : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full px-4 text-xs font-semibold">
          <BarChart3 className="h-4 w-4" />
          Preview & Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-slate-50 overflow-hidden border-slate-200 shadow-xl rounded-3xl p-0">
        <DialogHeader className="p-5 border-b border-slate-100 bg-white">
          <DialogTitle className="text-lg font-bold text-[#1A1D20]">
            {raster.name} Preview & Statistics
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Preview</h3>
            <div className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center justify-center min-h-[256px]">
              {isPreviewLoading ? (
                <div className="flex flex-col items-center text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-xs">Loading preview...</span>
                </div>
              ) : isPreviewError ? (
                <div className="flex flex-col items-center text-red-400 gap-2">
                  <AlertCircle className="h-6 w-6" />
                  <span className="text-xs">Failed to load preview</span>
                </div>
              ) : previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt={`${raster.name} preview`}
                  className="max-w-full max-h-[300px] object-contain rounded-xl"
                />
              ) : (
                <span className="text-xs text-slate-400">No preview available</span>
              )}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Band Statistics</h3>

            {isStatsLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[256px] text-slate-400 gap-2 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Calculating statistics...</span>
              </div>
            ) : isStatsError ? (
              <div className="flex flex-col items-center justify-center min-h-[256px] text-red-400 gap-2 bg-white rounded-2xl border border-slate-200">
                <AlertCircle className="h-6 w-6" />
                <span className="text-xs">Failed to load statistics</span>
              </div>
            ) : stats ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Band</span>
                  <span className="text-sm font-bold text-[#0B57D0]">{primaryBand}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Minimum</span>
                    <div className="font-mono text-sm font-medium text-slate-700">{stats.min.toFixed(4)}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Maximum</span>
                    <div className="font-mono text-sm font-medium text-slate-700">{stats.max.toFixed(4)}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Mean</span>
                    <div className="font-mono text-sm font-medium text-slate-700">{stats.mean.toFixed(4)}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Std Dev</span>
                    <div className="font-mono text-sm font-medium text-slate-700">{stats.std.toFixed(4)}</div>
                  </div>
                  <div className="col-span-2 space-y-1 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Valid Pixels</span>
                    <div className="font-mono text-sm font-medium text-slate-700">{stats.valid_pixels.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[256px] text-slate-400 gap-2 bg-white rounded-2xl border border-slate-200">
                <span className="text-xs">No statistics available</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
