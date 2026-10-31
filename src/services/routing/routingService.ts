/**
 * Geographic Routing & Distance Service
 * Provides Haversine geographic distance calculation and OpenStreetMap-based
 * OSRM driving route resolution with automatic offline/geodesic fallback.
 * Completely free, open, and requires zero API keys.
 */

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng] pairs for Leaflet polylines
  distanceKm: number;
  durationMinutes: number;
  isFallback: boolean;
  summary?: string;
}

// In-memory cache to minimize external network requests
const routeCache = new Map<string, RouteResult>();

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula (in kilometers).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Formats a distance in kilometers into a human-readable string.
 */
export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Generates an interpolated geodesic path between two coordinates.
 * Used as a 100% reliable fallback when an external routing server is unavailable.
 */
function generateGeodesicPath(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  steps: number = 8
): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    coords.push([
      from.lat + (to.lat - from.lat) * t,
      from.lng + (to.lng - from.lng) * t
    ]);
  }
  return coords;
}

/**
 * Fetches real driving route geometry from the public OSRM (Open Source Routing Machine) API.
 * Falls back transparently to geodesic calculation if the service times out or is offline.
 */
export async function fetchDrivingRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<RouteResult> {
  // Validate coordinates
  if (
    typeof from.lat !== 'number' ||
    typeof from.lng !== 'number' ||
    typeof to.lat !== 'number' ||
    typeof to.lng !== 'number'
  ) {
    return {
      coordinates: [],
      distanceKm: 0,
      durationMinutes: 0,
      isFallback: true,
      summary: 'Invalid Coordinates'
    };
  }

  const cacheKey = `${from.lat.toFixed(4)},${from.lng.toFixed(4)}->${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const haversineDist = calculateHaversineDistanceKm(from.lat, from.lng, to.lat, to.lng);
  const estimatedDuration = Math.max(4, Math.round((haversineDist / 28) * 60)); // Avg 28 km/h city transit speed

  try {
    // OpenStreetMap public OSRM driving service (zero API key)
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const primaryRoute = data.routes[0];
        // OSRM returns GeoJSON coordinates as [longitude, latitude].
        // Leaflet requires [latitude, longitude].
        const leafCoords: [number, number][] = primaryRoute.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        const realDistKm = Math.round((primaryRoute.distance / 1000) * 10) / 10;
        const realDurationMin = Math.max(1, Math.round(primaryRoute.duration / 60));

        const result: RouteResult = {
          coordinates: leafCoords,
          distanceKm: realDistKm,
          durationMinutes: realDurationMin,
          isFallback: false,
          summary: `${realDistKm} km via urban corridors (~${realDurationMin} mins)`
        };

        routeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Network failure, timeout, or CORS restriction: seamlessly proceed to fallback
  }

  // Resilient Geodesic Fallback
  const fallbackResult: RouteResult = {
    coordinates: generateGeodesicPath(from, to, 10),
    distanceKm: haversineDist,
    durationMinutes: estimatedDuration,
    isFallback: true,
    summary: `${haversineDist} km direct corridor (~${estimatedDuration} mins)`
  };

  routeCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}
