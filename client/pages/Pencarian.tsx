import { useEffect, useMemo, useRef, useState } from "react";
import {
  Filter,
  MapPin,
  Map,
  LayoutList,
  Search,
  Star,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import ProviderMap, { type MapProvider } from "@/components/ProviderMap";
import { useMapLocation } from "@/hooks/useMapLocation";
import { searchProviders } from "@/lib/bookingApi";
import { mapApiProviderToMapProvider } from "@/lib/provider-map";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import {
  computeMatchScore,
  hasAnyPreference,
  type CommunicationStyle,
  type AgeGroupPref,
} from "@/lib/smart-match";

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = "semua" | "temenin" | "curhat" | "bantu";
type ViewMode = "list" | "map";
type SortKey = "jarak" | "rating" | "harga_asc" | "harga_desc" | "kecocokan";

const CATEGORIES: { key: Category; label: string; emoji: string; api?: string }[] = [
  { key: "semua",   label: "Semua",   emoji: "✨" },
  { key: "temenin", label: "Temenin", emoji: "🤝", api: "temenin" },
  { key: "curhat",  label: "Curhat",  emoji: "💬", api: "curhat" },
  { key: "bantu",   label: "Bantu",   emoji: "🛒", api: "bantu_aktivitas" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "jarak",       label: "Terdekat" },
  { key: "rating",      label: "Rating Terbaik" },
  { key: "harga_asc",   label: "Harga Terendah" },
  { key: "harga_desc",  label: "Harga Tertinggi" },
  { key: "kecocokan",   label: "Paling Cocok ✨" },
];

const INTEREST_OPTIONS = [
  "Olahraga", "Musik", "Kuliner", "Seni", "Teknologi",
  "Pendidikan", "Film & Hiburan", "Traveling", "Gaming", "Kesehatan",
];

const COMM_STYLE_OPTIONS: { key: CommunicationStyle; label: string; desc: string }[] = [
  { key: "santai",   label: "😊 Santai",    desc: "Ngobrol bebas & fun" },
  { key: "empati",   label: "🤗 Empatik",   desc: "Sabar & pendengar baik" },
  { key: "serius",   label: "💼 Serius",    desc: "Profesional & fokus" },
  { key: "fleksibel",label: "🔄 Fleksibel", desc: "Menyesuaikan situasi" },
];

const AGE_PREF_OPTIONS: { key: AgeGroupPref; label: string }[] = [
  { key: "semua",  label: "Semua Usia" },
  { key: "muda",   label: "Muda (18–25)" },
  { key: "dewasa", label: "Dewasa (26–35)" },
  { key: "senior", label: "Senior (36+)" },
];

const ACTIVITY_OPTIONS: { key: string; label: string }[] = [
  { key: "temenin",        label: "🤝 Temenin" },
  { key: "curhat",         label: "💬 Curhat" },
  { key: "bantu_aktivitas",label: "🛒 Bantu Aktivitas" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function parsePrice(priceStr: string): number {
  const nums = priceStr.replace(/\D/g, "");
  return parseInt(nums, 10) || 0;
}

function getProviderLink(provider: MapProvider): string {
  return `/provider/${provider.id}/pilih-layanan`;
}

function getServiceBadge(provider: MapProvider) {
  const tags = provider.tags.map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("temenin")))
    return { label: "Temenin", color: "bg-[#FDF4FF] text-[#E91E8C] border-[#FBCFE8]" };
  if (tags.some((t) => t.includes("curhat")))
    return { label: "Curhat", color: "bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]" };
  return { label: "Bantu", color: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]" };
}

// ─── Match Score Badge ─────────────────────────────────────────────────────────
function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? "bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white" :
    score >= 50 ? "bg-[#FDF4FF] text-[#7C3AED] border border-[#DDD6FE]" :
                  "bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0]";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", color)}>
      <Sparkles className="w-2.5 h-2.5" />
      {score}% cocok
    </span>
  );
}

// ─── Provider Card ────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  isHighlighted,
  onHover,
}: {
  provider: MapProvider;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
}) {
  const link = getProviderLink(provider);
  const badge = getServiceBadge(provider);

  return (
    <Link
      to={link}
      className={cn(
        "group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col sm:flex-row",
        isHighlighted
          ? "border-[#E91E8C] shadow-lg shadow-[#E91E8C]/10 ring-2 ring-[#E91E8C]/20"
          : "border-gray-100 shadow-sm hover:border-[#FBCFE8] hover:shadow-md",
      )}
      onMouseEnter={() => onHover?.(provider.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Avatar strip */}
      <div className="sm:w-24 flex-shrink-0 bg-gradient-to-br from-[#FDF4FF] to-[#FFF0F8] flex items-center justify-center py-5 sm:py-0">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center text-white font-bold text-base shadow-md">
          {provider.initials}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="text-[#2C1810] font-bold text-base group-hover:text-[#E91E8C] transition-colors truncate">
              {provider.name}
            </h3>
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0",
                badge.color,
              )}
            >
              {badge.label}
            </span>
            {provider.matchScore != null && (
              <MatchBadge score={provider.matchScore} />
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {provider.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1 font-medium text-[#2C1810]">
              <Star className="w-3.5 h-3.5 fill-[#FACC15] text-[#FACC15]" />
              {provider.rating.toFixed(2)}
              <span className="text-[#94A3B8] font-normal">({provider.reviews})</span>
            </span>
            <span className="text-[#94A3B8]">·</span>
            <span className="flex items-center gap-1 text-[#64748B]">
              <MapPin className="w-3 h-3" />
              {provider.distance}
            </span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-[#E91E8C] font-bold text-base">{provider.price}</p>
          </div>
          <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white text-xs font-semibold whitespace-nowrap shadow-sm group-hover:opacity-90">
            Pesan →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProviderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row animate-pulse">
      <div className="sm:w-24 h-20 sm:h-auto bg-[#F8FAFC] flex-shrink-0" />
      <div className="flex-1 p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-2/5" />
        <div className="flex gap-2">
          <div className="h-3 bg-gray-100 rounded-full w-16" />
          <div className="h-3 bg-gray-100 rounded-full w-14" />
        </div>
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Pencarian() {
  usePageTitle("Pencarian | TEMENIN");
  const { userLocation, loading: loadingLocation } = useMapLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("semua");
  const [sortKey, setSortKey] = useState<SortKey>("jarak");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [providers, setProviders] = useState<MapProvider[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showPrefPanel, setShowPrefPanel] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const {
    prefs,
    toggleInterest,
    setCommunicationStyle,
    toggleActivity,
    setAgeGroupPref,
    resetPrefs,
  } = useUserPreferences();

  const prefActive = hasAnyPreference(prefs);

  useEffect(() => {
    if (loadingLocation) return;
    let cancelled = false;
    (async () => {
      setLoadingProviders(true);
      setFetchError(null);
      try {
        const cat = CATEGORIES.find((c) => c.key === activeCategory)?.api;
        const raw = await searchProviders({
          category: cat,
          lat: userLocation?.lat,
          lng: userLocation?.lng,
          radius: 50,
          limit: 100,
        });
        const mapped = raw
          .map((p) => mapApiProviderToMapProvider(p, userLocation))
          .filter((p): p is MapProvider => p !== null)
          .sort((a, b) => a.distanceKm - b.distanceKm);
        if (!cancelled) setProviders(mapped);
      } catch (err) {
        if (!cancelled)
          setFetchError(err instanceof Error ? err.message : "Gagal memuat provider.");
      } finally {
        if (!cancelled) setLoadingProviders(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeCategory, userLocation, loadingLocation]);

  const providersWithScore = useMemo(() => {
    if (!prefActive) return providers.map((p) => ({ ...p, matchScore: undefined }));
    return providers.map((p) => {
      const score = computeMatchScore(prefs, {
        bio: p.bio ?? null,
        categories: p.rawCategories ?? [],
      });
      return { ...p, matchScore: score.total };
    });
  }, [providers, prefs, prefActive]);

  const filteredProviders = useMemo(() => {
    let list = providersWithScore;
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    return [...list].sort((a, b) => {
      if (sortKey === "kecocokan") return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      if (sortKey === "rating") return b.rating - a.rating;
      if (sortKey === "harga_asc") return parsePrice(a.price) - parsePrice(b.price);
      if (sortKey === "harga_desc") return parsePrice(b.price) - parsePrice(a.price);
      return a.distanceKm - b.distanceKm;
    });
  }, [providersWithScore, searchQuery, sortKey, minRating]);

  const loading = loadingLocation || loadingProviders;
  const activeFilters = (minRating > 0 ? 1 : 0) + (sortKey !== "jarak" ? 1 : 0);

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      {/* Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#FFF0F8] rounded-full blur-3xl opacity-50" />
      </div>

      <AppNavbar activePage="pencarian" />

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="mb-6">
            <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
              Cari Provider
            </h1>
            <p className="text-[#94A3B8] text-sm">
              {userLocation
                ? `Menampilkan provider di sekitar ${userLocation.label}`
                : "Izinkan akses lokasi untuk hasil pencarian yang lebih akurat"}
            </p>
          </div>

          {/* ── Search Bar ─────────────────────────────────────── */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] pointer-events-none" />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama provider atau layanan..."
              className="w-full h-13 pl-12 pr-12 py-3.5 bg-white rounded-2xl border border-[#F3E8FF] text-sm text-[#2C1810] placeholder:text-[#94A3B8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C]/50 transition-shadow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] hover:text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── Category + Controls Row ─────────────────────────── */}
          <div className="flex items-center gap-3 flex-wrap mb-5">
            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeCategory === cat.key
                      ? "bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white shadow-sm"
                      : "bg-white text-[#7C3AED] border border-[#FBCFE8] hover:bg-[#FDF4FF]",
                  )}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Smart Match button */}
              <button
                type="button"
                onClick={() => setShowPrefPanel(!showPrefPanel)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors",
                  showPrefPanel
                    ? "bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white border-transparent"
                    : prefActive
                      ? "bg-[#FDF4FF] text-[#7C3AED] border-[#DDD6FE]"
                      : "bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#FBCFE8]",
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Smart Match</span>
                {prefActive && !showPrefPanel && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#A131CC] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    ✓
                  </span>
                )}
              </button>

              {/* Filter button */}
              <button
                type="button"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors",
                  showFilterPanel
                    ? "bg-[#E91E8C] text-white border-[#E91E8C]"
                    : "bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#FBCFE8]",
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeFilters > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E91E8C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>

              {/* View toggle */}
              <div className="flex bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm transition-colors",
                    viewMode === "list"
                      ? "bg-[#FDF4FF] text-[#E91E8C]"
                      : "text-[#94A3B8] hover:text-[#64748B]",
                  )}
                >
                  <LayoutList className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Daftar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm border-l border-[#E5E7EB] transition-colors",
                    viewMode === "map"
                      ? "bg-[#FDF4FF] text-[#E91E8C]"
                      : "text-[#94A3B8] hover:text-[#64748B]",
                  )}
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Peta</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Smart Match Preference Panel ────────────────────── */}
          {showPrefPanel && (
            <div className="bg-white rounded-2xl border border-[#DDD6FE] shadow-sm p-5 mb-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E91E8C] to-[#A131CC] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[#2C1810] font-bold text-sm">Smart Matching</p>
                    <p className="text-[#94A3B8] text-[10px]">Skor kecocokan: minat 40% · gaya 30% · aktivitas 20% · usia 10%</p>
                  </div>
                </div>
                {prefActive && (
                  <button
                    type="button"
                    onClick={resetPrefs}
                    className="text-[#E91E8C] text-xs font-medium hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Minat */}
                <div>
                  <p className="text-[#2C1810] font-semibold text-xs mb-2 uppercase tracking-wide">
                    Minat (40%)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {INTEREST_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleInterest(opt)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                          prefs.interests.includes(opt)
                            ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                            : "bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#A131CC]",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gaya Komunikasi */}
                <div>
                  <p className="text-[#2C1810] font-semibold text-xs mb-2 uppercase tracking-wide">
                    Gaya Komunikasi (30%)
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COMM_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          setCommunicationStyle(
                            prefs.communicationStyle === opt.key ? "" : opt.key,
                          )
                        }
                        className={cn(
                          "flex flex-col items-start px-3 py-2 rounded-xl text-xs border transition-colors text-left",
                          prefs.communicationStyle === opt.key
                            ? "bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white border-transparent"
                            : "bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#FBCFE8]",
                        )}
                      >
                        <span className="font-semibold">{opt.label}</span>
                        <span className="opacity-75 text-[10px]">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipe Aktivitas */}
                <div>
                  <p className="text-[#2C1810] font-semibold text-xs mb-2 uppercase tracking-wide">
                    Tipe Aktivitas (20%)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ACTIVITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleActivity(opt.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          prefs.preferredActivities.includes(opt.key)
                            ? "bg-[#E91E8C] text-white border-[#E91E8C]"
                            : "bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#FBCFE8]",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Usia */}
                <div>
                  <p className="text-[#2C1810] font-semibold text-xs mb-2 uppercase tracking-wide">
                    Preferensi Usia (10%)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AGE_PREF_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setAgeGroupPref(opt.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          prefs.ageGroupPref === opt.key
                            ? "bg-[#FACC15] text-[#2C1810] border-[#FACC15]"
                            : "bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#FACC15]",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {prefActive && (
                <div className="mt-4 pt-4 border-t border-[#F3E8FF] flex items-center justify-between">
                  <p className="text-[#7C3AED] text-xs">
                    ✨ Skor kecocokan ditampilkan di tiap kartu provider
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSortKey("kecocokan");
                      setShowPrefPanel(false);
                    }}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white text-xs font-semibold"
                  >
                    Urutkan paling cocok →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Filter Panel ────────────────────────────────────── */}
          {showFilterPanel && (
            <div className="bg-white rounded-2xl border border-[#F3E8FF] shadow-sm p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Sort */}
              <div>
                <p className="text-[#2C1810] font-semibold text-sm mb-3 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Urutkan
                </p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSortKey(opt.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        sortKey === opt.key
                          ? "bg-[#E91E8C] text-white border-[#E91E8C]"
                          : "bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#FBCFE8]",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <p className="text-[#2C1810] font-semibold text-sm mb-3 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#FACC15] text-[#FACC15]" />
                  Rating Minimal
                </p>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMinRating(r)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        minRating === r
                          ? "bg-[#FACC15] text-[#2C1810] border-[#FACC15]"
                          : "bg-white text-[#64748B] border-[#E5E7EB] hover:border-[#FACC15]",
                      )}
                    >
                      {r === 0 ? "Semua" : `≥ ${r}★`}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={() => { setSortKey("jarak"); setMinRating(0); }}
                  className="sm:col-span-2 text-[#E91E8C] text-xs font-medium hover:underline text-left"
                >
                  Reset semua filter
                </button>
              )}
            </div>
          )}

          {fetchError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {fetchError}
            </div>
          )}

          {/* ── Result Count ────────────────────────────────────── */}
          {!loading && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#64748B] text-sm">
                <span className="font-bold text-[#2C1810]">
                  {filteredProviders.length}
                </span>{" "}
                provider ditemukan
                {searchQuery && (
                  <span className="text-[#94A3B8]"> untuk "{searchQuery}"</span>
                )}
              </p>
              {!userLocation && (
                <span className="flex items-center gap-1 text-[#94A3B8] text-xs">
                  <MapPin className="w-3 h-3" />
                  Aktifkan lokasi untuk jarak
                </span>
              )}
            </div>
          )}

          {/* ── Map View ────────────────────────────────────────── */}
          {viewMode === "map" && (
            <div className="mb-6">
              <div className="relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                {loading ? (
                  <div className="h-full flex items-center justify-center bg-[#F8FAFC] text-[#94A3B8] text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#E91E8C]/30 border-t-[#E91E8C] rounded-full animate-spin" />
                      Memuat peta...
                    </div>
                  </div>
                ) : (
                  <ProviderMap
                    providers={filteredProviders}
                    userLocation={userLocation}
                    highlightedId={highlightedId}
                  />
                )}
              </div>
              <p className="text-[#94A3B8] text-xs mt-2">
                📍 Pink = provider terverifikasi
                {userLocation ? ` · 🟡 Kuning = lokasimu (${userLocation.label})` : ""}
              </p>
            </div>
          )}

          {/* ── List View ───────────────────────────────────────── */}
          {viewMode === "list" && (
            <section>
              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((i) => <ProviderSkeleton key={i} />)}
                </div>
              ) : filteredProviders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {filteredProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      isHighlighted={highlightedId === provider.id}
                      onHover={setHighlightedId}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full py-16 bg-white rounded-2xl border border-dashed border-[#E9D5FF] flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-[#D8B4E2]" />
                  </div>
                  <p className="text-[#2C1810] font-semibold text-base mb-1">
                    Tidak ada provider ditemukan
                  </p>
                  <p className="text-[#94A3B8] text-sm max-w-xs leading-relaxed">
                    {searchQuery
                      ? `Tidak ada provider yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
                      : "Belum ada provider di kategori ini. Coba ubah filter atau kategori."}
                  </p>
                  {(searchQuery || activeFilters > 0) && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); setSortKey("jarak"); setMinRating(0); setActiveCategory("semua"); }}
                      className="mt-4 px-5 py-2 rounded-full bg-[#FDF4FF] text-[#E91E8C] text-sm font-medium border border-[#FBCFE8] hover:bg-[#FCE7F3]"
                    >
                      Reset pencarian
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Map + List side by side (desktop, list mode) ────── */}
          {viewMode === "list" && !loading && filteredProviders.length > 0 && (
            <div className="mt-6 hidden lg:block">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className="flex items-center gap-2 text-[#7C3AED] text-sm font-medium hover:text-[#E91E8C] transition-colors"
              >
                <Map className="w-4 h-4" />
                Lihat di Peta →
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
