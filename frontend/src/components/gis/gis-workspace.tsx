"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { type MapRef, type MapMouseEvent } from "react-map-gl/maplibre";
import { useAuthStore } from "@/stores/auth-store";
import { useRasters, useInspectRasterPoint } from "@/hooks/use-rasters";
import {
  useAOIs,
  useCreateAOI,
  useUpdateAOI,
  useDeleteAOI,
} from "@/hooks/use-aois";
import { DEFAULT_BASEMAP, type BasemapOption } from "@/lib/gis/basemaps";
import { GISMap } from "@/components/gis/gis-map";
import { MapToolbar, type GISToolMode } from "@/components/gis/map-toolbar";
import { MapControls } from "@/components/gis/map-controls";
import { LayerPanel } from "@/components/gis/layer-panel";
import { AOIInspector } from "@/components/gis/aoi-inspector";
import { PixelInspector } from "@/components/gis/pixel-inspector";
import { MeasurementHUD } from "@/components/gis/measurement-hud";
import { SaveAOIDialog } from "@/components/gis/save-aoi-dialog";
import type { RasterResponse, RasterPointInspectionResponse } from "@/types/raster";
import type { AOIResponse, GeoJSONFeature } from "@/types/aoi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/types/api";

interface GISWorkspaceProps {
  projectId: number;
  initialRasterId?: number | null;
}

export function GISWorkspace({ projectId, initialRasterId }: GISWorkspaceProps) {
  const mapRef = useRef<MapRef | null>(null);
  const token = useAuthStore((state) => state.token);

  // Queries
  const { data: rasters } = useRasters(projectId);
  const { data: aois } = useAOIs(projectId);

  // Mutations
  const createAOIMutation = useCreateAOI(projectId);
  const updateAOIMutation = useUpdateAOI(projectId);
  const deleteAOIMutation = useDeleteAOI(projectId);
  const inspectPointMutation = useInspectRasterPoint(projectId);

  // State: Tools & Panels
  const [activeTool, setActiveTool] = useState<GISToolMode>("navigate");
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapOption>(DEFAULT_BASEMAP);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true);

  // State: Rasters & Layers
  const [activeRasterId, setActiveRasterId] = useState<number | null>(
    initialRasterId ?? null
  );
  const [rasterVisibility, setRasterVisibility] = useState<Record<number, boolean>>({});
  const [rasterOpacity, setRasterOpacity] = useState<Record<number, number>>({});

  // State: Vector AOIs
  const [isAOILayerVisible, setIsAOILayerVisible] = useState(true);
  const [selectedAoiId, setSelectedAoiId] = useState<number | null>(null);

  // State: Drawing
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [cursorPos, setCursorPos] = useState<[number, number] | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // State: Geometry Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editPoints, setEditPoints] = useState<[number, number][]>([]);

  // State: Measuring
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // State: Point/Pixel Inspection
  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);
  const [sampledPointData, setSampledPointData] = useState<RasterPointInspectionResponse | null>(null);

  // Selected AOI object
  const selectedAOI = useMemo(() => {
    if (!selectedAoiId || !aois) return null;
    return aois.find((a) => a.id === selectedAoiId) ?? null;
  }, [selectedAoiId, aois]);

  // Active Raster object
  const activeRaster = useMemo(() => {
    if (!activeRasterId || !rasters) return null;
    return rasters.find((r) => r.id === activeRasterId) ?? null;
  }, [activeRasterId, rasters]);

  // Compute Initial Viewport based on rasters or AOIs
  const initialViewState = useMemo(() => {
    if (rasters && rasters.length > 0) {
      const r = rasters[0];
      if (
        r.min_x !== null &&
        r.min_y !== null &&
        r.max_x !== null &&
        r.max_y !== null
      ) {
        return {
          longitude: (r.min_x + r.max_x) / 2,
          latitude: (r.min_y + r.max_y) / 2,
          zoom: 10,
        };
      }
    }
    return {
      longitude: 0,
      latitude: 20,
      zoom: 2.5,
    };
  }, [rasters]);

  // ---------------------------------------------------------------------------
  // Layer Controls
  // ---------------------------------------------------------------------------

  const handleToggleRasterVisibility = (rasterId: number) => {
    setRasterVisibility((prev) => ({
      ...prev,
      [rasterId]: !(prev[rasterId] ?? true),
    }));
  };

  const handleChangeRasterOpacity = (rasterId: number, opacity: number) => {
    setRasterOpacity((prev) => ({
      ...prev,
      [rasterId]: opacity,
    }));
  };

  const handleZoomToRaster = (raster: RasterResponse) => {
    if (
      raster.min_x !== null &&
      raster.min_y !== null &&
      raster.max_x !== null &&
      raster.max_y !== null &&
      mapRef.current
    ) {
      mapRef.current.fitBounds(
        [
          [raster.min_x, raster.min_y],
          [raster.max_x, raster.max_y],
        ],
        { padding: 60, duration: 1000 }
      );
    }
  };

  const handleZoomToAOI = (aoi: AOIResponse) => {
    const coords = aoi.feature.geometry.coordinates[0];
    if (!coords || coords.length === 0 || !mapRef.current) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [x, y] of coords) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    if (minX !== Infinity) {
      mapRef.current.fitBounds(
        [
          [minX, minY],
          [maxX, maxY],
        ],
        { padding: 80, duration: 1000 }
      );
    }
  };

  const handleFitProjectExtent = () => {
    if (rasters && rasters.length > 0) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const r of rasters) {
        if (
          r.min_x !== null &&
          r.min_y !== null &&
          r.max_x !== null &&
          r.max_y !== null
        ) {
          if (r.min_x < minX) minX = r.min_x;
          if (r.min_y < minY) minY = r.min_y;
          if (r.max_x > maxX) maxX = r.max_x;
          if (r.max_y > maxY) maxY = r.max_y;
        }
      }

      if (minX !== Infinity && mapRef.current) {
        mapRef.current.fitBounds(
          [
            [minX, minY],
            [maxX, maxY],
          ],
          { padding: 60, duration: 1000 }
        );
        return;
      }
    }

    if (mapRef.current) {
      mapRef.current.flyTo({ center: [0, 20], zoom: 2.5, duration: 1000 });
    }
  };

  // ---------------------------------------------------------------------------
  // Tool & Map Interactions
  // ---------------------------------------------------------------------------

  const handleSelectTool = (tool: GISToolMode) => {
    setActiveTool(tool);

    if (tool === "draw_aoi") {
      setIsEditing(false);
      setSelectedAoiId(null);
      setDrawPoints([]);
      setCursorPos(null);
      toast.info("Click map canvas to place polygon vertices.");
    } else if (tool === "navigate") {
      setDrawPoints([]);
      setCursorPos(null);
      setMeasurePoints([]);
      setIsEditing(false);
    } else if (tool === "measure_distance" || tool === "measure_area") {
      setMeasurePoints([]);
      setCursorPos(null);
      setIsEditing(false);
      toast.info(
        tool === "measure_distance"
          ? "Click map to measure distance along path."
          : "Click map to measure polygon area."
      );
    } else if (tool === "inspect_pixel") {
      setIsEditing(false);
      toast.info("Click anywhere on the raster layer to inspect pixel values.");
    }
  };

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (activeTool === "draw_aoi") {
        setDrawPoints((prev) => [...prev, coord]);
        return;
      }

      if (activeTool === "measure_distance" || activeTool === "measure_area") {
        setMeasurePoints((prev) => [...prev, coord]);
        return;
      }

      if (activeTool === "inspect_pixel") {
        setClickedCoords(coord);

        // Find active raster or fallback to first visible raster
        const targetRaster =
          activeRaster ||
          (rasters
            ? rasters.find((r) => rasterVisibility[r.id] ?? true)
            : null);

        if (targetRaster) {
          inspectPointMutation.mutate(
            {
              rasterId: targetRaster.id,
              lon: coord[0],
              lat: coord[1],
            },
            {
              onSuccess: (data) => setSampledPointData(data),
              onError: (err) => toast.error(getApiErrorMessage(err)),
            }
          );
        } else {
          setSampledPointData({
            coordinates: coord,
            values: {},
            is_valid: false,
            message: "No active raster layer selected for pixel sampling",
          });
        }
        return;
      }

      if (isEditing) {
        // Vertex dragging is handled separately via Marker onDrag
        return;
      }

      // Default navigate mode: Check if user clicked an existing AOI feature
      const feature = e.features && e.features[0];
      if (feature && feature.properties?.id) {
        setSelectedAoiId(Number(feature.properties.id));
      } else {
        setSelectedAoiId(null);
      }
    },
    [
      activeTool,
      isEditing,
      activeRaster,
      rasters,
      rasterVisibility,
      inspectPointMutation,
    ]
  );

  const handleMouseMove = useCallback(
    (e: MapMouseEvent) => {
      const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setCursorPos(coord);
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Drawing & Saving AOI
  // ---------------------------------------------------------------------------

  const handleFinishDrawing = () => {
    if (drawPoints.length < 3) {
      toast.error("A polygon requires at least 3 points.");
      return;
    }
    setCursorPos(null);
    setIsSaveModalOpen(true);
  };

  const handleCancelDrawing = () => {
    setActiveTool("navigate");
    setDrawPoints([]);
    setCursorPos(null);
  };

  const handleSaveAOI = async (
    name: string,
    description: string,
    feature: GeoJSONFeature
  ) => {
    try {
      await createAOIMutation.mutateAsync({
        name,
        description: description || null,
        feature,
      });

      toast.success(`Area of Interest "${name}" registered in PostGIS!`);
      setIsSaveModalOpen(false);
      setActiveTool("navigate");
      setDrawPoints([]);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // ---------------------------------------------------------------------------
  // Editing AOI Geometry
  // ---------------------------------------------------------------------------

  const handleStartEditGeometry = () => {
    if (!selectedAOI) return;
    const rawCoords = selectedAOI.feature.geometry.coordinates[0];
    if (!rawCoords || rawCoords.length < 4) {
      toast.error("Selected AOI has invalid geometry coordinates.");
      return;
    }

    const isClosed =
      rawCoords.length > 1 &&
      rawCoords[0][0] === rawCoords[rawCoords.length - 1][0] &&
      rawCoords[0][1] === rawCoords[rawCoords.length - 1][1];

    const vertices = isClosed ? rawCoords.slice(0, -1) : rawCoords;
    setEditPoints(vertices.map((c) => [c[0], c[1]]));
    setIsEditing(true);
    setActiveTool("edit_aoi");
    toast.info(`Editing geometry for "${selectedAOI.name}". Drag vertices on map.`);
  };

  const handleVertexDrag = (index: number, lng: number, lat: number) => {
    setEditPoints((prev) => {
      const next = [...prev];
      next[index] = [lng, lat];
      return next;
    });
  };

  const handleCancelEditGeometry = () => {
    setIsEditing(false);
    setEditPoints([]);
    setActiveTool("navigate");
    toast.info("Geometry edits discarded.");
  };

  const handleSaveEditedGeometry = async () => {
    if (!selectedAOI) return;
    if (editPoints.length < 3) {
      toast.error("A polygon requires at least 3 points.");
      return;
    }

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
      setIsEditing(false);
      setEditPoints([]);
      setActiveTool("navigate");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  // ---------------------------------------------------------------------------
  // Deleting AOI
  // ---------------------------------------------------------------------------

  const handleDeleteAOI = async (aoiId: number) => {
    if (confirm("Are you sure you want to permanently delete this Area of Interest?")) {
      try {
        await deleteAOIMutation.mutateAsync(aoiId);
        toast.success("Area of Interest deleted from PostGIS");
        if (selectedAoiId === aoiId) {
          setSelectedAoiId(null);
        }
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      }
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-125px)] min-h-[550px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col">
      {/* Top Floating Bar: Tool Selection */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 max-w-[calc(100%-120px)]">
        <MapToolbar
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          isDrawing={activeTool === "draw_aoi"}
          drawPointCount={drawPoints.length}
          onFinishDrawing={handleFinishDrawing}
          onCancelDrawing={handleCancelDrawing}
          isEditing={isEditing}
          editPointCount={editPoints.length}
          onSaveEditing={handleSaveEditedGeometry}
          onCancelEditing={handleCancelEditGeometry}
          isSavingEdit={updateAOIMutation.isPending}
          isMeasuring={activeTool === "measure_distance" || activeTool === "measure_area"}
          measurePointCount={measurePoints.length}
          onClearMeasurement={() => setMeasurePoints([])}
        />
      </div>

      {/* Top-Right Floating Bar: Map Controls */}
      <div className="absolute top-4 right-4 z-20">
        <MapControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onFitExtent={handleFitProjectExtent}
          selectedBasemap={selectedBasemap}
          onSelectBasemap={setSelectedBasemap}
          isLayerPanelOpen={isLayerPanelOpen}
          onToggleLayerPanel={() => setIsLayerPanelOpen((v) => !v)}
        />
      </div>

      {/* Floating Layer Panel (Top Left / Offset below toolbar) */}
      <div className="absolute top-18 left-4 z-20">
        <LayerPanel
          isOpen={isLayerPanelOpen}
          onClose={() => setIsLayerPanelOpen(false)}
          rasters={rasters}
          activeRasterId={activeRasterId}
          onSelectActiveRaster={setActiveRasterId}
          rasterVisibility={rasterVisibility}
          onToggleRasterVisibility={handleToggleRasterVisibility}
          rasterOpacity={rasterOpacity}
          onChangeRasterOpacity={handleChangeRasterOpacity}
          onZoomToRaster={handleZoomToRaster}
          aois={aois}
          isAOILayerVisible={isAOILayerVisible}
          onToggleAOILayerVisible={() => setIsAOILayerVisible((v) => !v)}
          selectedAoiId={selectedAoiId}
          onSelectAOI={setSelectedAoiId}
          onZoomToAOI={handleZoomToAOI}
          onDeleteAOI={handleDeleteAOI}
        />
      </div>

      {/* Floating Selected AOI Inspector (Bottom Left) */}
      {selectedAOI && !isEditing && (
        <div className="absolute bottom-6 left-4 z-20">
          <AOIInspector
            aoi={selectedAOI}
            onClose={() => setSelectedAoiId(null)}
            onStartEdit={handleStartEditGeometry}
            onZoomToAOI={handleZoomToAOI}
            onDeleteAOI={handleDeleteAOI}
          />
        </div>
      )}

      {/* Floating Pixel & Coordinate Inspector (Bottom Left when active) */}
      {activeTool === "inspect_pixel" && (
        <div className="absolute bottom-6 left-4 z-20">
          <PixelInspector
            cursorCoords={cursorPos}
            clickedCoords={clickedCoords}
            pointData={sampledPointData}
            isLoading={inspectPointMutation.isPending}
            activeRasterName={activeRaster?.name}
            onClose={() => setActiveTool("navigate")}
          />
        </div>
      )}

      {/* Floating Measurement HUD (Top Center) */}
      {(activeTool === "measure_distance" || activeTool === "measure_area") && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <MeasurementHUD
            mode={activeTool}
            points={measurePoints}
            cursorPos={cursorPos}
            onClear={() => setMeasurePoints([])}
            onClose={() => setActiveTool("navigate")}
          />
        </div>
      )}

      {/* MapLibre Canvas Container */}
      <div className="flex-1 w-full h-full relative">
        <GISMap
          mapRef={mapRef}
          initialViewState={initialViewState}
          selectedBasemap={selectedBasemap}
          token={token}
          projectId={projectId}
          rasters={rasters}
          rasterVisibility={rasterVisibility}
          rasterOpacity={rasterOpacity}
          aois={aois}
          isAOILayerVisible={isAOILayerVisible}
          selectedAoiId={selectedAoiId}
          activeTool={activeTool}
          isDrawing={activeTool === "draw_aoi"}
          drawPoints={drawPoints}
          cursorPos={cursorPos}
          isEditing={isEditing}
          editPoints={editPoints}
          onVertexDrag={handleVertexDrag}
          measurePoints={measurePoints}
          onMapClick={handleMapClick}
          onMouseMove={handleMouseMove}
        />
      </div>

      {/* Modal Dialog: Save New Area of Interest */}
      <SaveAOIDialog
        open={isSaveModalOpen}
        onOpenChange={setIsSaveModalOpen}
        drawPoints={drawPoints}
        onSave={handleSaveAOI}
        isSaving={createAOIMutation.isPending}
      />
    </div>
  );
}
