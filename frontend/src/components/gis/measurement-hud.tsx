"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ruler, Maximize2, X, RotateCcw } from "lucide-react";
import {
  calculatePolylineDistance,
  calculatePolygonArea,
  formatDistance,
  formatArea,
} from "@/lib/gis/geodesy";

interface MeasurementHUDProps {
  mode: "measure_distance" | "measure_area";
  points: [number, number][];
  cursorPos: [number, number] | null;
  onClear: () => void;
  onClose: () => void;
}

export function MeasurementHUD({
  mode,
  points,
  cursorPos,
  onClear,
  onClose,
}: MeasurementHUDProps) {
  const activePoints = useMemo(() => {
    if (!cursorPos) return points;
    return [...points, cursorPos];
  }, [points, cursorPos]);

  const measurementResult = useMemo(() => {
    if (mode === "measure_distance") {
      if (activePoints.length < 2) return null;
      const distance = calculatePolylineDistance(activePoints);
      return {
        primary: formatDistance(distance),
        detail: `${activePoints.length} vertices • Geodesic path`,
      };
    } else {
      if (activePoints.length < 3) return null;
      const area = calculatePolygonArea(activePoints);
      const formatted = formatArea(area);
      return {
        primary: formatted.primary,
        detail: `${formatted.hectares} • ${formatted.sqKm}`,
      };
    }
  }, [mode, activePoints]);

  return (
    <Card className="rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border-slate-200/80 p-3 flex items-center gap-3 z-20 transition-all animate-in fade-in slide-in-from-top-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#0B57D0] shrink-0">
        {mode === "measure_distance" ? (
          <Ruler className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </div>

      <div className="space-y-0.5 min-w-[140px]">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
          {mode === "measure_distance" ? "Distance Measurement" : "Area Measurement"}
        </span>
        <div className="text-sm font-bold text-[#1A1D20]">
          {measurementResult ? (
            <span>{measurementResult.primary}</span>
          ) : (
            <span className="text-slate-400 font-normal text-xs">
              Click map to start ({mode === "measure_distance" ? "2+ pts" : "3+ pts"})
            </span>
          )}
        </div>
        {measurementResult && (
          <span className="text-[10px] text-slate-400 font-mono block">
            {measurementResult.detail}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 border-l border-slate-100 pl-2">
        {points.length > 0 && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClear}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700"
            title="Reset Measurement"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700"
          title="Close Measurement Tool"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
