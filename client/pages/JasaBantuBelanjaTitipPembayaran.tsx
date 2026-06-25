import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Package,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/data/orders";
import {
  createActivityRequest,
  payActivityRequest,
} from "@/lib/activityRequestApi";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

// ─── Types ─────────────────────────────────────────────────────────────────
interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  estimatePrice: string;
}

interface BelanjaTitipState {
  service: "belanja-titip";
  storeName: string;
  storeAddress: string;
  deliveryAddress: string;
  items: ShoppingItem[];
  notes: string;
  totalPrice: number;
  totalEstimate: number;
  pickedLocation?: { lat: number; lng: number } | null;
}

// ─── QR Code SVG ───────────────────────────────────────────────────────────
function QrisCode({ seed, size = 200 }: { seed: number; size?: number }) {
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
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg"
    >
      <rect width={size} height={size} fill="white" />
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1a1a2e"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

// ─── Payment Modal ──────────────────────────────────────────────────────────
type Step = "qr" | "processing" | "success";

function PaymentModal({
  totalPrice,
  storeName,
  qrSeed,
  onClose,
  onConfirm,
}: {
  totalPrice: number;
  storeName: string;
  qrSeed: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [step, setStep] = useState<Step>("qr");
  const [countdown, setCountdown] = useState(900);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current!);
    };
  }, []);

  const minutes = String(Math.floor(countdown / 60)).padStart(2, "0");
  const seconds = String(countdown % 60).padStart(2, "0");

  async function handlePay() {
    if (timerRef.current) clearInterval(timerRef.current!);
    setStep("processing");
    await onConfirm();
    setStep("success");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === "qr" ? onClose : undefined}
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#16A34A] to-[#0D9488] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">
              {step === "success" ? "Pembayaran Berhasil" : "Pembayaran QRIS"}
            </span>
          </div>
          {step === "qr" && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {step === "qr" && (
          <div className="p-6 flex flex-col items-center">
            <p className="text-[#64748B] text-xs mb-1">Bayar ke</p>
            <p className="text-[#2C1810] font-bold text-base mb-4">
              Temenin · Jasa Belanja
            </p>
            <p className="text-[#64748B] text-xs mb-3 truncate max-w-full">
              Belanja di: {storeName}
            </p>

            <div className="relative bg-white border-2 border-[#16A34A]/30 rounded-2xl p-4 shadow-md mb-3">
              <QrisCode seed={qrSeed} size={200} />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                QRIS
              </div>
            </div>

            <p className="text-[#2C1810] font-bold text-2xl mb-1">
              {formatRupiah(totalPrice)}
            </p>
            <p className="text-[#64748B] text-xs mb-2">(Harga jasa saja)</p>

            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium mb-4",
                countdown < 60 ? "text-[#DC2626]" : "text-[#64748B]",
              )}
            >
              <span>Berlaku selama</span>
              <span className="font-bold font-mono">
                {minutes}:{seconds}
              </span>
            </div>

            <p className="text-[#94A3B8] text-xs text-center mb-5 leading-relaxed">
              Scan QR dengan m-banking atau e-wallet kamu.
              <br />
              Atau klik tombol di bawah untuk simulasi pembayaran.
            </p>

            <button
              type="button"
              onClick={handlePay}
              className="w-full py-4 rounded-xl text-white font-bold text-base bg-gradient-to-r from-[#16A34A] to-[#0D9488] hover:opacity-90 shadow-md"
            >
              ✓ Konfirmasi Pembayaran
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className="p-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#16A34A]/20 border-t-[#16A34A] animate-spin mb-6" />
            <p className="text-[#2C1810] font-bold text-base mb-1">
              Memverifikasi Pembayaran...
            </p>
            <p className="text-[#94A3B8] text-sm text-center">
              Dana jasa sedang diproses dan ditahan aman di platform
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
            </div>
            <p className="text-[#2C1810] font-bold text-xl mb-2">
              Pembayaran Berhasil!
            </p>
            <p className="text-[#64748B] text-sm mb-1">
              {formatRupiah(totalPrice)} telah diterima
            </p>
            <p className="text-[#94A3B8] text-xs mb-6 leading-relaxed">
              Pesanan belanja kamu sedang diproses.
              <br />
              Helper akan segera dihubungkan.
            </p>
            <div className="w-full bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-[#16A34A] text-sm font-medium">
              ✓ Mengarahkan ke halaman pesanan...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function JasaBantuBelanjaTitipPembayaran() {
  usePageTitle("Pembayaran Belanja | TEMENIN");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const state = location.state as BelanjaTitipState | null;
  const qrSeed = useRef(Date.now()).current;

  const [showModal, setShowModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;
  if (user.role === "penyedia") return <Navigate to="/dashboard-penyedia" replace />;
  if (!state?.storeName) return <Navigate to="/jasa-bantu/belanja-titip" replace />;

  async function handleConfirmPayment() {
    setSubmitError(null);
    await new Promise((r) => setTimeout(r, 800));

    const created = await createActivityRequest({
      request_type: "belanja_titip",
      latitude: state!.pickedLocation?.lat,
      longitude: state!.pickedLocation?.lng,
      address: state!.deliveryAddress,
      payload: {
        storeName: state!.storeName,
        storeAddress: state!.storeAddress,
        deliveryAddress: state!.deliveryAddress,
        items: state!.items,
        notes: state!.notes,
        totalEstimate: state!.totalEstimate,
      },
      total_price: state!.totalPrice,
    });

    await payActivityRequest(created.id);
    await new Promise((r) => setTimeout(r, 600));
    navigate(`/jasa-bantu/permintaan/${created.id}`);
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      {showModal && (
        <PaymentModal
          totalPrice={state.totalPrice}
          storeName={state.storeName}
          qrSeed={qrSeed}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmPayment}
        />
      )}

      <main className="flex-1 w-full">
        <div className="w-full max-w-[600px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-8">
            <Link
              to="/jasa-bantu/belanja-titip"
              state={state}
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Konfirmasi Pembayaran
              </h1>
              <p className="text-[#94A3B8] text-sm">Belanja / Titip Beli</p>
            </div>
          </div>

          {/* Detail Pesanan */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-[#2C1810] font-bold">{state.storeName}</p>
                <p className="text-[#64748B] text-sm">
                  {state.items.length} item · {state.deliveryAddress}
                </p>
              </div>
            </div>

            {/* Item list */}
            <div className="border-t border-dashed border-gray-100 pt-4 space-y-2">
              {state.items.map((item, i) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#64748B]">
                    {i + 1}. {item.name}
                    {item.qty && item.qty !== "1" ? ` (×${item.qty})` : ""}
                  </span>
                  {item.estimatePrice && (
                    <span className="text-[#2C1810] font-medium">
                      ~{formatRupiah(parseFloat(item.estimatePrice))}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-[#E9D5FF] pt-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Jasa belanja</span>
                <span className="text-[#2C1810] font-medium">
                  {formatRupiah(state.totalPrice)}
                </span>
              </div>
              {state.totalEstimate > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Estimasi harga barang*</span>
                  <span className="text-[#64748B]">
                    ~{formatRupiah(state.totalEstimate)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#F3E8FF]">
                <span className="text-[#2C1810] font-bold">
                  Dibayar sekarang
                </span>
                <span className="text-[#16A34A] font-bold text-lg">
                  {formatRupiah(state.totalPrice)}
                </span>
              </div>
            </div>
            {state.totalEstimate > 0 && (
              <p className="text-[#94A3B8] text-[11px] mt-2">
                * Harga barang dibayar terpisah ke helper via transfer/tunai
              </p>
            )}
          </div>

          {/* Escrow info */}
          <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 mb-4">
            <Lock className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
            <p className="text-[#16A34A] text-xs">
              Dana jasa ditahan aman di platform hingga barang diterima &
              dikonfirmasi.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFBEB] border border-[#FCD34D] rounded-xl px-4 py-3 mb-6">
            <Package className="w-4 h-4 text-[#D97706] flex-shrink-0" />
            <p className="text-[#92400E] text-xs">
              Harga barang dibayar terpisah langsung ke helper setelah konfirmasi
              via chat.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full py-4 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-[#16A34A] to-[#0D9488] hover:opacity-90 transition-opacity shadow-lg shadow-[#16A34A]/20"
          >
            Bayar {formatRupiah(state.totalPrice)} →
          </button>
        </div>
      </main>
    </div>
  );
}
