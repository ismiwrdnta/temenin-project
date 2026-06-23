import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { DEFAULT_MAP_CENTER } from "@/lib/geolocation";

export type PickedLocation = {
  lat: number;
  lng: number;
};

function createPinIcon(label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 42px;
      height: 42px;
      border-radius: 9999px;
      background: #FFFFFF;
      border: 2px solid #0D9488;
      box-shadow: 0 2px 10px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Poppins, sans-serif;
      font-weight: 800;
      font-size: 12px;
      color: #0F766E;
    ">${label}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

type LocationPickerMapProps = {
  value: PickedLocation | null;
  onChange: (next: PickedLocation) => void;
  markerLabel?: string;
  className?: string;
};

export default function LocationPickerMap({
  value,
  onChange,
  markerLabel = "📍",
  className,
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  // Keep onChange in a ref so the map initialization effect doesn't re-run
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initial = value ?? DEFAULT_MAP_CENTER;
    const map = L.map(containerRef.current, {
      center: [initial.lat, initial.lng],
      zoom: 13,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([initial.lat, initial.lng], {
      icon: createPinIcon(markerLabel),
      zIndexOffset: 1000,
      draggable: true,
    }).addTo(map);

    // Drag support – move the pin anywhere on the map
    marker.on("dragend", () => {
      const latlng = marker.getLatLng();
      onChangeRef.current({ lat: latlng.lat, lng: latlng.lng });
    });

    // Click on map also moves the pin
    map.on("click", (e) => {
      const next = { lat: e.latlng.lat, lng: e.latlng.lng };
      marker.setLatLng([next.lat, next.lng]);
      onChangeRef.current(next);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // Sync marker position when value changes from outside
  useEffect(() => {
    const marker = markerRef.current;
    const map = mapRef.current;
    if (!marker || !map || !value) return;
    marker.setLatLng([value.lat, value.lng]);
  }, [value]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="h-[220px] w-full rounded-xl overflow-hidden border border-[#E5E7EB]"
      />
      <p className="text-xs text-[#94A3B8] mt-1.5">
        💡 Klik pada peta atau geser pin untuk memilih lokasi
      </p>
    </div>
  );
}
