import { useEffect, useRef } from "react";
import type { PickedLocation } from "@/components/LocationPickerMap";
import { reverseGeocode } from "@/lib/geolocation";

/** Isi field alamat otomatis saat pin peta atau geolokasi berubah */
export function useLocationAddress(
  location: PickedLocation | null,
  onAddress: (address: string) => void,
) {
  const onAddressRef = useRef(onAddress);
  useEffect(() => {
    onAddressRef.current = onAddress;
  }, [onAddress]);

  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    (async () => {
      const address = await reverseGeocode(location.lat, location.lng);
      if (!cancelled && address) {
        onAddressRef.current(address);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location?.lat, location?.lng]);
}
