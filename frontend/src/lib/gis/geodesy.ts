/**
 * Geodesic spatial calculations for distance, polyline length, and spherical polygon area.
 * Uses WGS84 Earth mean radius R = 6,371,008.8 meters.
 */

const EARTH_RADIUS_METERS = 6371008.8;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate Haversine great-circle distance between two [lon, lat] coordinates in meters.
 */
export function calculateSegmentDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculate total geodesic distance along a sequence of [lon, lat] coordinates in meters.
 */
export function calculatePolylineDistance(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateSegmentDistance(coordinates[i], coordinates[i + 1]);
  }
  return totalDistance;
}

/**
 * Calculate geodesic area of a spherical polygon on WGS84 in square meters.
 * Implements the spherical excess method (Chamberlain & Duquette algorithm).
 * @param coordinates Array of [longitude, latitude] vertices.
 */
export function calculatePolygonArea(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 3) return 0;

  // Make a copy and remove trailing duplicate closing vertex if present
  const points = [...coordinates];
  if (
    points.length > 3 &&
    points[0][0] === points[points.length - 1][0] &&
    points[0][1] === points[points.length - 1][1]
  ) {
    points.pop();
  }

  if (points.length < 3) return 0;

  let total = 0;
  const numPoints = points.length;

  for (let i = 0; i < numPoints; i++) {
    const lower = points[i];
    const middle = points[(i + 1) % numPoints];
    const upper = points[(i + 2) % numPoints];

    const deltaLambda = toRadians(upper[0] - lower[0]);
    const sinMiddlePhi = Math.sin(toRadians(middle[1]));

    total += deltaLambda * sinMiddlePhi;
  }

  const area = Math.abs((total * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 2);
  return area;
}

/**
 * Human-readable distance formatter (meters or kilometers).
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${distanceMeters.toFixed(1)} m`;
  }
  return `${(distanceMeters / 1000).toFixed(2)} km`;
}

/**
 * Human-readable area formatter (sq meters, hectares, or sq km).
 */
export function formatArea(areaSquareMeters: number): {
  sqMeters: string;
  hectares: string;
  sqKm: string;
  primary: string;
} {
  const ha = areaSquareMeters / 10000;
  const km2 = areaSquareMeters / 1000000;

  let primary = "";
  if (areaSquareMeters < 10000) {
    primary = `${areaSquareMeters.toFixed(1)} m²`;
  } else if (ha < 100) {
    primary = `${ha.toFixed(2)} ha`;
  } else {
    primary = `${km2.toFixed(3)} km²`;
  }

  return {
    sqMeters: `${areaSquareMeters.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²`,
    hectares: `${ha.toLocaleString(undefined, { maximumFractionDigits: 2 })} ha`,
    sqKm: `${km2.toLocaleString(undefined, { maximumFractionDigits: 3 })} km²`,
    primary,
  };
}

/**
 * Format longitude/latitude coordinates nicely with directional hemisphere.
 */
export function formatCoordinates(lon: number, lat: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lon).toFixed(5)}° ${lonDir}`;
}
