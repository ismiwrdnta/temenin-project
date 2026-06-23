import { useEffect, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import {
  categoryLabel,
  getInitials,
  searchProviders,
  type ProviderSearchResult,
} from "@/lib/bookingApi";
import { cn } from "@/lib/utils";

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
    <div className="bg-white rounded-2xl border border-[#E9D5FF] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-bold text-base flex-shrink-0">
        {getInitials(provider.full_name ?? "?")}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[#4C1D95] font-bold text-lg mb-1">
          {provider.full_name}
        </h3>
        <p className="text-[#64748B] text-sm mb-2">
          Mode Reguler — identitas kamu terlihat oleh pendengar
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-[#FDF4FF] text-[#7C3AED] text-xs font-medium border border-[#E9D5FF]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
          <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
          <span className="font-semibold text-[#2C1810]">
            {Number(provider.avg_rating).toFixed(2)}
          </span>
          <span>({provider.total_reviews})</span>
        </div>
      </div>

      <button
        type="button"
        disabled={!bookable}
        onClick={onSelect}
        className={cn(
          "w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors",
          bookable
            ? "bg-gradient-to-r from-[#7C3AED] to-[#E91E8C] text-white hover:opacity-90"
            : "bg-[#F5F5F5] text-[#94A3B8] cursor-not-allowed",
        )}
      >
        {bookable ? "Pilih Pendengar" : "Belum Terverifikasi"}
      </button>
    </div>
  );
}

export default function JasaCurhatReguler() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [providers, setProviders] = useState<ProviderSearchResult[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await searchProviders({ category: "curhat", limit: 50 });
        if (!cancelled) setProviders(data);
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : "Gagal memuat pendengar.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-6">
            <Link
              to="/jasa-curhat/pilih"
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Curhat Reguler
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Pilih pendengar terverifikasi — identitasmu terlihat
              </p>
            </div>
          </div>

          {fetchError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {fetchError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {!loading && providers.length > 0 ? (
              providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onSelect={() =>
                    navigate(`/jasa-curhat/pesan/reguler/${provider.id}`)
                  }
                />
              ))
            ) : !loading ? (
              <div className="py-16 text-center rounded-2xl border border-dashed border-[#E9D5FF] bg-white text-sm text-[#64748B]">
                Belum ada pendengar curhat tersedia.
              </div>
            ) : (
              <div className="py-16 text-center text-[#94A3B8] text-sm">
                Memuat pendengar...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
