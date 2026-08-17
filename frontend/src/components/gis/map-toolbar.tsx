"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  MousePointer,
  PenTool,
  Ruler,
  Maximize2,
  Crosshair,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type GISToolMode =
  | "navigate"
  | "draw_aoi"
  | "edit_aoi"
  | "measure_distance"
  | "measure_area"
  | "inspect_pixel";

interface MapToolbarProps {
  activeTool: GISToolMode;
  onSelectTool: (tool: GISToolMode) => void;
  // Drawing state
  isDrawing: boolean;
  drawPointCount: number;
  onFinishDrawing?: () => void;
  onCancelDrawing?: () => void;
  // Editing state
  isEditing: boolean;
  editPointCount: number;
  onSaveEditing?: () => void;
  onCancelEditing?: () => void;
  isSavingEdit?: boolean;
  // Measuring state
  isMeasuring: boolean;
  measurePointCount: number;
  onClearMeasurement?: () => void;
}

export function MapToolbar({
  activeTool,
  onSelectTool,
  isDrawing,
  drawPointCount,
  onFinishDrawing,
  onCancelDrawing,
  isEditing,
  editPointCount,
  onSaveEditing,
  onCancelEditing,
  isSavingEdit,
  isMeasuring,
  measurePointCount,
  onClearMeasurement,
}: MapToolbarProps) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-lg border border-amber-200/80">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-xs font-semibold text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Editing Geometry ({editPointCount} vertices)</span>
        </div>

        <Button
          size="sm"
          onClick={onSaveEditing}
          disabled={isSavingEdit || editPointCount < 3}
          className="h-8 rounded-xl bg-[#0D652D] hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-xs disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Save Changes</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onCancelEditing}
          disabled={isSavingEdit}
          className="h-8 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs gap-1"
        >
          <X className="h-3.5 w-3.5" />
          <span>Discard</span>
        </Button>
      </div>
    );
  }

  if (isDrawing) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-lg border border-blue-200/80">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-xs font-semibold text-[#0B57D0]">
          <PenTool className="h-3.5 w-3.5 text-blue-600 animate-bounce" />
          <span>
            {drawPointCount} {drawPointCount === 1 ? "point" : "points"} placed (min 3)
          </span>
        </div>

        <Button
          size="sm"
          onClick={onFinishDrawing}
          disabled={drawPointCount < 3}
          className="h-8 rounded-xl bg-[#0B57D0] hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-xs disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Finish AOI</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onCancelDrawing}
          className="h-8 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs gap-1"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-lg border border-slate-200/80">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onSelectTool("navigate")}
        className={cn(
          "h-8.5 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-colors",
          activeTool === "navigate"
            ? "bg-[#E8F0FE] text-[#0B57D0] shadow-2xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#1A1D20]"
        )}
        title="Navigate & Select Features"
      >
        <MousePointer className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Select</span>
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onSelectTool("draw_aoi")}
        className={cn(
          "h-8.5 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-colors",
          activeTool === "draw_aoi"
            ? "bg-[#E8F0FE] text-[#0B57D0] shadow-2xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#1A1D20]"
        )}
        title="Draw New Area of Interest Polygon"
      >
        <PenTool className="h-3.5 w-3.5" />
        <span>Draw AOI</span>
      </Button>

      <div className="h-4 w-px bg-slate-200 mx-0.5" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onSelectTool("measure_distance")}
        className={cn(
          "h-8.5 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-colors",
          activeTool === "measure_distance"
            ? "bg-[#E8F0FE] text-[#0B57D0] shadow-2xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#1A1D20]"
        )}
        title="Measure Distance along Path"
      >
        <Ruler className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Distance</span>
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onSelectTool("measure_area")}
        className={cn(
          "h-8.5 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-colors",
          activeTool === "measure_area"
            ? "bg-[#E8F0FE] text-[#0B57D0] shadow-2xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#1A1D20]"
        )}
        title="Measure Geodesic Area"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Area</span>
      </Button>

      <div className="h-4 w-px bg-slate-200 mx-0.5" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onSelectTool("inspect_pixel")}
        className={cn(
          "h-8.5 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-colors",
          activeTool === "inspect_pixel"
            ? "bg-[#E8F0FE] text-[#0B57D0] shadow-2xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#1A1D20]"
        )}
        title="Inspect Raster Values & Coordinates"
      >
        <Crosshair className="h-3.5 w-3.5" />
        <span>Inspect</span>
      </Button>

      {isMeasuring && measurePointCount > 0 && onClearMeasurement && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearMeasurement}
          className="h-8 px-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs ml-1"
          title="Clear Measurement"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
