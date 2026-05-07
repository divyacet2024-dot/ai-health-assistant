/**
 * Reverse geocode lat/lng → human label (OpenStreetMap Nominatim).
 * Respect usage policy: cache-friendly; call sparingly from API routes only.
 */

export type ReverseGeocodeResult = {
  label: string;
  city?: string;
  state?: string;
  country?: string;
};

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AIHealthAssist/1.0 (local dev; educational health assistant)',
      },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        region?: string;
        country?: string;
      };
    };

    const a = data.address;
    const city = a?.city || a?.town || a?.village;
    const state = a?.state || a?.region;
    const country = a?.country;
    const label =
      data.display_name ||
      [city, state, country].filter(Boolean).join(', ') ||
      `${lat.toFixed(3)}, ${lon.toFixed(3)}`;

    return {
      label,
      city,
      state,
      country,
    };
  } catch {
    return null;
  }
}
