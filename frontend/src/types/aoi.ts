export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONPolygon;
  properties?: Record<string, unknown>;
}

export interface AOICreate {
  name: string;
  description?: string | null;
  feature: GeoJSONFeature;
}

export interface AOIUpdate {
  name?: string | null;
  description?: string | null;
  feature?: GeoJSONFeature | null;
}

export interface AOIResponse {
  id: number;
  name: string;
  description: string | null;
  project_id: number;
  created_at: string;
  updated_at: string;
  feature: GeoJSONFeature;
}
