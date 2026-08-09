import React, { useState, useMemo } from "react";
import Map, { Source, Layer, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapIcon } from "lucide-react";
import type { RasterResponse } from "@/types/raster";
import { useAuthStore } from "@/stores/auth-store";

interface RasterMapViewerProps {
  raster: RasterResponse;
}

export function RasterMapViewer({ raster }: RasterMapViewerProps) {
  const [open, setOpen] = useState(false);
  const token = useAuthStore((state) => state.token);

  // Use the local API proxy URL to fetch the tiles.
  // The rio-tiler endpoint we created returns standard XYZ tiles.
  const tileUrl = `/api/v1/projects/${raster.project_id}/rasters/${raster.id}/tiles/{z}/{x}/{y}.png`;

  // Determine initial viewport based on raster bounds if available
  const initialViewState = useMemo(() => {
    // If the raster has bounds (min_x, min_y, max_x, max_y)
    if (
      raster.min_x !== null &&
      raster.min_y !== null &&
      raster.max_x !== null &&
      raster.max_y !== null
    ) {
      const longitude = (raster.min_x + raster.max_x) / 2;
      const latitude = (raster.min_y + raster.max_y) / 2;
      return {
        longitude,
        latitude,
        zoom: 10,
      };
    }
    // Default fallback (center of the world)
    return {
      longitude: 0,
      latitude: 0,
      zoom: 2,
    };
  }, [raster]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full px-4 text-xs font-semibold">
          <MapIcon className="h-4 w-4" />
          View on Map
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[800px] h-[80vh] flex flex-col p-0 rounded-3xl overflow-hidden border-slate-200 shadow-xl">
        <DialogHeader className="p-4 border-b border-slate-100 bg-white">
          <DialogTitle className="text-lg font-bold text-[#1A1D20]">
            {raster.name} Visualization
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative w-full h-full bg-slate-100">
          <Map
            initialViewState={initialViewState}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            style={{ width: "100%", height: "100%" }}
            interactive={true}
            transformRequest={(url) => {
              if (url.includes("/api/") && token) {
                return {
                  url,
                  headers: { Authorization: `Bearer ${token}` }
                };
              }
              return { url };
            }}
          >
            <NavigationControl position="top-right" />
            
            <Source
              id={`raster-source-${raster.id}`}
              type="raster"
              tiles={[tileUrl]}
              tileSize={256}
            >
              <Layer
                id={`raster-layer-${raster.id}`}
                type="raster"
                paint={{
                  "raster-opacity": 0.8,
                  "raster-fade-duration": 300,
                }}
              />
            </Source>
          </Map>
        </div>
      </DialogContent>
    </Dialog>
  );
}
