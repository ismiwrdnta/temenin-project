import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import ProviderListCard from "@/components/ProviderListCard";
import ProviderMap, { USER_LOCATION } from "@/components/ProviderMap";
import { PROVIDERS } from "@/data/providers";
import { cn } from "@/lib/utils";

type Category = "semua" | "temenin" | "curhat" | "bantu";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "temenin", label: "Temenin" },
  { key: "curhat", label: "Curhat" },
  { key: "bantu", label: "Bantu" },
];

export default function Pencarian() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("semua");
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const filteredProviders = useMemo(() => {
    return PROVIDERS.filter((provider) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        provider.name.toLowerCase().includes(searchQuery.trim().toLowerCase());

      const matchesCategory =
        activeCategory === "semua" ||
        provider.tags.some(
          (tag) => tag.toLowerCase() === activeCategory.toLowerCase(),
        );

      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.distanceKm - b.distanceKm);
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
                    <ProviderListCard
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
