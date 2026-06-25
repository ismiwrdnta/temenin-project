import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/data/orders";
import {
  activityRequestTypeLabel,
  getActivityRequest,
  type ActivityRequestRecord,
} from "@/lib/activityRequestApi";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

function requestSummary(request: ActivityRequestRecord): string {
  const payload = request.payload ?? {};
  switch (request.request_type) {
    case "belanja_titip":
      return String(payload.storeName ?? "Belanja titip");
    case "antri_mewakili":
      return String(payload.location ?? payload.purpose ?? "Antri mewakili");
    case "ambil_rapor":
      return String(payload.schoolName ?? "Ambil rapor");
    default:
      return activityRequestTypeLabel(request.request_type);
  }
}

export default function JasaBantuPermintaanMenunggu() {
  usePageTitle("Permintaan Menunggu | TEMENIN");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [request, setRequest] = useState<ActivityRequestRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await getActivityRequest(id!);
        if (cancelled) return;
        setRequest(data);
        if (data.status === "claimed" && data.booking_id) {
          navigate(`/pesanan/${data.booking_id}`, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat permintaan.",
          );
        }
      }
    }

    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;
  if (user.role === "penyedia") return <Navigate to="/dashboard-penyedia" replace />;
  if (!id) return <Navigate to="/jasa-bantu" replace />;

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="pesanan" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[640px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-8">
            <Link
              to="/pesanan"
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Menunggu Helper
              </h1>
              <p className="text-[#94A3B8] text-sm">
                Permintaanmu dikirim ke semua helper terdekat
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {error}
            </div>
          )}

          {request ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F0FDF4] flex items-center justify-center">
                  {request.status === "claimed" ? (
                    <CheckCircle2 className="w-7 h-7 text-[#16A34A]" />
                  ) : (
                    <Loader2 className="w-7 h-7 text-[#0D9488] animate-spin" />
                  )}
                </div>
                <div>
                  <p className="text-[#2C1810] font-bold text-lg">
                    {activityRequestTypeLabel(request.request_type)}
                  </p>
                  <p className="text-[#64748B] text-sm">{requestSummary(request)}</p>
                </div>
              </div>

              {request.address && (
                <div className="flex items-start gap-2 text-sm text-[#64748B]">
                  <MapPin className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                  {request.address}
                </div>
              )}

              <div className="flex justify-between text-sm border-t border-dashed border-gray-100 pt-4">
                <span className="text-[#94A3B8]">Total dibayar</span>
                <span className="text-[#2C1810] font-bold">
                  {formatRupiah(parseFloat(request.total_price))}
                </span>
              </div>

              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium",
                  request.status === "open"
                    ? "bg-[#FEFCE8] text-[#CA8A04] border border-[#FACC15]"
                    : "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]",
                )}
              >
                {request.status === "open"
                  ? "Helper sedang melihat permintaanmu. Halaman ini otomatis update saat ada yang menerima."
                  : "Helper sudah menerima permintaanmu!"}
              </div>
            </div>
          ) : (
            !error && (
              <div className="py-16 text-center text-[#94A3B8] text-sm">
                Memuat permintaan...
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
