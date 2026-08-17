"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Minus,
  Maximize,
  Compass,
  Layers,
  Map as MapIcon,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BASEMAP_OPTIONS, type BasemapOption } from "@/lib/gis/basemaps";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitExtent: () => void;
  selectedBasemap: BasemapOption;
  onSelectBasemap: (basemap: BasemapOption) => void;
  isLayerPanelOpen: boolean;
  onToggleLayerPanel: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onFitExtent,
  selectedBasemap,
  onSelectBasemap,
  isLayerPanelOpen,
  onToggleLayerPanel,
}: MapControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 overflow-hidden">
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomIn}
          className="h-9 w-9 rounded-none text-slate-700 hover:bg-slate-100 hover:text-[#0B57D0]"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <div className="h-px bg-slate-100 w-full" />
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomOut}
          className="h-9 w-9 rounded-none text-slate-700 hover:bg-slate-100 hover:text-[#0B57D0]"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation & Fit Extent */}
      <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 overflow-hidden">
        <Button
          size="icon"
          variant="ghost"
          onClick={onFitExtent}
          className="h-9 w-9 rounded-none text-slate-700 hover:bg-slate-100 hover:text-[#0B57D0]"
          title="Fit Layer Bounds"
        >
          <Compass className="h-4 w-4" />
        </Button>
        <div className="h-px bg-slate-100 w-full" />
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleFullscreen}
          className={cn(
            "h-9 w-9 rounded-none text-slate-700 hover:bg-slate-100 hover:text-[#0B57D0]",
            isFullscreen && "text-[#0B57D0] bg-blue-50/50"
          )}
          title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Basemap & Layer Toggles */}
      <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 overflow-hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-none text-slate-700 hover:bg-slate-100 hover:text-[#0B57D0]"
              title="Select Basemap"
            >
              <MapIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-200">
            <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1.5">
              Basemap Style
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            {BASEMAP_OPTIONS.map((basemap) => (
              <DropdownMenuItem
                key={basemap.id}
                onClick={() => onSelectBasemap(basemap)}
                className={cn(
                  "flex items-center justify-between rounded-xl p-2 text-xs font-medium cursor-pointer transition-colors",
                  selectedBasemap.id === basemap.id
                    ? "bg-[#E8F0FE] text-[#0B57D0]"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("h-4 w-4 rounded-full border border-slate-300", basemap.thumbnail)} />
                  <span>{basemap.name}</span>
                </div>
                {selectedBasemap.id === basemap.id && <Check className="h-3.5 w-3.5 text-[#0B57D0]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-px bg-slate-100 w-full" />

        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleLayerPanel}
          className={cn(
            "h-9 w-9 rounded-none transition-colors",
            isLayerPanelOpen
              ? "bg-[#E8F0FE] text-[#0B57D0]"
              : "text-slate-700 hover:bg-slate-100 hover:text-[#0B57D0]"
          )}
          title="Toggle Layers Panel"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
