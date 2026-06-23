import { useEffect, useState } from "react";
import type { UserMapLocation } from "@/components/ProviderMap";
import { useAuth } from "@/context/AuthContext";
import { fetchMyProviderProfile, getInitials } from "@/lib/bookingApi";
import { DEFAULT_MAP_CENTER, getBrowserLocation } from "@/lib/geolocation";

export function useMapLocation() {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<UserMapLocation | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      setLoading(true);

      if (user?.role === "penyedia") {
        try {
          const profile = await fetchMyProviderProfile();
          const lat = profile.latitude
            ? parseFloat(String(profile.latitude))
            : NaN;
          const lng = profile.longitude
            ? parseFloat(String(profile.longitude))
            : NaN;

          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            if (!cancelled) {
              setUserLocation({
                lat,
                lng,
                initials: getInitials(user.name),
                label: user.name,
              });
            }
            setLoading(false);
            return;
          }
        } catch {
          // lanjut ke geolokasi browser
        }
      }

      try {
        const pos = await getBrowserLocation();
        if (!cancelled) {
          setUserLocation({
            lat: pos.lat,
            lng: pos.lng,
            initials: getInitials(user?.name ?? "Kamu"),
            label: user?.name ?? "Lokasimu",
          });
        }
      } catch {
        if (!cancelled && user) {
          setUserLocation({
            lat: DEFAULT_MAP_CENTER.lat,
            lng: DEFAULT_MAP_CENTER.lng,
            initials: getInitials(user.name),
            label: user.name,
          });
        } else if (!cancelled) {
          setUserLocation(null);
        }
      }

      if (!cancelled) setLoading(false);
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.name, user?.role]);

  return { userLocation, loading };
}
