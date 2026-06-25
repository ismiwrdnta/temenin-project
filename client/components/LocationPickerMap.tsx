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
  const onChangeRef = useRef(onChange);
  const isDraggingRef = useRef(false);
  const lastValueRef = useRef<PickedLocation | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initial = value ?? DEFAULT_MAP_CENTER;
    lastValueRef.current = initial;

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
      draggable: true,
      autoPan: true,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.on("dragstart", () => {
      isDraggingRef.current = true;
    });

    marker.on("dragend", () => {
      isDraggingRef.current = false;
      const latlng = marker.getLatLng();
      const next = { lat: latlng.lat, lng: latlng.lng };
      lastValueRef.current = next;
      onChangeRef.current(next);
    });

    map.on("click", (e) => {
      const next = { lat: e.latlng.lat, lng: e.latlng.lng };
      marker.setLatLng([next.lat, next.lng]);
      lastValueRef.current = next;
      onChangeRef.current(next);
    });

    mapRef.current = map;
    markerRef.current = marker;

    window.setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    const map = mapRef.current;
    if (!marker || !map || !value) return;
    if (isDraggingRef.current) return;

    const prev = lastValueRef.current;
    if (
      prev &&
      Math.abs(prev.lat - value.lat) < 0.000001 &&
      Math.abs(prev.lng - value.lng) < 0.000001
    ) {
      return;
    }

    lastValueRef.current = value;
    marker.setLatLng([value.lat, value.lng]);
    map.panTo([value.lat, value.lng]);
  }, [value]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="relative z-0 h-[220px] w-full rounded-xl overflow-hidden border border-[#E5E7EB]"
      />
      <p className="text-xs text-[#94A3B8] mt-1.5">
        Klik peta atau geser pin untuk memilih lokasi
      </p>
    </div>
  );
}
