import type { ProviderSearchResult } from "@shared/api";
import type { MapProvider, UserMapLocation } from "@/components/ProviderMap";
import { getInitials } from "@/lib/bookingApi";

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

const CATEGORY_LABELS: Record<string, string> = {
  temenin: "Temenin",
  curhat: "Curhat",
  bantu_aktivitas: "Bantu",
};

export function mapApiProviderToMapProvider(
  provider: ProviderSearchResult,
  userLocation?: UserMapLocation | null,
): MapProvider | null {
  const lat = provider.latitude ? parseFloat(String(provider.latitude)) : NaN;
  const lng = provider.longitude ? parseFloat(String(provider.longitude)) : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const distanceKm =
    provider.distance_km != null
      ? Number(provider.distance_km)
      : userLocation
        ? haversineKm(userLocation.lat, userLocation.lng, lat, lng)
        : null;

  const tags =
    provider.categories?.map((c) => CATEGORY_LABELS[c] ?? c) ??
    (provider.area_description ? [provider.area_description] : []);

  const hourlyRate = parseFloat(provider.hourly_rate);
  const priceLabel = Number.isFinite(hourlyRate)
    ? `${Math.round(hourlyRate / 1000)}rb/Jam`
    : "-";

  return {
    id: provider.id,
    name: provider.full_name ?? "Provider",
    initials: getInitials(provider.full_name ?? "?"),
    tags,
    rating: Number(provider.avg_rating) || 0,
    reviews: provider.total_reviews ?? 0,
    price: priceLabel,
    distance:
      distanceKm != null ? formatDistanceKm(distanceKm) : "Jarak tidak diketahui",
    distanceKm: distanceKm ?? 999,
    lat,
    lng,
  };
}

export function anonListenerAlias(providerId: string): string {
  return `Pendengar-${providerId.slice(0, 4).toUpperCase()}`;
}
