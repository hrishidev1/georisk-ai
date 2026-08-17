"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { calculatePolygonArea, formatArea } from "@/lib/gis/geodesy";
import type { GeoJSONFeature } from "@/types/aoi";

interface SaveAOIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawPoints: [number, number][];
  onSave: (name: string, description: string, feature: GeoJSONFeature) => Promise<void>;
  isSaving: boolean;
}

export function SaveAOIDialog({
  open,
  onOpenChange,
  drawPoints,
  onSave,
  isSaving,
}: SaveAOIDialogProps) {
  const [name, setName] = useState(`AOI-${Date.now().toString().slice(-4)}`);
  const [description, setDescription] = useState("");

  const areaInfo = useMemo(() => {
    if (drawPoints.length < 3) return null;
    const sqM = calculatePolygonArea(drawPoints);
    return formatArea(sqM);
  }, [drawPoints]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const closedCoordinates = [...drawPoints, drawPoints[0]];
    const feature: GeoJSONFeature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [closedCoordinates],
      },
      properties: {},
    };

    await onSave(name.trim(), description.trim(), feature);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#0D652D]">
            <MapPin className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-[#1A1D20]">
            Save Area of Interest (AOI)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-normal">
            Register drawn polygon into PostGIS EPSG:4326 spatial layer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="aoiName" className="text-xs font-semibold text-slate-600">
              AOI Identifier Name *
            </Label>
            <Input
              id="aoiName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Basin Study Extent"
              required
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="aoiDesc" className="text-xs font-semibold text-slate-600">
              Scope Description (Optional)
            </Label>
            <Input
              id="aoiDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details on terrain bounds or target study area..."
              className="h-10 rounded-xl"
            />
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/60 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Geometry
              </span>
              <span className="font-mono">{drawPoints.length} vertices • EPSG:4326</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Calculated Area
              </span>
              <span className="font-semibold text-slate-800">
                {areaInfo ? areaInfo.primary : "N/A"}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="rounded-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="rounded-full text-xs bg-[#0B57D0] hover:bg-[#1A73E8] text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving AOI...
                </>
              ) : (
                "Save AOI to PostGIS"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
