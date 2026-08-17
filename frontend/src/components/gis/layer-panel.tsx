"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Layers,
  MapPin,
  Eye,
  EyeOff,
  Sliders,
  Focus,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import type { RasterResponse } from "@/types/raster";
import type { AOIResponse } from "@/types/aoi";
import { cn } from "@/lib/utils";

interface LayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Rasters
  rasters: RasterResponse[] | undefined;
  activeRasterId: number | null;
  onSelectActiveRaster: (rasterId: number | null) => void;
  rasterVisibility: Record<number, boolean>;
  onToggleRasterVisibility: (rasterId: number) => void;
  rasterOpacity: Record<number, number>;
  onChangeRasterOpacity: (rasterId: number, opacity: number) => void;
  onZoomToRaster: (raster: RasterResponse) => void;
  // AOIs
  aois: AOIResponse[] | undefined;
  isAOILayerVisible: boolean;
  onToggleAOILayerVisible: () => void;
  selectedAoiId: number | null;
  onSelectAOI: (aoiId: number | null) => void;
  onZoomToAOI: (aoi: AOIResponse) => void;
  onDeleteAOI: (aoiId: number) => void;
}

export function LayerPanel({
  isOpen,
  onClose,
  rasters,
  activeRasterId,
  onSelectActiveRaster,
  rasterVisibility,
  onToggleRasterVisibility,
  rasterOpacity,
  onChangeRasterOpacity,
  onZoomToRaster,
  aois,
  isAOILayerVisible,
  onToggleAOILayerVisible,
  selectedAoiId,
  onSelectAOI,
  onZoomToAOI,
  onDeleteAOI,
}: LayerPanelProps) {
  const [tab, setTab] = useState<"rasters" | "aois">("rasters");

  if (!isOpen) return null;

  return (
    <Card className="w-80 md:w-88 max-h-[calc(100vh-140px)] flex flex-col rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border-slate-200/80 overflow-hidden z-20 transition-all duration-200 animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#0B57D0]">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1D20]">Layer Manager</h3>
            <p className="text-[11px] text-slate-400">Map Overlays &amp; Vectors</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/70 p-1 gap-1">
        <button
          onClick={() => setTab("rasters")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
            tab === "rasters"
              ? "bg-white text-[#0B57D0] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Rasters ({rasters?.length ?? 0})</span>
        </button>
        <button
          onClick={() => setTab("aois")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
            tab === "aois"
              ? "bg-white text-[#0B57D0] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>AOIs ({aois?.length ?? 0})</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {tab === "rasters" ? (
          <div className="space-y-2.5">
            {!rasters || rasters.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <Layers className="h-8 w-8 mx-auto stroke-[1.5] text-slate-300" />
                <p className="text-xs font-medium">No raster layers in catalog</p>
              </div>
            ) : (
              rasters.map((raster) => {
                const isActive = activeRasterId === raster.id;
                const isVisible = rasterVisibility[raster.id] ?? true;
                const opacity = rasterOpacity[raster.id] ?? 0.85;

                return (
                  <div
                    key={raster.id}
                    className={cn(
                      "p-3 rounded-2xl border transition-all space-y-2.5",
                      isActive
                        ? "bg-blue-50/60 border-blue-200 shadow-2xs"
                        : "bg-white border-slate-200/70 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onSelectActiveRaster(isActive ? null : raster.id)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700 uppercase tracking-wider">
                            {raster.type}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                              <Sparkles className="h-2.5 w-2.5" />
                              Active Tile
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#1A1D20] truncate mt-1">
                          {raster.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {raster.crs || "EPSG:4326"}
                          {raster.width && raster.height ? ` • ${raster.width}×${raster.height}px` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onToggleRasterVisibility(raster.id)}
                          className={cn(
                            "h-7 w-7 rounded-lg",
                            isVisible ? "text-[#0B57D0]" : "text-slate-300 hover:text-slate-500"
                          )}
                          title={isVisible ? "Hide Layer" : "Show Layer"}
                        >
                          {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onZoomToRaster(raster)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700"
                          title="Zoom to Raster Extent"
                        >
                          <Focus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    {isVisible && (
                      <div className="pt-2 border-t border-slate-100/80 flex items-center gap-2">
                        <Sliders className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="text-[10px] font-medium text-slate-400 w-10 shrink-0">
                          {Math.round(opacity * 100)}%
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={opacity}
                          onChange={(e) => onChangeRasterOpacity(raster.id, parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B57D0]"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Global AOI Layer Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Vector AOI Overlays</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleAOILayerVisible}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-xs font-semibold gap-1",
                  isAOILayerVisible ? "text-[#0D652D]" : "text-slate-400"
                )}
              >
                {isAOILayerVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>{isAOILayerVisible ? "Visible" : "Hidden"}</span>
              </Button>
            </div>

            {!aois || aois.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <MapPin className="h-8 w-8 mx-auto stroke-[1.5] text-slate-300" />
                <p className="text-xs font-medium">No AOIs created yet</p>
                <p className="text-[11px]">Use &ldquo;Draw AOI&rdquo; to delineate study regions.</p>
              </div>
            ) : (
              aois.map((aoi) => {
                const isSelected = selectedAoiId === aoi.id;
                const coords = aoi.feature.geometry.coordinates[0] || [];
                const vertexCount = coords.length > 0 ? coords.length - 1 : 0;

                return (
                  <div
                    key={aoi.id}
                    className={cn(
                      "p-3 rounded-2xl border transition-all flex items-center justify-between gap-2",
                      isSelected
                        ? "bg-amber-50/60 border-amber-300 shadow-2xs"
                        : "bg-white border-slate-200/70 hover:border-slate-300"
                    )}
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectAOI(isSelected ? null : aoi.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            isSelected ? "text-amber-600" : "text-[#0B57D0]"
                          )}
                        />
                        <h4 className="text-xs font-bold text-[#1A1D20] truncate">{aoi.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {vertexCount} vertices • PostGIS EPSG:4326
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onZoomToAOI(aoi)}
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700"
                        title="Zoom to AOI"
                      >
                        <Focus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteAOI(aoi.id)}
                        className="h-7 w-7 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50"
                        title="Delete AOI"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
