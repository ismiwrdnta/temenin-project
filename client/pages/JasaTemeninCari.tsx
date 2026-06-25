import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import {
  COMPANION_FILTERS,
  getModeLabel,
  type CompanionFilter,
  type TemeninMode,
} from "@/data/temenin-companions";
import {
  categoryLabel,
  getInitials,
  searchProviders,
  type ProviderSearchResult,
} from "@/lib/bookingApi";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

function isValidMode(mode: string | undefined): mode is TemeninMode {
  return mode === "tatap-muka" || mode === "online";
}

function StatusBadge({ provider }: { provider: ProviderSearchResult }) {
  if (provider.verification_status === "verified") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold">
          Verified
        </span>
        <span className="flex items-center gap-1 text-[#16A34A] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          {provider.is_available ? "Online" : "Offline"}
        </span>
      </div>
    );
  }

  return (
    <span className="px-2.5 py-0.5 rounded-full bg-[#F5EBE0] text-[#92400E] text-xs font-semibold">
      Menunggu Verifikasi
    </span>
  );
}

function ProviderCard({
  provider,
  onSelect,
}: {
  provider: ProviderSearchResult;
  onSelect: () => void;
}) {
  const bookable = provider.verification_status === "verified";
  const tags =
    provider.categories?.map((c) => categoryLabel(c)) ??
    (provider.area_description ? [provider.area_description] : []);

  return (
    <div className="bg-white rounded-2xl border border-[#FBCFE8]/60 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div className="w-14 h-14 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-base flex-shrink-0">
        {getInitials(provider.full_name ?? "?")}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[#4C1D95] font-bold text-lg mb-2">
          {provider.full_name}
        </h3>
        <div className="mb-2">
          <StatusBadge provider={provider} />
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-[#FDF4FF] text-[#E91E8C] text-xs font-medium border border-[#FBCFE8]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[#64748B] text-sm">
          <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
          <span className="font-semibold text-[#2C1810]">
            {Number(provider.avg_rating).toFixed(2)}
          </span>
          <span>({provider.total_reviews})</span>
        </div>
      </div>

      <div className="sm:ml-auto flex-shrink-0 w-full sm:w-auto">
        <button
          type="button"
          disabled={!bookable}
          onClick={onSelect}
          className={cn(
            "w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors",
            bookable
              ? "bg-gradient-to-r from-[#E91E8C] to-[#7C3AED] text-white hover:opacity-90 shadow-sm"
              : "bg-[#F5F5F5] text-[#94A3B8] cursor-not-allowed",
          )}
        >
          {bookable ? "Pilih Temanian" : "Belum Terverifikasi"}
        </button>
      </div>
    </div>
  );
}

export default function JasaTemeninCari() {
  usePageTitle("Cari Teman | TEMENIN");
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState<CompanionFilter>("Semua");
  const [providers, setProviders] = useState<ProviderSearchResult[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const data = await searchProviders({ category: "temenin", limit: 50 });
        if (!cancelled) setProviders(data);
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : "Gagal memuat Temanian.",
          );
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "Semua") return providers;
    return providers.filter((p) =>
      p.categories?.some(
        (c) => categoryLabel(c).toLowerCase().includes(activeFilter.toLowerCase()),
      ),
    );
  }, [providers, activeFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/masuk" replace />;
  }

  if (user.role === "penyedia") {
    return <Navigate to="/dashboard-penyedia" replace />;
  }

  if (!isValidMode(mode)) {
    return <Navigate to="/jasa-temenin/pilih" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-6">
            <Link
              to="/jasa-temenin/pilih"
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Jasa Temenin
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Temanian aktivitas terverifikasi di sekitarmu
                <span className="hidden sm:inline"> · {getModeLabel(mode)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
            {COMPANION_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  activeFilter === filter
                    ? "border-[#2C1810] bg-white text-[#2C1810] font-semibold"
                    : "border-[#E5D5C5] bg-white text-[#64748B] hover:border-[#D8B4E2]",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          {fetchError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {fetchError}
            </div>
          )}

          <p className="text-[#64748B] text-sm mb-4">
            {isFetching ? "Memuat..." : `${filtered.length} Temanian tersedia`}
          </p>

          <div className="flex flex-col gap-4">
            {!isFetching && filtered.length > 0 ? (
              filtered.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onSelect={() =>
                    navigate(`/jasa-temenin/pesan/${mode}/${provider.id}`)
                  }
                />
              ))
            ) : !isFetching ? (
              <div className="py-16 text-center rounded-2xl border border-dashed border-[#E9D5FF] bg-white">
                <p className="text-[#64748B] font-medium text-sm">
                  Belum ada Temanian tersedia
                </p>
                <p className="text-[#94A3B8] text-xs mt-1">
                  Jalankan <code className="text-[#4C1D95]">npm run db:seed</code>{" "}
                  untuk menambahkan data penyedia demo.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
