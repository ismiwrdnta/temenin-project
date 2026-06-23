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
