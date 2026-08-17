"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Edit3,
  Trash2,
  Focus,
  X,
  Maximize2,
  Layers,
} from "lucide-react";
import type { AOIResponse } from "@/types/aoi";
import { calculatePolygonArea, formatArea } from "@/lib/gis/geodesy";

interface AOIInspectorProps {
  aoi: AOIResponse | null;
  onClose: () => void;
  onStartEdit: () => void;
  onZoomToAOI: (aoi: AOIResponse) => void;
  onDeleteAOI: (aoiId: number) => void;
}

export function AOIInspector({
  aoi,
  onClose,
  onStartEdit,
  onZoomToAOI,
  onDeleteAOI,
}: AOIInspectorProps) {
  const coords = useMemo(() => {
    if (!aoi) return [];
    return aoi.feature.geometry.coordinates[0] || [];
  }, [aoi]);

  const areaInfo = useMemo(() => {
    if (coords.length < 3) return null;
    const sqMeters = calculatePolygonArea(coords as [number, number][]);
    return formatArea(sqMeters);
  }, [coords]);

  if (!aoi) return null;

  return (
    <Card className="w-80 md:w-96 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border-amber-200/80 p-4 space-y-3.5 z-20 transition-all animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-amber-100/80 px-2 py-0.5 text-[9px] font-bold text-amber-800 uppercase tracking-wider">
              Selected Area of Interest
            </span>
            <h4 className="text-sm font-bold text-[#1A1D20] truncate">{aoi.name}</h4>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-700 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Description */}
      {aoi.description && (
        <p className="text-xs text-slate-600 font-normal leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {aoi.description}
        </p>
      )}

      {/* Spatial Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
            <Maximize2 className="h-3 w-3" />
            <span>Geodesic Area</span>
          </div>
          <p className="text-xs font-bold text-slate-800">
            {areaInfo ? areaInfo.primary : "N/A"}
          </p>
          {areaInfo && (
            <p className="text-[10px] text-slate-400 font-mono">
              {areaInfo.hectares} • {areaInfo.sqKm}
            </p>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
            <Layers className="h-3 w-3" />
            <span>Geometry</span>
          </div>
          <p className="text-xs font-bold text-slate-800">
            {coords.length > 0 ? coords.length - 1 : 0} Vertices
          </p>
          <p className="text-[10px] text-slate-400 font-mono">SRID EPSG:4326</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <Button
          size="sm"
          onClick={onStartEdit}
          className="flex-1 h-8.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Edit Geometry</span>
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => onZoomToAOI(aoi)}
          className="h-8.5 w-8.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
          title="Zoom to Extent"
        >
          <Focus className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => onDeleteAOI(aoi.id)}
          className="h-8.5 w-8.5 rounded-xl border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50"
          title="Delete AOI"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
