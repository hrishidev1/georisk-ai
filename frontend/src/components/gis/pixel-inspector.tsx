"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crosshair,
  Copy,
  Check,
  X,
  Loader2,
  Activity,
} from "lucide-react";
import type { RasterPointInspectionResponse } from "@/types/raster";
import { formatCoordinates } from "@/lib/gis/geodesy";
import { toast } from "sonner";

interface PixelInspectorProps {
  cursorCoords: [number, number] | null;
  clickedCoords: [number, number] | null;
  pointData: RasterPointInspectionResponse | null;
  isLoading: boolean;
  activeRasterName?: string | null;
  onClose: () => void;
}

export function PixelInspector({
  cursorCoords,
  clickedCoords,
  pointData,
  isLoading,
  activeRasterName,
  onClose,
}: PixelInspectorProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (lon: number, lat: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    setCopied(true);
    toast.success("Coordinates copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-80 md:w-92 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border-blue-200/80 p-4 space-y-3.5 z-20 transition-all animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#0B57D0]">
            <Crosshair className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1D20]">Coordinate &amp; Pixel Inspector</h4>
            <p className="text-[10px] text-slate-400">Click raster to sample values</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 rounded-full text-slate-400 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Realtime Cursor Location */}
      {cursorCoords && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Cursor Position (EPSG:4326)
            </span>
            <p className="text-xs font-mono font-medium text-slate-700 truncate">
              {formatCoordinates(cursorCoords[0], cursorCoords[1])}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleCopy(cursorCoords[0], cursorCoords[1])}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-[#0B57D0] hover:bg-blue-50 shrink-0"
            title="Copy Coordinates"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      )}

      {/* Point Sample Data */}
      {isLoading ? (
        <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col items-center justify-center gap-2 text-xs text-[#0B57D0]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Sampling raster pixel values...</span>
        </div>
      ) : pointData ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sampled Location
            </span>
            {activeRasterName && (
              <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-[#0B57D0]">
                {activeRasterName}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Status</span>
              <span
                className={`font-bold ${
                  pointData.is_valid ? "text-emerald-700" : "text-amber-600"
                }`}
              >
                {pointData.message || (pointData.is_valid ? "Valid" : "NoData")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">CRS</span>
              <span className="font-mono text-slate-700">{pointData.crs || "EPSG:4326"}</span>
            </div>
          </div>

          {/* Band Values Grid */}
          {pointData.values && Object.keys(pointData.values).length > 0 ? (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Band Output Values
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                {Object.entries(pointData.values).map(([bandKey, val]) => (
                  <div
                    key={bandKey}
                    className="p-2 rounded-xl bg-white border border-slate-200/80 flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{bandKey}</span>
                    <span className="text-xs font-mono font-bold text-[#0B57D0]">
                      {val !== null ? val.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "NoData"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">
              No band pixel values at this coordinate.
            </p>
          )}
        </div>
      ) : clickedCoords ? (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
          Click on an active raster layer to sample pixel values.
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100/60 text-center space-y-1">
          <Activity className="h-4 w-4 text-[#0B57D0] mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Inspector Active</p>
          <p className="text-[11px] text-slate-500">
            Click anywhere on the map to sample coordinates &amp; raster bands.
          </p>
        </div>
      )}
    </Card>
  );
}
