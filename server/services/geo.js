/**
 * Geolocation helpers.
 *
 * Single source of truth for distance math on the server so the
 * frontend cannot manipulate "closeness" and the algorithm is shared
 * between worker-search ranking, admin dashboards and any future
 * location-aware features.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two {latitude, longitude} points
 * using the Haversine formula. Returns a distance in kilometres
 * rounded to two decimal places.
 *
 * Returns null if either point is missing or invalid so callers can
 * distinguish "unknown distance" from "0 km apart".
 */
export function haversineKm(a, b) {
  if (!a || !b) return null;
  const lat1 = Number(a.latitude);
  const lon1 = Number(a.longitude);
  const lat2 = Number(b.latitude);
  const lon2 = Number(b.longitude);

  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return null;
  }

  if (
    lat1 < -90 || lat1 > 90 ||
    lon1 < -180 || lon1 > 180 ||
    lat2 < -90 || lat2 > 90 ||
    lon2 < -180 || lon2 > 180
  ) {
    return null;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinDLon * sinDLon;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  const km = EARTH_RADIUS_KM * c;
  return Math.round(km * 100) / 100;
}

/**
 * Conservative latitude/longitude bounding box around a centre point.
 *
 * Used as a pre-filter at the database level so we don't pull tens of
 * thousands of profiles into memory just to compute Haversine. The
 * bounding box is intentionally a little larger than the requested
 * radius (1.4x) to absorb the curvature of the Earth at the
 * extremes of latitude.
 *
 * Returns `null` when no usable origin was provided so the caller can
 * skip the geo filter entirely (no geo search requested).
 */
export function boundingBox(origin, radiusKm) {
  if (!origin || !Number.isFinite(origin.latitude) || !Number.isFinite(origin.longitude)) {
    return null;
  }
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    return null;
  }

  const lat = origin.latitude;
  const lng = origin.longitude;
  const expanded = radiusKm * 1.4;

  const latDelta = expanded / 111; // ~111 km per degree of latitude
  const cosLat = Math.max(Math.cos(toRadians(lat)), 0.0001);
  const lngDelta = expanded / (111 * cosLat);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta
  };
}

/**
 * Validate user-supplied coordinates. Used by route handlers so we
 * never trust what the client sends without bounds-checking first.
 */
export function isValidCoordinate(value, min, max) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

export const EARTH_RADIUS_KM_CONSTANT = EARTH_RADIUS_KM;