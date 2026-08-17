"use client";

import React, { useState, useMemo, useCallback } from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  Marker,
  type MapMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapIcon,
  PenTool,
  Check,
  X,
  Layers,
  Loader2,
  Sparkles,
  MapPin,
  Edit3,
  Move,
} from "lucide-react";
import type { RasterResponse } from "@/types/raster";
import type { GeoJSONFeature } from "@/types/aoi";
import { useAuthStore } from "@/stores/auth-store";
import { useAOIs, useCreateAOI, useUpdateAOI } from "@/hooks/use-aois";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/types/api";

interface RasterMapViewerProps {
  raster: RasterResponse;
}

export function RasterMapViewer({ raster }: RasterMapViewerProps) {
  const [open, setOpen] = useState(false);
  const token = useAuthStore((state) => state.token);

  // AOI query and mutation hooks
  const { data: aois } = useAOIs(raster.project_id);
  const createAOIMutation = useCreateAOI(raster.project_id);
  const updateAOIMutation = useUpdateAOI(raster.project_id);

  // Selection state
  const [selectedAoiId, setSelectedAoiId] = useState<number | null>(null);

  // Drawing state (Creation)
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [cursorPos, setCursorPos] = useState<[number, number] | null>(null);

  // Editing state (Update Geometry)
  const [isEditingGeometry, setIsEditingGeometry] = useState(false);
  const [editPoints, setEditPoints] = useState<[number, number][]>([]);

  // Save AOI modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [aoiName, setAoiName] = useState("");
  const [aoiDescription, setAoiDescription] = useState("");

  // Tile URL for raster
  const tileUrl = `/api/v1/projects/${raster.project_id}/rasters/${raster.id}/tiles/{z}/{x}/{y}.png`;

  // Selected AOI object
  const selectedAOI = useMemo(() => {
    if (!selectedAoiId || !aois) return null;
    return aois.find((a) => a.id === selectedAoiId) ?? null;
  }, [selectedAoiId, aois]);

  // Initial viewport based on raster bounds
  const initialViewState = useMemo(() => {
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
    return {
      longitude: 0,
      latitude: 0,
      zoom: 2,
    };
  }, [raster]);

  // Existing AOIs GeoJSON FeatureCollection
  const existingAOIsGeoJSON = useMemo(() => {
    if (!aois || aois.length === 0) {
      return {
        type: "FeatureCollection" as const,
        features: [],
      };
    }

    // Filter out the active edited AOI from passive rendering so edit layer takes precedence
    const filteredAOIs = isEditingGeometry
      ? aois.filter((a) => a.id !== selectedAoiId)
      : aois;

    return {
      type: "FeatureCollection" as const,
      features: filteredAOIs.map((aoi) => ({
        type: "Feature" as const,
        id: aoi.id,
        properties: {
          id: aoi.id,
          name: aoi.name,
          description: aoi.description,
          isSelected: aoi.id === selectedAoiId,
        },
        geometry: aoi.feature.geometry,
      })),
    };
  }, [aois, isEditingGeometry, selectedAoiId]);

  // Active in-progress edited polygon GeoJSON
  const editPolygonGeoJSON = useMemo(() => {
    if (!isEditingGeometry || editPoints.length < 3) {
      return { type: "FeatureCollection" as const, features: [] };
    }
    const closedCoordinates = [...editPoints, editPoints[0]];
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [closedCoordinates],
          },
          properties: {
            name: selectedAOI?.name || "Editing Geometry",
          },
        },
      ],
    };
  }, [isEditingGeometry, editPoints, selectedAOI]);

  // Active drawing points GeoJSON (Creation)
  const drawPointsGeoJSON = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: drawPoints.map((pt, idx) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: pt,
        },
        properties: {
          index: idx,
          isFirst: idx === 0,
        },
      })),
    };
  }, [drawPoints]);

  // Active drawing lines and preview polygon GeoJSON (Creation)
  const drawLinesGeoJSON = useMemo(() => {
    if (drawPoints.length === 0) {
      return { type: "FeatureCollection" as const, features: [] };
    }
    const coords = [...drawPoints];
    if (cursorPos) {
      coords.push(cursorPos);
    }

    const features: {
      type: "Feature";
      geometry:
        | { type: "LineString"; coordinates: [number, number][] }
        | { type: "Polygon"; coordinates: [number, number][][] };
      properties: Record<string, unknown>;
    }[] = [];

    if (coords.length >= 2) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
        properties: {},
      });
    }

    if (drawPoints.length >= 3) {
      features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...drawPoints, drawPoints[0]]],
        },
        properties: {},
      });
    }

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [drawPoints, cursorPos]);

  // Handle map clicks
  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (isDrawing) {
        const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setDrawPoints((prev) => [...prev, coord]);
        return;
      }

      if (isEditingGeometry) {
        // In vertex editing mode, map clicks don't change selection
        return;
      }

      // Check if user clicked an existing AOI
      const feature = e.features && e.features[0];
      if (feature && feature.properties?.id) {
        setSelectedAoiId(Number(feature.properties.id));
      }
    },
    [isDrawing, isEditingGeometry]
  );

  // Handle mouse move for the rubber-band line
  const handleMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!isDrawing || drawPoints.length === 0) return;
      setCursorPos([e.lngLat.lng, e.lngLat.lat]);
    },
    [isDrawing, drawPoints.length]
  );

  // Start creation drawing mode
  const handleStartDrawing = () => {
    setIsEditingGeometry(false);
    setSelectedAoiId(null);
    setIsDrawing(true);
    setDrawPoints([]);
    setCursorPos(null);
    toast.info("Click on the map to place polygon vertices.");
  };

  // Cancel creation drawing mode
  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawPoints([]);
    setCursorPos(null);
  };

  // Complete drawing and open save modal
  const handleFinishDrawing = () => {
    if (drawPoints.length < 3) {
      toast.error("A polygon requires at least 3 points.");
      return;
    }
    setCursorPos(null);
    setAoiName(`AOI-${Date.now().toString().slice(-4)}`);
    setAoiDescription("");
    setIsSaveModalOpen(true);
  };

  // Submit new AOI to PostGIS backend
  const handleSaveAOI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aoiName.trim()) {
      toast.error("Please provide a name for the Area of Interest.");
      return;
    }
    if (drawPoints.length < 3) {
      toast.error("A polygon requires at least 3 points.");
      return;
    }

    // Close linear ring
    const closedCoordinates: number[][] = [...drawPoints, drawPoints[0]];

    const feature: GeoJSONFeature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [closedCoordinates],
      },
      properties: {},
    };

    try {
      await createAOIMutation.mutateAsync({
        name: aoiName.trim(),
        description: aoiDescription.trim() || null,
        feature,
      });

      toast.success("Area of Interest saved to PostGIS successfully!");
      setIsSaveModalOpen(false);
      setIsDrawing(false);
      setDrawPoints([]);
      setAoiName("");
      setAoiDescription("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // Enter geometry edit mode for selected AOI
  const handleStartEditGeometry = () => {
    if (!selectedAOI) return;
    const rawCoords = selectedAOI.feature.geometry.coordinates[0];
    if (!rawCoords || rawCoords.length < 4) {
      toast.error("Selected AOI has invalid geometry coordinates.");
      return;
    }

    // Exclude redundant closing point if first equals last
    const isClosed =
      rawCoords.length > 1 &&
      rawCoords[0][0] === rawCoords[rawCoords.length - 1][0] &&
      rawCoords[0][1] === rawCoords[rawCoords.length - 1][1];

    const vertices = isClosed ? rawCoords.slice(0, -1) : rawCoords;
    setEditPoints(vertices.map((c) => [c[0], c[1]]));
    setIsEditingGeometry(true);
    setIsDrawing(false);
    toast.info(`Editing geometry for "${selectedAOI.name}". Drag vertices on map.`);
  };

  // Handle dragging a vertex handle
  const handleVertexDrag = (index: number, lng: number, lat: number) => {
    setEditPoints((prev) => {
      const next = [...prev];
      next[index] = [lng, lat];
      return next;
    });
  };

  // Cancel geometry edit mode
  const handleCancelEditGeometry = () => {
    setIsEditingGeometry(false);
    setEditPoints([]);
    toast.info("Geometry edits discarded.");
  };

  // Save updated geometry to PostGIS backend
  const handleSaveEditedGeometry = async () => {
    if (!selectedAOI) return;
    if (editPoints.length < 3) {
      toast.error("A polygon requires at least 3 points.");
      return;
    }

    // Build closed linear ring
    const closedCoordinates: number[][] = [...editPoints, editPoints[0]];

    const updatedFeature: GeoJSONFeature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [closedCoordinates],
      },
      properties: selectedAOI.feature.properties || {},
    };

    try {
      await updateAOIMutation.mutateAsync({
        aoiId: selectedAOI.id,
        data: {
          feature: updatedFeature,
        },
      });

      toast.success(`Updated "${selectedAOI.name}" geometry in PostGIS!`);
      setIsEditingGeometry(false);
      setEditPoints([]);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 rounded-full px-4 text-xs font-semibold">
            <MapIcon className="h-4 w-4" />
            View on Map
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[850px] sm:max-h-[850px] h-[85vh] flex flex-col p-0 rounded-3xl overflow-hidden border-slate-200 shadow-2xl">
          <DialogHeader className="p-4 px-6 border-b border-slate-100 bg-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#0B57D0]">
                <Layers className="h-4 w-4 stroke-[2.2]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#1A1D20]">
                  {raster.name} Visualization &amp; GIS
                </DialogTitle>
                <p className="text-xs text-slate-400 font-normal">
                  EPSG:4326 PostGIS Layer Engine
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 relative w-full h-full bg-slate-100">
            {/* Floating Map Controls & Mode Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md p-2 shadow-lg border border-slate-200/80 max-w-[90%]">
              {/* State A: In-Progress Geometry Edit Mode */}
              {isEditingGeometry && selectedAOI ? (
                <>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/60 text-xs font-semibold text-amber-800">
                    <Move className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                    <span>
                      Editing: {selectedAOI.name} ({editPoints.length} vertices)
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleSaveEditedGeometry}
                    disabled={updateAOIMutation.isPending || editPoints.length < 3}
                    className="h-8 rounded-xl bg-[#0D652D] hover:bg-emerald-700 text-white text-xs font-semibold gap-1 shadow-xs disabled:opacity-50"
                  >
                    {updateAOIMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Save Geometry</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEditGeometry}
                    disabled={updateAOIMutation.isPending}
                    className="h-8 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </Button>
                </>
              ) : isDrawing ? (
                /* State B: In-Progress New Polygon Drawing Mode */
                <>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-100 text-xs font-semibold text-[#0B57D0]">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>{drawPoints.length} points placed (min 3)</span>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleFinishDrawing}
                    disabled={drawPoints.length < 3}
                    className="h-8 rounded-xl bg-[#0D652D] hover:bg-emerald-700 text-white text-xs font-semibold gap-1 shadow-xs disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Finish</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelDrawing}
                    className="h-8 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </Button>
                </>
              ) : (
                /* State C: Default Navigation / Selection Toolbar */
                <>
                  <Button
                    size="sm"
                    onClick={handleStartDrawing}
                    className="h-8 rounded-xl bg-[#0B57D0] hover:bg-[#1A73E8] text-white text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span>Draw AOI</span>
                  </Button>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  {/* AOI Selector Dropdown / Selection Pill */}
                  {aois && aois.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label="Select Area of Interest"
                        value={selectedAoiId ?? ""}
                        onChange={(e) =>
                          setSelectedAoiId(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="h-8 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Select AOI --</option>
                        {aois.map((aoi) => (
                          <option key={aoi.id} value={aoi.id}>
                            {aoi.name}
                          </option>
                        ))}
                      </select>

                      {selectedAOI && (
                        <>
                          <Button
                            size="sm"
                            onClick={handleStartEditGeometry}
                            className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1 shadow-xs"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit Geometry</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedAoiId(null)}
                            className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>0 AOIs</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Instruction banner for drawing / editing mode */}
            {isDrawing && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-[#1A1D20]/90 text-white text-xs font-medium backdrop-blur-md shadow-xl border border-slate-700/50 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  Click map to add polygon vertices. Place 3+ points and click &ldquo;Finish&rdquo; to save AOI.
                </span>
              </div>
            )}

            {isEditingGeometry && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-[#1A1D20]/90 text-white text-xs font-medium backdrop-blur-md shadow-xl border border-slate-700/50 flex items-center gap-2">
                <Move className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>
                  Drag vertex markers on the map to modify polygon shape. Click &ldquo;Save Geometry&rdquo; when finished.
                </span>
              </div>
            )}

            {/* MapLibre Canvas */}
            <Map
              initialViewState={initialViewState}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              style={{ width: "100%", height: "100%" }}
              interactive={true}
              interactiveLayerIds={["existing-aois-fill", "existing-aois-line"]}
              cursor={
                isDrawing
                  ? "crosshair"
                  : isEditingGeometry
                  ? "default"
                  : "grab"
              }
              onClick={handleMapClick}
              onMouseMove={handleMouseMove}
              onDblClick={
                isDrawing && drawPoints.length >= 3
                  ? handleFinishDrawing
                  : undefined
              }
              doubleClickZoom={!isDrawing && !isEditingGeometry}
              transformRequest={(url) => {
                if (url.includes("/api/") && token) {
                  return {
                    url,
                    headers: { Authorization: `Bearer ${token}` },
                  };
                }
                return { url };
              }}
            >
              <NavigationControl position="top-right" />

              {/* Raster Imagery Tile Layer */}
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

              {/* Existing Project AOIs Layer */}
              <Source
                id="existing-aois-source"
                type="geojson"
                data={existingAOIsGeoJSON}
              >
                <Layer
                  id="existing-aois-fill"
                  type="fill"
                  paint={{
                    "fill-color": [
                      "case",
                      ["==", ["get", "isSelected"], true],
                      "#D97706",
                      "#0B57D0",
                    ],
                    "fill-opacity": [
                      "case",
                      ["==", ["get", "isSelected"], true],
                      0.3,
                      0.18,
                    ],
                  }}
                />
                <Layer
                  id="existing-aois-line"
                  type="line"
                  paint={{
                    "line-color": [
                      "case",
                      ["==", ["get", "isSelected"], true],
                      "#D97706",
                      "#0B57D0",
                    ],
                    "line-width": [
                      "case",
                      ["==", ["get", "isSelected"], true],
                      3,
                      2,
                    ],
                    "line-opacity": 0.9,
                  }}
                />
              </Source>

              {/* Active Geometry Editing Layers & Draggable Vertex Markers */}
              {isEditingGeometry && (
                <>
                  <Source
                    id="editing-polygon-source"
                    type="geojson"
                    data={editPolygonGeoJSON}
                  >
                    <Layer
                      id="edit-polygon-fill"
                      type="fill"
                      paint={{
                        "fill-color": "#D97706",
                        "fill-opacity": 0.25,
                      }}
                    />
                    <Layer
                      id="edit-polygon-line"
                      type="line"
                      paint={{
                        "line-color": "#D97706",
                        "line-width": 2.5,
                        "line-dasharray": [2, 1],
                      }}
                    />
                  </Source>

                  {/* Render Draggable Vertex Markers */}
                  {editPoints.map((pt, idx) => (
                    <Marker
                      key={`edit-vertex-${idx}`}
                      longitude={pt[0]}
                      latitude={pt[1]}
                      anchor="center"
                      draggable={true}
                      onDrag={(e) =>
                        handleVertexDrag(idx, e.lngLat.lng, e.lngLat.lat)
                      }
                    >
                      <div
                        className="group relative flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#D97706] shadow-md cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                        title={`Vertex #${idx + 1}: [${pt[0].toFixed(
                          5
                        )}, ${pt[1].toFixed(5)}]`}
                      >
                        <div className="h-2 w-2 rounded-full bg-[#D97706]" />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block rounded bg-[#1A1D20] px-1.5 py-0.5 text-[9px] font-semibold text-white whitespace-nowrap shadow-sm pointer-events-none">
                          V{idx + 1}
                        </span>
                      </div>
                    </Marker>
                  ))}
                </>
              )}

              {/* In-Progress Drawing Layers (Creation) */}
              {isDrawing && (
                <>
                  <Source
                    id="drawing-lines-source"
                    type="geojson"
                    data={drawLinesGeoJSON}
                  >
                    <Layer
                      id="draw-polygon-preview"
                      type="fill"
                      filter={["==", ["geometry-type"], "Polygon"]}
                      paint={{
                        "fill-color": "#10B981",
                        "fill-opacity": 0.25,
                      }}
                    />
                    <Layer
                      id="draw-lines-layer"
                      type="line"
                      filter={["==", ["geometry-type"], "LineString"]}
                      paint={{
                        "line-color": "#0B57D0",
                        "line-width": 2.5,
                        "line-dasharray": [2, 1],
                      }}
                    />
                  </Source>

                  <Source
                    id="drawing-points-source"
                    type="geojson"
                    data={drawPointsGeoJSON}
                  >
                    <Layer
                      id="draw-points-layer"
                      type="circle"
                      paint={{
                        "circle-radius": 5,
                        "circle-color": "#0B57D0",
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#FFFFFF",
                      }}
                    />
                    <Layer
                      id="draw-first-point-layer"
                      type="circle"
                      filter={["==", ["get", "isFirst"], true]}
                      paint={{
                        "circle-radius": 9,
                        "circle-color": "transparent",
                        "circle-stroke-width": 2.5,
                        "circle-stroke-color": "#10B981",
                      }}
                    />
                  </Source>
                </>
              )}
            </Map>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog: Save New Area of Interest */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border-slate-200 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#0D652D]">
              <MapPin className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-[#1A1D20]">
              Save Area of Interest (AOI)
            </DialogTitle>
            <p className="text-xs text-slate-500 font-normal">
              Register drawn polygon ({drawPoints.length} vertices) into PostGIS EPSG:4326.
            </p>
          </DialogHeader>

          <form onSubmit={handleSaveAOI} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="aoiName" className="text-xs font-semibold text-slate-600">
                AOI Identifier Name *
              </Label>
              <Input
                id="aoiName"
                value={aoiName}
                onChange={(e) => setAoiName(e.target.value)}
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
                value={aoiDescription}
                onChange={(e) => setAoiDescription(e.target.value)}
                placeholder="Details on terrain bounds or target study area..."
                className="h-10 rounded-xl"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-[11px] font-mono text-slate-500 border border-slate-200/60 flex items-center justify-between">
              <span>Vertices: {drawPoints.length} points</span>
              <span>SRID: EPSG:4326</span>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsSaveModalOpen(false)}
                disabled={createAOIMutation.isPending}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAOIMutation.isPending}
                className="rounded-full text-xs bg-[#0B57D0] hover:bg-[#1A73E8] text-white"
              >
                {createAOIMutation.isPending ? (
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
    </>
  );
}
