import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import ProviderMap, { USER_LOCATION } from "@/components/ProviderMap";
import { cn } from "@/lib/utils";

type Category = "semua" | "temenin" | "curhat" | "bantu";

type Provider = {
  id: number;
  name: string;
  initials: string;
  tags: string[];
  rating: number;
  reviews: number;
  price: string;
  distance: string;
  lat: number;
  lng: number;
};

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "temenin", label: "Temenin" },
  { key: "curhat", label: "Curhat" },
  { key: "bantu", label: "Bantu" },
];

const MOCK_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: "Rafi Ananda",
    initials: "RA",
    tags: ["Temenin", "Curhat"],
    rating: 4.88,
    reviews: 83,
    price: "70rb/Jam",
    distance: "1.2 km",
    lat: -6.9082,
    lng: 107.6154,
  },
  {
    id: 2,
    name: "Risna",
    initials: "RI",
    tags: ["Curhat", "Bantu"],
    rating: 4.88,
    reviews: 61,
    price: "70rb/Jam",
    distance: "0.8 km",
    lat: -6.9118,
    lng: 107.6172,
  },
  {
    id: 3,
    name: "Bimo Pratama",
    initials: "BP",
    tags: ["Temenin", "Bantu"],
    rating: 4.75,
    reviews: 45,
    price: "65rb/Jam",
    distance: "2.1 km",
    lat: -6.9235,
    lng: 107.6021,
  },
  {
    id: 4,
    name: "Ismi Wardanita",
    initials: "IW",
    tags: ["Curhat", "Bantu"],
    rating: 4.88,
    reviews: 61,
    price: "70rb/Jam",
    distance: "0.8 km",
    lat: -6.9105,
    lng: 107.6148,
  },
  {
    id: 5,
    name: "Ima",
    initials: "IM",
    tags: ["Temenin", "Bantu"],
    rating: 4.75,
    reviews: 45,
    price: "65rb/Jam",
    distance: "2.1 km",
    lat: -6.9268,
    lng: 107.6115,
  },
];

function ProviderCard({
  provider,
  isHighlighted,
  onHover,
}: {
  provider: Provider;
  isHighlighted?: boolean;
  onHover?: (id: number | null) => void;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm border transition-colors cursor-default",
        isHighlighted
          ? "border-[#E91E8C] ring-2 ring-[#E91E8C]/20"
          : "border-gray-100",
      )}
      onMouseEnter={() => onHover?.(provider.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm flex-shrink-0">
          {provider.initials}
        </div>
        <div className="min-w-0">
          <h4 className="text-[#4C1D95] font-bold text-base">{provider.name}</h4>

          <div className="flex flex-wrap gap-2 mt-1.5 mb-1.5">
            {provider.tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#FDF4FF] text-[#E91E8C] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#FBCFE8]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="#2C1810"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span className="font-bold text-[#2C1810]">{provider.rating}</span>
              <span className="text-[#94A3B8]">({provider.reviews})</span>
            </div>
            <span className="text-[#94A3B8]">-</span>
            <span className="font-bold text-[#4C1D95]">{provider.price}</span>
          </div>
        </div>
      </div>

      <div className="text-[#94A3B8] text-xs font-medium sm:text-right flex-shrink-0">
        {provider.distance}
      </div>
    </div>
  );
}

export default function Pencarian() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("semua");
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter((provider) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        provider.name.toLowerCase().includes(searchQuery.trim().toLowerCase());

      const matchesCategory =
        activeCategory === "semua" ||
        provider.tags.some(
          (tag) => tag.toLowerCase() === activeCategory.toLowerCase(),
        );

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen w-full bg-[#FFF8F5] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#F3E8FF] rounded-full blur-3xl opacity-50" />
      </div>

      <AppNavbar activePage="pencarian" />

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          <section className="mb-6 lg:mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama provider..."
                className="w-full h-12 pl-12 pr-4 bg-white rounded-2xl border border-[#F3E8FF] text-sm text-[#2C1810] placeholder:text-[#94A3B8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 focus:border-[#E91E8C]/50 transition-shadow"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                    activeCategory === cat.key
                      ? "bg-[#E91E8C] text-white shadow-sm"
                      : "bg-[#FDF4FF] text-[#7C3AED] border border-[#FBCFE8] hover:bg-[#FCE7F3]",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6 lg:mb-8">
            <div className="relative w-full h-[240px] sm:h-[300px] lg:h-[360px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <ProviderMap
                providers={filteredProviders}
                highlightedId={highlightedId}
              />
              {filteredProviders.length === 0 && (
                <div className="absolute inset-0 z-[500] bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                  <p className="text-[#64748B] text-sm font-medium bg-white/90 px-4 py-2 rounded-full shadow-sm">
                    Tidak ada Temanian di peta untuk filter ini
                  </p>
                </div>
              )}
            </div>
            <p className="text-[#94A3B8] text-xs mt-2">
              Pin pink = lokasi Temanian · Pin kuning = lokasimu (
              {USER_LOCATION.label})
            </p>
          </section>

          <section>
            {filteredProviders.length > 0 ? (
              <>
                <p className="text-[#2C1810] font-semibold text-sm mb-4">
                  {filteredProviders.length} Temanian ditemukan
                </p>
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
              </>
            ) : (
              <div className="w-full py-12 px-6 bg-white rounded-2xl border border-dashed border-[#E9D5FF] flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-[#D8B4E2]" />
                </div>
                <p className="text-[#64748B] font-medium text-sm">
                  Tidak ada Temanian ditemukan
                </p>
                <p className="text-[#94A3B8] text-xs mt-1.5 max-w-sm">
                  {searchQuery.trim()
                    ? `Tidak ada hasil untuk "${searchQuery}". Coba kata kunci lain atau ubah filter.`
                    : "Belum ada provider dengan kategori ini. Coba pilih filter lain."}
                </p>
                {(searchQuery.trim() || activeCategory !== "semua") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("semua");
                    }}
                    className="mt-4 bg-[#E91E8C] hover:bg-[#D81B60] text-white px-5 py-2 rounded-xl font-medium text-xs transition-colors"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
