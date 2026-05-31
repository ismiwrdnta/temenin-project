import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapProvider = {
  id: number;
  name: string;
  initials: string;
  tags: string[];
  distance: string;
  lat: number;
  lng: number;
};

export const USER_LOCATION = {
  lat: -6.914744,
  lng: 107.60981,
  initials: "D",
  label: "Lokasimu",
};

function createProviderIcon(initials: string, highlighted = false) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      background: #FBCFE8;
      border: 2px solid ${highlighted ? "#E91E8C" : "#F9A8D4"};
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Poppins, sans-serif;
      font-weight: 700;
      font-size: 13px;
      color: #E91E8C;
      ${highlighted ? "transform: scale(1.12);" : ""}
    ">${initials}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      background: #FACC15;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Poppins, sans-serif;
      font-weight: 700;
      font-size: 13px;
      color: #2C1810;
    ">${USER_LOCATION.initials}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

function buildProviderPopup(provider: MapProvider) {
  const tags = provider.tags
    .map(
      (tag) =>
        `<span style="background:#FDF4FF;color:#E91E8C;font-size:10px;font-weight:500;padding:2px 8px;border-radius:9999px;margin-right:4px;">${tag}</span>`,
    )
    .join("");

  return `
    <div style="font-family:Poppins,sans-serif;font-size:14px;min-width:140px;">
      <p style="font-weight:700;color:#4C1D95;margin:0;">${provider.name}</p>
      <div style="margin:6px 0 4px;">${tags}</div>
      <p style="color:#94A3B8;font-size:12px;margin:0;">${provider.distance} dari kamu</p>
    </div>
  `;
}

type ProviderMapProps = {
  providers: MapProvider[];
  highlightedId?: number | null;
};

export default function ProviderMap({
  providers,
  highlightedId = null,
}: ProviderMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [USER_LOCATION.lat, USER_LOCATION.lng],
      zoom: 13,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const userMarker = L.marker([USER_LOCATION.lat, USER_LOCATION.lng], {
      icon: createUserIcon(),
      zIndexOffset: 1000,
    });
    userMarker.bindPopup(`
      <div style="font-family:Poppins,sans-serif;font-size:14px;">
        <p style="font-weight:700;color:#2C1810;margin:0;">${USER_LOCATION.label}</p>
        <p style="color:#94A3B8;font-size:12px;margin:4px 0 0;">Posisi kamu saat ini</p>
      </div>
    `);
    layer.addLayer(userMarker);

    providers.forEach((provider) => {
      const marker = L.marker([provider.lat, provider.lng], {
        icon: createProviderIcon(
          provider.initials,
          highlightedId === provider.id,
        ),
      });
      marker.bindPopup(buildProviderPopup(provider));
      layer.addLayer(marker);
    });

    const points: L.LatLngExpression[] = providers.map((p) => [p.lat, p.lng]);
    points.push([USER_LOCATION.lat, USER_LOCATION.lng]);

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        padding: [48, 48],
        maxZoom: 15,
      });
    } else {
      map.setView([USER_LOCATION.lat, USER_LOCATION.lng], 14);
    }
  }, [providers, highlightedId]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="h-full w-full z-0" />

      <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs text-[#64748B]">
          <span className="w-3 h-3 rounded-full bg-[#FACC15] border border-white shadow-sm" />
          Kamu
        </div>
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs text-[#64748B]">
          <span className="w-3 h-3 rounded-full bg-[#FBCFE8] border border-[#F9A8D4]" />
          Temanian
        </div>
      </div>
    </div>
  );
}
