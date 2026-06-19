import { useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import {
  TEMENIN_COMPANIONS,
  getModeLabel,
  type TemeninMode,
} from "@/data/temenin-companions";
import { formatRupiah } from "@/data/orders";
import {
  canBookCompanion,
  getHourlyRate,
} from "@/lib/order-factory";
import { cn } from "@/lib/utils";

function isValidMode(mode: string | undefined): mode is TemeninMode {
  return mode === "tatap-muka" || mode === "online";
}

export default function JasaTemeninPesan() {
  const { mode, companionId } = useParams<{
    mode: string;
    companionId: string;
  }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { createOrder } = useOrders();
  const [durationHours, setDurationHours] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companion = TEMENIN_COMPANIONS.find(
    (c) => c.id === Number(companionId),
  );

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

  if (!isValidMode(mode) || !companion || !companion.modes.includes(mode)) {
    return <Navigate to="/jasa-temenin/pilih" replace />;
  }

  if (!canBookCompanion(companion)) {
    return <Navigate to={`/jasa-temenin/cari/${mode}`} replace />;
  }

  const hourlyRate = getHourlyRate(mode);
  const totalPrice = hourlyRate * durationHours;

  const handleConfirm = () => {
    setIsSubmitting(true);
    const order = createOrder({
      companion,
      mode,
      durationHours,
      customer: { name: user.name },
    });
    navigate(`/pesanan/${order.id}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[600px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-8">
            <Link
              to={`/jasa-temenin/cari/${mode}`}
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Konfirmasi Pesanan
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                {getModeLabel(mode)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#FBCFE8]/60 p-5 sm:p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-base">
                {companion.initials}
              </div>
              <div>
                <h2 className="text-[#4C1D95] font-bold text-lg">
                  {companion.name}
                </h2>
                <div className="flex items-center gap-1.5 text-sm text-[#64748B] mt-1">
                  <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                  <span className="font-semibold text-[#2C1810]">
                    {companion.rating.toFixed(2)}
                  </span>
                  <span>({companion.reviews})</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {companion.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#FDF4FF] text-[#E91E8C] text-xs font-medium border border-[#FBCFE8]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm mb-6 space-y-4">
            <div>
              <p className="text-[#2C1810] font-semibold text-sm mb-3">
                Durasi Sesi
              </p>
              <div className="flex gap-3">
                {[1, 2, 3].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setDurationHours(hours)}
                    className={cn(
                      "flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors",
                      durationHours === hours
                        ? "border-[#E91E8C] bg-[#FFF0F8] text-[#E91E8C]"
                        : "border-[#E5D5C5] bg-white text-[#64748B] hover:border-[#FBCFE8]",
                    )}
                  >
                    {hours} Jam
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-dashed border-[#E9D5FF] pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Layanan</span>
                <span className="text-[#2C1810] font-medium">
                  Jasa Temenin · {getModeLabel(mode)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Tarif</span>
                <span className="text-[#2C1810] font-medium">
                  {formatRupiah(hourlyRate)}/jam
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Metode bayar</span>
                <span className="text-[#2C1810] font-medium">GoPay</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#F3E8FF]">
                <span className="text-[#2C1810] font-bold">Total</span>
                <span className="text-[#E91E8C] font-bold text-lg">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[#64748B] text-xs text-center mb-4 leading-relaxed">
            Dana ditahan aman di platform hingga sesi selesai dikonfirmasi.
          </p>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="w-full py-4 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? "Memproses..." : "Bayar & Mulai Chat →"}
          </button>
        </div>
      </main>
    </div>
  );
}
