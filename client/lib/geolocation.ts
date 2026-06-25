export type GeoPoint = { lat: number; lng: number };

/** Pusat Bandung — fallback jika geolokasi ditolak */
export const DEFAULT_MAP_CENTER: GeoPoint = {
  lat: -6.914744,
  lng: 107.60981,
};

export function getBrowserLocation(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolokasi tidak didukung browser ini."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  });
}

/** Reverse geocode via OpenStreetMap Nominatim (gratis, tanpa API key) */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("accept-language", "id");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    if (data.display_name) {
      const parts = data.display_name.split(",").slice(0, 4).map((p) => p.trim());
      return parts.join(", ");
    }

    const addr = data.address;
    if (!addr) return null;

    const segments = [
      addr.road,
      addr.neighbourhood ?? addr.suburb,
      addr.city ?? addr.town ?? addr.village,
      addr.state,
    ].filter(Boolean);

    return segments.length > 0 ? segments.join(", ") : null;
  } catch {
    return null;
  }
}
