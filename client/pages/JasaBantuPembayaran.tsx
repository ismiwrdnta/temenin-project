import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Lock,
  QrCode,
  Smartphone,
} from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import type { AntriHelper } from "@/data/antri-helpers";
import { getAntriHelperById } from "@/data/antri-helpers";
import { getBantuHelperById } from "@/data/bantu-helpers";
import { formatRupiah } from "@/data/orders";
import {
  PAYMENT_CATEGORIES,
  PAYMENT_METHODS,
  generateVirtualAccount,
  type PaymentCategory,
  type PaymentMethod,
} from "@/data/payment-methods";
import {
  isAmbilRaporCheckout,
  isAntriMewakiliCheckout,
  type BantuCheckout,
} from "@/lib/bantu-checkout";
import { cn } from "@/lib/utils";

function PaymentMethodButton({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-xl border-2 px-4 py-3 text-left transition-all",
        selected
          ? "border-[#0D9488] bg-[#F0FDFA] ring-2 ring-[#0D9488]/20"
          : "border-[#E5E7EB] bg-white hover:border-[#5EEAD4]",
      )}
    >
      <p
        className="font-bold text-sm"
        style={{ color: method.accent }}
      >
        {method.shortLabel}
      </p>
      <p className="text-[#64748B] text-xs mt-0.5">{method.label}</p>
    </button>
  );
}

function PaymentDetail({
  method,
  orderId,
  totalPrice,
}: {
  method: PaymentMethod;
  orderId: number;
  totalPrice: number;
}) {
  if (method.category === "va") {
    const bankCode = method.id.replace("va-", "");
    const vaNumber = generateVirtualAccount(bankCode, orderId);

    return (
      <div className="rounded-xl border border-[#5EEAD4] bg-[#F0FDFA] p-5">
        <p className="text-[#0F766E] text-sm font-semibold mb-2">
          Transfer ke Virtual Account
        </p>
        <div className="flex items-center justify-between gap-3 bg-white rounded-lg border border-[#CCFBF1] px-4 py-3 mb-3">
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Nomor VA</p>
            <p className="text-[#2C1810] font-bold text-lg tracking-wide">
              {vaNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(vaNumber)}
            className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors"
            aria-label="Salin nomor VA"
          >
            <Copy className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
        <p className="text-[#64748B] text-xs leading-relaxed">
          Transfer tepat{" "}
          <span className="font-semibold text-[#0D9488]">
            {formatRupiah(totalPrice)}
          </span>{" "}
          sebelum batas waktu. Pembayaran diverifikasi otomatis.
        </p>
      </div>
    );
  }

  if (method.category === "qris") {
    return (
      <div className="rounded-xl border border-[#5EEAD4] bg-[#F0FDFA] p-5 text-center">
        <div className="w-40 h-40 mx-auto rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-4">
          <QrCode className="w-24 h-24 text-[#0D9488]" strokeWidth={1} />
        </div>
        <p className="text-[#0F766E] font-semibold text-sm mb-1">
          Scan QRIS untuk bayar
        </p>
        <p className="text-[#64748B] text-xs">
          Buka aplikasi bank atau e-wallet, pilih Scan QR, lalu arahkan ke kode
          di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#5EEAD4] bg-[#F0FDFA] p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            method.bg,
          )}
        >
          <Smartphone
            className="w-6 h-6"
            style={{ color: method.accent }}
          />
        </div>
        <div>
          <p className="text-[#2C1810] font-bold">{method.label}</p>
          <p className="text-[#64748B] text-xs">
            Kamu akan diarahkan ke aplikasi {method.shortLabel}
          </p>
        </div>
      </div>
      <p className="text-[#64748B] text-xs leading-relaxed">
        Pastikan saldo {method.shortLabel} mencukupi untuk pembayaran{" "}
        <span className="font-semibold text-[#0D9488]">
          {formatRupiah(totalPrice)}
        </span>
        .
      </p>
    </div>
  );
}

export default function JasaBantuPembayaran() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { createAmbilRaporOrder, createAntriMewakiliOrder } = useOrders();

  const checkout = location.state as BantuCheckout | null;

  const ambilRapor =
    checkout && isAmbilRaporCheckout(checkout) ? checkout : null;
  const antriMewakili =
    checkout && isAntriMewakiliCheckout(checkout) ? checkout : null;

  const raporHelper = ambilRapor
    ? getBantuHelperById(ambilRapor.helperId)
    : undefined;
  const antriHelper = antriMewakili
    ? getAntriHelperById(antriMewakili.helperId)
    : undefined;

  const totalPrice =
    ambilRapor?.request.totalPrice ?? antriMewakili?.request.totalPrice ?? 0;

  const [activeCategory, setActiveCategory] =
    useState<PaymentCategory>("va");
  const [selectedMethodId, setSelectedMethodId] = useState("va-bca");
  const [isPaying, setIsPaying] = useState(false);

  const methodsInCategory = useMemo(
    () => PAYMENT_METHODS.filter((m) => m.category === activeCategory),
    [activeCategory],
  );

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId);
  const previewOrderId = useMemo(() => Date.now(), []);

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

  if (!checkout || (!ambilRapor && !antriMewakili) || (!raporHelper && !antriHelper)) {
    return <Navigate to="/jasa-bantu" replace />;
  }

  const backTo =
    ambilRapor != null
      ? "/jasa-bantu/ambil-rapor/helper"
      : "/jasa-bantu/antri-mewakili";
  const backState = ambilRapor?.request ?? antriMewakili?.request;

  const handleCategoryChange = (category: PaymentCategory) => {
    setActiveCategory(category);
    const first = PAYMENT_METHODS.find((m) => m.category === category);
    if (first) setSelectedMethodId(first.id);
  };

  const handlePay = () => {
    if (!selectedMethod) return;
    setIsPaying(true);

    const order = ambilRapor && raporHelper
      ? createAmbilRaporOrder({
          helper: raporHelper,
          request: ambilRapor.request,
          paymentMethod: selectedMethod.label,
          customer: { name: user.name },
        })
      : antriMewakili && antriHelper
        ? createAntriMewakiliOrder({
            helper: antriHelper,
            request: antriMewakili.request,
            paymentMethod: selectedMethod.label,
            customer: { name: user.name },
          })
        : null;

    if (!order) return;

    navigate(`/pesanan/${order.id}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-6">
            <Link
              to={backTo}
              state={backState}
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Pembayaran
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Selesaikan pembayaran untuk memulai pesanan
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 mb-6 shadow-sm">
            {ambilRapor && raporHelper && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white",
                      raporHelper.avatarBg,
                    )}
                  >
                    {raporHelper.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2C1810] font-bold">{raporHelper.name}</p>
                    <p className="text-[#64748B] text-sm truncate">
                      Ambil Rapor • {ambilRapor.request.schoolName}
                    </p>
                  </div>
                  <p className="text-[#0D9488] font-bold text-lg flex-shrink-0">
                    {formatRupiah(totalPrice)}
                  </p>
                </div>
                <div className="text-sm space-y-2 border-t border-dashed border-[#E5E7EB] pt-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Siswa</span>
                    <span className="text-[#2C1810] font-medium text-right">
                      {ambilRapor.request.studentInfo}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Pengiriman</span>
                    <span className="text-[#2C1810] font-medium">
                      {ambilRapor.request.deliveryMethod === "antar"
                        ? "Antar ke rumah"
                        : "Foto via chat"}
                    </span>
                  </div>
                </div>
              </>
            )}
            {antriMewakili && antriHelper && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white",
                      antriHelper.avatarBg,
                    )}
                  >
                    {antriHelper.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2C1810] font-bold">{antriHelper.name}</p>
                    <p className="text-[#64748B] text-sm truncate">
                      Antri Mewakili • {antriMewakili.request.location}
                    </p>
                  </div>
                  <p className="text-[#E91E8C] font-bold text-lg flex-shrink-0">
                    {formatRupiah(totalPrice)}
                  </p>
                </div>
                <div className="text-sm space-y-2 border-t border-dashed border-[#E5E7EB] pt-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Keperluan</span>
                    <span className="text-[#2C1810] font-medium text-right">
                      {antriMewakili.request.purpose}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Durasi</span>
                    <span className="text-[#2C1810] font-medium">
                      {antriMewakili.request.durationHours} jam
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 mb-6 shadow-sm">
            <h2 className="text-[#2C1810] font-bold text-base mb-4">
              Pilih Metode Pembayaran
            </h2>

            <div className="flex flex-wrap gap-2 mb-5">
              {PAYMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                    activeCategory === cat.id
                      ? "border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]"
                      : "border-[#E5E7EB] bg-white text-[#64748B] hover:border-[#5EEAD4]",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div
              className={cn(
                "grid gap-3 mb-5",
                activeCategory === "qris"
                  ? "grid-cols-1"
                  : "grid-cols-2 sm:grid-cols-3",
              )}
            >
              {methodsInCategory.map((method) => (
                <PaymentMethodButton
                  key={method.id}
                  method={method}
                  selected={selectedMethodId === method.id}
                  onSelect={() => setSelectedMethodId(method.id)}
                />
              ))}
            </div>

            {selectedMethod && (
              <PaymentDetail
                method={selectedMethod}
                orderId={previewOrderId}
                totalPrice={totalPrice}
              />
            )}
          </div>

          <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 mb-6 flex gap-3">
            <Lock className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
            <p className="text-[#1E40AF] text-xs sm:text-sm leading-relaxed">
              Dana ditahan aman di platform TEMENIN hingga aktivitas selesai
              dikonfirmasi.
            </p>
          </div>

          <button
            type="button"
            disabled={isPaying || !selectedMethod}
            onClick={handlePay}
            className="w-full py-4 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-[#0D9488] to-[#0891B2] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {isPaying
              ? "Memproses pembayaran..."
              : `Bayar ${formatRupiah(totalPrice)}`}
          </button>
        </div>
      </main>
    </div>
  );
}
