"use client";

import React, { useMemo } from "react";
import Map, {
  Source,
  Layer,
  Marker,
  type MapRef,
  type MapMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BasemapOption } from "@/lib/gis/basemaps";
import type { RasterResponse } from "@/types/raster";
import type { AOIResponse } from "@/types/aoi";
import type { GISToolMode } from "@/components/gis/map-toolbar";

interface GISMapProps {
  mapRef: React.RefObject<MapRef | null>;
  initialViewState: { longitude: number; latitude: number; zoom: number };
  selectedBasemap: BasemapOption;
  token?: string | null;
  projectId: number;
  // Rasters
  rasters: RasterResponse[] | undefined;
  rasterVisibility: Record<number, boolean>;
  rasterOpacity: Record<number, number>;
  // AOIs
  aois: AOIResponse[] | undefined;
  isAOILayerVisible: boolean;
  selectedAoiId: number | null;
  // Tool Modes & Vectors
  activeTool: GISToolMode;
  isDrawing: boolean;
  drawPoints: [number, number][];
  cursorPos: [number, number] | null;
  isEditing: boolean;
  editPoints: [number, number][];
  onVertexDrag: (index: number, lng: number, lat: number) => void;
  measurePoints: [number, number][];
  // Map Events
  onMapClick: (e: MapMouseEvent) => void;
  onMouseMove: (e: MapMouseEvent) => void;
}

export function GISMap({
  mapRef,
  initialViewState,
  selectedBasemap,
  token,
  projectId,
  rasters,
  rasterVisibility,
  rasterOpacity,
  aois,
  isAOILayerVisible,
  selectedAoiId,
  activeTool,
  isDrawing,
  drawPoints,
  cursorPos,
  isEditing,
  editPoints,
  onVertexDrag,
  measurePoints,
  onMapClick,
  onMouseMove,
}: GISMapProps) {
  // Existing AOIs GeoJSON FeatureCollection
  const existingAOIsGeoJSON = useMemo(() => {
    if (!aois || aois.length === 0 || !isAOILayerVisible) {
      return { type: "FeatureCollection" as const, features: [] };
    }

    // Filter out the active edited AOI from passive rendering so edit layer takes precedence
    const filteredAOIs = isEditing
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
  }, [aois, isAOILayerVisible, isEditing, selectedAoiId]);

  // Active in-progress edited polygon GeoJSON
  const editPolygonGeoJSON = useMemo(() => {
    if (!isEditing || editPoints.length < 3) {
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
          properties: {},
        },
      ],
    };
  }, [isEditing, editPoints]);

  // In-progress drawing lines & polygon GeoJSON
  const drawVectorsGeoJSON = useMemo(() => {
    if (!isDrawing || drawPoints.length === 0) {
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
  }, [isDrawing, drawPoints, cursorPos]);

  // In-progress drawing vertices GeoJSON
  const drawPointsGeoJSON = useMemo(() => {
    if (!isDrawing || drawPoints.length === 0) {
      return { type: "FeatureCollection" as const, features: [] };
    }
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
  }, [isDrawing, drawPoints]);

  // Measurement vectors GeoJSON
  const measureVectorsGeoJSON = useMemo(() => {
    const isMeasuring =
      activeTool === "measure_distance" || activeTool === "measure_area";
    if (!isMeasuring || measurePoints.length === 0) {
      return { type: "FeatureCollection" as const, features: [] };
    }

    const coords = [...measurePoints];
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

    if (activeTool === "measure_area" && measurePoints.length >= 3) {
      features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...measurePoints, measurePoints[0]]],
        },
        properties: {},
      });
    }

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [activeTool, measurePoints, cursorPos]);

  // Cursor style calculation
  const mapCursor = useMemo(() => {
    if (isDrawing || activeTool === "measure_distance" || activeTool === "measure_area") {
      return "crosshair";
    }
    if (activeTool === "inspect_pixel") {
      return "crosshair";
    }
    if (isEditing) {
      return "default";
    }
    return "grab";
  }, [isDrawing, isEditing, activeTool]);

  return (
    <Map
      ref={mapRef}
      initialViewState={initialViewState}
      mapStyle={selectedBasemap.styleUrl}
      style={{ width: "100%", height: "100%" }}
      interactive={true}
      interactiveLayerIds={["existing-aois-fill", "existing-aois-line"]}
      cursor={mapCursor}
      onClick={onMapClick}
      onMouseMove={onMouseMove}
      doubleClickZoom={!isDrawing && !isEditing && activeTool === "navigate"}
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
      {/* Raster Tile Layers (Rendered in catalog order) */}
      {rasters &&
        rasters.map((raster) => {
          const isVisible = rasterVisibility[raster.id] ?? true;
          const opacity = rasterOpacity[raster.id] ?? 0.85;
          const apiBase = process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
            : "/api/v1";
          const tileUrl = `${apiBase}/projects/${projectId}/rasters/${raster.id}/tiles/{z}/{x}/{y}.png`;

          if (!isVisible) return null;

          return (
            <Source
              key={`raster-source-${raster.id}`}
              id={`raster-source-${raster.id}`}
              type="raster"
              tiles={[tileUrl]}
              tileSize={256}
            >
              <Layer
                id={`raster-layer-${raster.id}`}
                type="raster"
                paint={{
                  "raster-opacity": opacity,
                  "raster-fade-duration": 200,
                }}
              />
            </Source>
          );
        })}

      {/* Existing Vector AOI Layers */}
      {isAOILayerVisible && (
        <Source id="existing-aois-source" type="geojson" data={existingAOIsGeoJSON}>
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
                0.35,
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
                3.5,
                2,
              ],
              "line-opacity": 0.95,
            }}
          />
        </Source>
      )}

      {/* Geometry Editing Layers & Draggable Vertex Markers */}
      {isEditing && (
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
                "fill-opacity": 0.28,
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

          {/* Draggable Vertex Markers */}
          {editPoints.map((pt, idx) => (
            <Marker
              key={`edit-vertex-${idx}`}
              longitude={pt[0]}
              latitude={pt[1]}
              anchor="center"
              draggable={true}
              onDrag={(e) => onVertexDrag(idx, e.lngLat.lng, e.lngLat.lat)}
            >
              <div
                className="group relative flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#D97706] shadow-md cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                title={`Vertex #${idx + 1}: [${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}]`}
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

      {/* Drawing Mode Layers */}
      {isDrawing && (
        <>
          <Source id="drawing-vectors-source" type="geojson" data={drawVectorsGeoJSON}>
            <Layer
              id="draw-polygon-preview"
              type="fill"
              filter={["==", ["geometry-type"], "Polygon"]}
              paint={{
                "fill-color": "#10B981",
                "fill-opacity": 0.22,
              }}
            />
            <Layer
              id="draw-lines-preview"
              type="line"
              filter={["==", ["geometry-type"], "LineString"]}
              paint={{
                "line-color": "#0B57D0",
                "line-width": 2.5,
                "line-dasharray": [2, 1],
              }}
            />
          </Source>

          <Source id="drawing-points-source" type="geojson" data={drawPointsGeoJSON}>
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

      {/* Measurement Mode Layers */}
      {(activeTool === "measure_distance" || activeTool === "measure_area") && (
        <Source id="measure-vectors-source" type="geojson" data={measureVectorsGeoJSON}>
          <Layer
            id="measure-polygon-fill"
            type="fill"
            filter={["==", ["geometry-type"], "Polygon"]}
            paint={{
              "fill-color": "#8B5CF6",
              "fill-opacity": 0.2,
            }}
          />
          <Layer
            id="measure-lines-layer"
            type="line"
            filter={["==", ["geometry-type"], "LineString"]}
            paint={{
              "line-color": "#8B5CF6",
              "line-width": 2.5,
              "line-dasharray": [2, 1],
            }}
          />
        </Source>
      )}
    </Map>
  );
}
