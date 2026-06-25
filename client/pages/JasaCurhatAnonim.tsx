import { useEffect, useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { CurhatAnonimAvatar } from "@/components/CurhatAnonimAvatar";
import { useAuth } from "@/context/AuthContext";
import { searchProviders, type ProviderSearchResult } from "@/lib/bookingApi";
import { anonListenerAlias } from "@/lib/provider-map";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

function ListenerCard({
  provider,
  alias,
  selected,
  onSelect,
}: {
  provider: ProviderSearchResult;
  alias: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const hourlyRate = parseFloat(provider.hourly_rate);
  const priceLabel = Number.isFinite(hourlyRate)
    ? `${Math.round(hourlyRate / 1000)}rb/jam`
    : "-";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border-2 p-5 sm:p-6 text-left transition-all shadow-sm hover:shadow-md bg-white",
        selected
          ? "border-[#3B82F6] ring-2 ring-[#3B82F6]/20"
          : "border-[#E9D5FF]",
      )}
    >
      <div className="flex gap-4">
        <CurhatAnonimAvatar online={provider.is_available} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-[#2C1810] font-bold text-lg">{alias}</h3>
            <p className="text-[#2C1810] font-bold text-base">{priceLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold">
              Verified
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold">
              Anonim
            </span>
            {provider.is_available && (
              <span className="flex items-center gap-1 text-[#16A34A] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                Online
              </span>
            )}
          </div>

          <p className="text-[#64748B] text-sm leading-relaxed mb-3">
            {provider.bio ??
              "Pendengar terverifikasi siap mendengarkan curhatmu secara anonim."}
          </p>

          <p className="text-[#64748B] text-sm">
            <span className="font-semibold text-[#2C1810]">
              {Number(provider.avg_rating).toFixed(2)}
            </span>{" "}
            ({provider.total_reviews} Ulasan)
          </p>
        </div>
      </div>
    </button>
  );
}

export default function JasaCurhatAnonim() {
  usePageTitle("Curhat Anonim | TEMENIN");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [providers, setProviders] = useState<ProviderSearchResult[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await searchProviders({ category: "curhat", limit: 50 });
        if (!cancelled) {
          setProviders(data);
          if (data[0]) setSelectedId(data[0].id);
        }
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

  const selectedProvider = providers.find((p) => p.id === selectedId);

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
                Curhat Anonim
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Identitasmu tersembunyi · dari database provider terverifikasi
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#C4B5FD] bg-[#F5F3FF] px-5 py-4 sm:px-6 sm:py-5 mb-8 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#7C3AED]" strokeWidth={1.5} />
            </div>
            <p className="text-[#4C1D95] text-sm sm:text-base leading-relaxed">
              <span className="font-bold">Mode Anonim:</span> Nama asli
              pendengar disamarkan. Identitasmu tidak dikirim ke provider.
            </p>
          </div>

          {fetchError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {fetchError}
            </div>
          )}

          <div className="flex flex-col gap-4 mb-8">
            {!loading && providers.length > 0 ? (
              providers.map((provider) => (
                <ListenerCard
                  key={provider.id}
                  provider={provider}
                  alias={anonListenerAlias(provider.id)}
                  selected={selectedId === provider.id}
                  onSelect={() => setSelectedId(provider.id)}
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

          {selectedProvider && (
            <button
              type="button"
              onClick={() =>
                navigate(`/jasa-curhat/pesan/anonim/${selectedProvider.id}`)
              }
              className="w-full py-4 rounded-xl border-2 border-[#2C1810] bg-white text-[#2C1810] font-semibold text-base hover:bg-[#F5EBE0] transition-colors"
            >
              Pilih {anonListenerAlias(selectedProvider.id)} →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
