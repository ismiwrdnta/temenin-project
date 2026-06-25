import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, Star, X } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/data/orders";
import {
  createBooking,
  getInitials,
  getProviderDetail,
  isUuid,
  simulatePayment,
} from "@/lib/bookingApi";
import { cn } from "@/lib/utils";
import type { CurhatMode } from "./JasaCurhatPilih";
import { usePageTitle } from "@/hooks/usePageTitle";

function isValidMode(mode: string | undefined): mode is CurhatMode {
  return mode === "reguler" || mode === "anonim";
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextHourStart(): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return `${String(now.getHours()).padStart(2, "0")}:00`;
}

// ─── QR Modal (reused from Temenin) ──────────────────────────────────────────
function QrisCode({ orderId, size = 200 }: { orderId: string; size?: number }) {
  const seed = orderId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cells = 25;
  const cellSize = size / cells;
  const matrix: boolean[][] = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= cells - 8;
      const inBL = r >= cells - 8 && c < 8;
      if (inTL || inTR || inBL) {
        if (r === 0 || r === 6 || c === 0 || c === 6) return true;
        if (r === cells - 8 || r === cells - 2) return r >= cells - 8 && c < 8;
        if (c === cells - 8 || c === cells - 2) return c >= cells - 8 && r < 8;
        if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
        if (r >= 2 && r <= 4 && c >= cells - 6 && c <= cells - 4) return true;
        if (r >= cells - 6 && r <= cells - 4 && c >= 2 && c <= 4) return true;
        return false;
      }
      const val = (seed * (r + 1) * (c + 1) * 31337) % 97;
      return val < 48;
    }),
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" />
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#1a1a2e" /> : null,
        ),
      )}
    </svg>
  );
}

type PaymentStep = "qr" | "processing" | "success";

function PaymentModal({
  orderId, totalPrice, providerName, onClose, onConfirm,
}: {
  orderId: string; totalPrice: number; providerName: string;
  onClose: () => void; onConfirm: () => Promise<void>;
}) {
  const [step, setStep] = useState<PaymentStep>("qr");
  const [countdown, setCountdown] = useState(900);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; }), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current!); };
  }, []);
  const minutes = String(Math.floor(countdown / 60)).padStart(2, "0");
  const seconds = String(countdown % 60).padStart(2, "0");
  async function handlePay() {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("processing");
    await onConfirm();
    setStep("success");
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step === "qr" ? onClose : undefined} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#7C3AED] to-[#E91E8C] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">{step === "success" ? "Pembayaran Berhasil" : "Pembayaran QRIS"}</span>
          </div>
          {step === "qr" && (
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><X className="w-4 h-4" /></button>
          )}
        </div>
        {step === "qr" && (
          <div className="p-6 flex flex-col items-center">
            <p className="text-[#64748B] text-xs mb-1">Bayar ke</p>
            <p className="text-[#2C1810] font-bold text-base mb-4">Temenin · {providerName}</p>
            <div className="relative bg-white border-2 border-[#7C3AED]/30 rounded-2xl p-4 shadow-md mb-3">
              <QrisCode orderId={orderId} size={200} />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">QRIS</div>
            </div>
            <p className="text-[#2C1810] font-bold text-2xl mb-1">{formatRupiah(totalPrice)}</p>
            <div className={cn("flex items-center gap-1.5 text-xs font-medium mb-4", countdown < 60 ? "text-[#DC2626]" : "text-[#64748B]")}>
              <span>Berlaku selama</span>
              <span className="font-bold font-mono">{minutes}:{seconds}</span>
            </div>
            <p className="text-[#94A3B8] text-xs text-center mb-5 leading-relaxed">Scan QR dengan m-banking atau e-wallet kamu.<br />Atau klik tombol di bawah untuk simulasi.</p>
            <button type="button" onClick={handlePay} className="w-full py-4 rounded-xl text-white font-bold text-base bg-gradient-to-r from-[#7C3AED] to-[#E91E8C] hover:opacity-90 shadow-md">
              ✓ Konfirmasi Pembayaran
            </button>
            <p className="text-[#CBD5E1] text-[10px] mt-3">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
          </div>
        )}
        {step === "processing" && (
          <div className="p-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#7C3AED]/20 border-t-[#7C3AED] animate-spin mb-6" />
            <p className="text-[#2C1810] font-bold text-base mb-1">Memverifikasi Pembayaran...</p>
            <p className="text-[#94A3B8] text-sm text-center">Dana sedang diproses dan ditahan aman di platform</p>
          </div>
        )}
        {step === "success" && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
            </div>
            <p className="text-[#2C1810] font-bold text-xl mb-2">Pembayaran Berhasil!</p>
            <p className="text-[#64748B] text-sm mb-1">{formatRupiah(totalPrice)} telah diterima</p>
            <p className="text-[#94A3B8] text-xs mb-6 leading-relaxed">Dana aman di escrow. Pesanan menunggu konfirmasi provider.</p>
            <div className="w-full bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-[#16A34A] text-sm font-medium">✓ Mengarahkan ke halaman pesanan...</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JasaCurhatPesan() {
  usePageTitle("Pesan Curhat | TEMENIN");
  const { mode, providerId } = useParams<{
    mode: string;
    providerId: string;
  }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [durationHours, setDurationHours] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [provider, setProvider] = useState<Awaited<
    ReturnType<typeof getProviderDetail>
  > | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId || !isUuid(providerId)) return;
    let cancelled = false;
    (async () => {
      setLoadingProvider(true);
      try {
        const data = await getProviderDetail(providerId);
        if (!cancelled) setProvider(data);
      } catch {
        if (!cancelled) setProvider(null);
      } finally {
        if (!cancelled) setLoadingProvider(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  if (isLoading || loadingProvider) {
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

  if (
    !isValidMode(mode) ||
    !providerId ||
    !isUuid(providerId) ||
    !provider ||
    provider.verification_status !== "verified"
  ) {
    return <Navigate to="/jasa-curhat/pilih" replace />;
  }

  const bookingMode = mode;
  const hourlyRate = parseFloat(provider.hourly_rate);
  const totalPrice = hourlyRate * durationHours;
  const displayName =
    bookingMode === "anonim"
      ? `Pendengar-${providerId.slice(0, 4).toUpperCase()}`
      : (provider.full_name ?? "Pendengar");

  async function handleOpenPayment() {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const booking = await createBooking({
        provider_id: providerId!,
        service_category: "curhat",
        session_date: todayIsoDate(),
        session_start: nextHourStart(),
        duration_hours: durationHours,
        notes: `Mode: ${bookingMode === "anonim" ? "Curhat Anonim" : "Curhat Reguler"}`,
      });
      setPendingBookingId(booking.id);
      setShowModal(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Gagal membuat pesanan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmPayment() {
    if (!pendingBookingId) return;
    await simulatePayment(pendingBookingId);
    await new Promise((r) => setTimeout(r, 1800));
    navigate(`/pesanan/${pendingBookingId}`);
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      {showModal && pendingBookingId && (
        <PaymentModal
          orderId={pendingBookingId}
          totalPrice={totalPrice}
          providerName={displayName}
          onClose={() => { setShowModal(false); setPendingBookingId(null); }}
          onConfirm={handleConfirmPayment}
        />
      )}

      <main className="flex-1 w-full">
        <div className="w-full max-w-[600px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-8">
            <Link
              to={
                bookingMode === "anonim"
                  ? "/jasa-curhat/anonim"
                  : "/jasa-curhat/reguler"
              }
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Konfirmasi Curhat
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Mode {bookingMode === "anonim" ? "Anonim" : "Reguler"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E9D5FF] p-5 sm:p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-bold text-base">
                {bookingMode === "anonim" ? "?" : getInitials(displayName)}
              </div>
              <div>
                <h2 className="text-[#4C1D95] font-bold text-lg">
                  {displayName}
                </h2>
                <div className="flex items-center gap-1.5 text-sm text-[#64748B] mt-1">
                  <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                  <span className="font-semibold text-[#2C1810]">
                    {Number(provider.avg_rating).toFixed(2)}
                  </span>
                  <span>({provider.total_reviews})</span>
                </div>
              </div>
            </div>
            {bookingMode === "anonim" && (
              <p className="text-[#64748B] text-sm">
                Identitasmu disembunyikan dari pendengar selama sesi ini.
              </p>
            )}
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
                        ? "border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]"
                        : "border-[#E5D5C5] bg-white text-[#64748B] hover:border-[#E9D5FF]",
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
                  Jasa Curhat ·{" "}
                  {bookingMode === "anonim" ? "Anonim" : "Reguler"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Tarif</span>
                <span className="text-[#2C1810] font-medium">
                  {formatRupiah(hourlyRate)}/jam
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#F3E8FF]">
                <span className="text-[#2C1810] font-bold">Total</span>
                <span className="text-[#7C3AED] font-bold text-lg">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {serverError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {serverError}
            </div>
          )}

          <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 mb-4">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
            <p className="text-[#16A34A] text-xs">
              Dana ditahan aman di platform hingga sesi selesai dikonfirmasi.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleOpenPayment}
            className="w-full py-4 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-[#7C3AED] to-[#E91E8C] hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-[#7C3AED]/20"
          >
            {isSubmitting ? "Memproses..." : `Bayar ${formatRupiah(totalPrice)} →`}
          </button>
        </div>
      </main>
    </div>
  );
}
