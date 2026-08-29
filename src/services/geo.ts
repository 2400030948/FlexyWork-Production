/**
 * Browser geolocation helpers.
 *
 * Wraps `navigator.geolocation.getCurrentPosition` with timeout /
 * permission / support handling so callers don't have to repeat the
 * boilerplate. Returns a discriminated-union result so the UI can
 * surface a meaningful, non-spammy message for every failure mode.
 */

export type Coordinates = {
  latitude: number;
  longitude: number;
  /** Reported accuracy in metres, when available. */
  accuracy?: number | null;
};

export type GeoResult =
  | { ok: true; coords: Coordinates }
  | { ok: false; code: GeoErrorCode; message: string };

export type GeoErrorCode =
  | 'unsupported'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'invalid'
  | 'unknown';

const GEO_TIMEOUT_MS = 10_000;

const messages: Record<GeoErrorCode, string> = {
  unsupported: 'Your browser does not support location services.',
  permission_denied:
    'Location permission was denied. You can still search by entering your city manually.',
  position_unavailable: 'We could not determine your current location right now. Try again or enter a city.',
  timeout: 'Getting your location took too long. Please try again or enter a city.',
  invalid: 'We received an invalid location reading. Please try again or enter a city.',
  unknown: 'Something went wrong while getting your location. Please try again or enter a city.'
};

export function describeGeoError(code: GeoErrorCode): string {
  return messages[code];
}

/** Returns true if the runtime exposes a usable Geolocation API. */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in window.navigator;
}

export function getCurrentPosition(): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (!isGeolocationSupported()) {
      resolve({ ok: false, code: 'unsupported', message: messages.unsupported });
      return;
    }

    let settled = false;
    const finish = (result: GeoResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position?.coords?.latitude);
        const lng = Number(position?.coords?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          finish({ ok: false, code: 'invalid', message: messages.invalid });
          return;
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          finish({ ok: false, code: 'invalid', message: messages.invalid });
          return;
        }
        finish({
          ok: true,
          coords: {
            latitude: lat,
            longitude: lng,
            accuracy: Number.isFinite(position?.coords?.accuracy)
              ? position.coords.accuracy
              : null
          }
        });
      },
      (error) => {
        let code: GeoErrorCode = 'unknown';
        if (error?.code === 1) code = 'permission_denied';
        else if (error?.code === 2) code = 'position_unavailable';
        else if (error?.code === 3) code = 'timeout';
        finish({ ok: false, code, message: messages[code] });
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: GEO_TIMEOUT_MS
      }
    );
  });
}