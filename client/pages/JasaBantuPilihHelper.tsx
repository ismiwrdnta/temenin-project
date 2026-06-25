import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { AMBIL_RAPOR_HELPERS, type BantuHelper } from "@/data/bantu-helpers";
import {
  formatAmbilRaporSchedule,
  type AmbilRaporRequest,
} from "@/lib/ambil-rapor-request";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

function HelperCard({
  helper,
  onSelect,
}: {
  helper: BantuHelper;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-2xl border-2 border-[#5EEAD4] bg-white p-5 sm:p-6 text-left shadow-sm hover:shadow-md hover:border-[#0D9488] transition-all"
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0",
            helper.avatarBg,
            helper.avatarText,
          )}
        >
          {helper.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="text-[#2C1810] font-bold text-lg mb-2">
                {helper.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold">
                  Verified
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0D9488] text-xs font-semibold">
                  {helper.experienceLabel}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[#0D9488] font-bold text-lg">{helper.price}</p>
              <p className="text-[#64748B] text-xs flex items-center justify-end gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {helper.distanceKm} km
              </p>
            </div>
          </div>

          <p className="text-[#64748B] text-sm leading-relaxed mb-3">
            {helper.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="text-[#2C1810]">
              <span className="font-bold">{helper.rating.toFixed(2)}</span>
              <span className="text-[#64748B]"> ({helper.reviews} Ulasan)</span>
            </p>
            {helper.ready && (
              <p className="text-[#16A34A] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                Siap sekarang
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function JasaBantuPilihHelper() {
  usePageTitle("Pilih Helper | TEMENIN");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const request = location.state as AmbilRaporRequest | null;

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

  if (!request?.schoolName) {
    return <Navigate to="/jasa-bantu/ambil-rapor" replace />;
  }

  const schoolLabel = request.schoolName.trim();

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-5">
            <Link
              to="/jasa-bantu/ambil-rapor"
              state={request}
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Pilih Helper
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Ambil Rapor • {schoolLabel}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#FDBA74] bg-[#FFF7ED] px-4 py-3 sm:px-5 sm:py-4 mb-6 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#EA580C] flex-shrink-0 mt-0.5" />
            <p className="text-[#C2410C] text-sm sm:text-base font-medium leading-relaxed">
              {formatAmbilRaporSchedule(request)}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {AMBIL_RAPOR_HELPERS.map((helper) => (
              <HelperCard
                key={helper.id}
                helper={helper}
                onSelect={() =>
                  navigate("/jasa-bantu/ambil-rapor/pembayaran", {
                    state: {
                      service: "ambil-rapor",
                      request,
                      helperId: helper.id,
                    },
                  })
                }
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
