import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProviderDetail } from "@/lib/bookingApi";
import type { ProviderSearchResult } from "@shared/api";
import { usePageTitle } from "@/hooks/usePageTitle";

const SERVICE_INFO: Record<
  string,
  { label: string; desc: string; emoji: string; color: string }
> = {
  temenin: {
    label: "Jasa Temenin",
    desc: "Temani kamu ke acara, jalan-jalan, atau kegiatan tatap muka",
    emoji: "🤝",
    color: "from-[#FDF4FF] to-[#FFF0F8] border-[#FBCFE8] text-[#E91E8C]",
  },
  curhat: {
    label: "Jasa Curhat",
    desc: "Dengerin cerita dan keluh kesah kamu secara virtual",
    emoji: "💬",
    color: "from-[#EDE9FE] to-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]",
  },
  bantu_aktivitas: {
    label: "Jasa Bantu",
    desc: "Bantu belanja titip, antri, ambil rapor, dan aktivitas lainnya",
    emoji: "🛒",
    color: "from-[#FFF7ED] to-[#FEF3C7] border-[#FDE68A] text-[#D97706]",
  },
};

function getBookingPath(category: string, providerId: string): string {
  if (category === "temenin") return `/jasa-temenin/pesan/tatap-muka/${providerId}`;
  if (category === "curhat") return `/jasa-curhat/pesan/reguler/${providerId}`;
  if (category === "bantu_aktivitas") return `/jasa-bantu/pesan/${providerId}`;
  return `/jasa-temenin/pesan/tatap-muka/${providerId}`;
}

export default function PilihLayananProvider() {
  usePageTitle("Pilih Layanan | TEMENIN");
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [provider, setProvider] = useState<ProviderSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) return;
    setIsLoading(true);
    getProviderDetail(providerId)
      .then((p) => setProvider(p))
      .catch(() => setError("Provider tidak ditemukan."))
      .finally(() => setIsLoading(false));
  }, [providerId]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/masuk" replace />;
  if (error || !provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFCF9] gap-4">
        <p className="text-[#94A3B8]">{error ?? "Provider tidak ditemukan."}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[#E91E8C] font-medium text-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  const categories: string[] = provider.categories ?? [];

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "Rp ");

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-['Poppins',sans-serif]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[25%] h-[25%] bg-[#FFF0F8] rounded-full blur-3xl opacity-60" />
      </div>

      <header className="sticky top-0 z-50 bg-[#FFF0F8]/95 backdrop-blur-md border-b border-[#FBCFE8]/40 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-[#FDF4FF] transition-colors text-[#E91E8C]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-[#2C1810] text-base">Pilih Layanan</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* Provider Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {provider.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#2C1810] text-base truncate">{provider.full_name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {provider.avg_rating != null && Number(provider.avg_rating) > 0 && (
                <span className="flex items-center gap-1 text-[#D97706] text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  {Number(provider.avg_rating).toFixed(1)}
                </span>
              )}
              {provider.hourly_rate && (
                <span className="text-[#94A3B8] text-xs">
                  {formatRupiah(parseFloat(String(provider.hourly_rate)))}/jam
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-[#2C1810] font-semibold text-sm mb-4">
          Layanan apa yang ingin kamu gunakan?
        </p>

        <div className="flex flex-col gap-3">
          {categories.length === 0 && (
            <p className="text-[#94A3B8] text-sm text-center py-8">
              Provider ini belum menambahkan layanan.
            </p>
          )}
          {categories.map((cat) => {
            const info = SERVICE_INFO[cat];
            if (!info) return null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => navigate(getBookingPath(cat, providerId!))}
                className={`w-full text-left bg-gradient-to-br ${info.color} border rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow`}
              >
                <span className="text-3xl flex-shrink-0">{info.emoji}</span>
                <div>
                  <p className="font-bold text-[#2C1810] text-base">{info.label}</p>
                  <p className="text-[#64748B] text-sm mt-0.5">{info.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
