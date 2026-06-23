import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw, Star } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import {
  STATUS_CONFIG,
  formatRupiah,
  type Order,
} from "@/data/orders";
import {
  completeBooking,
  isUuid,
  listBookings,
  mapBookingToOrder,
} from "@/lib/bookingApi";
import { cn } from "@/lib/utils";

type FilterTab = "semua" | "aktif" | "selesai" | "dibatalkan";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "aktif", label: "Aktif" },
  { key: "selesai", label: "Selesai" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

function OrderActions({
  order,
  onConfirmComplete,
}: {
  order: Order;
  onConfirmComplete: (id: string | number) => Promise<void>;
}) {
  const navigate = useNavigate();

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onConfirmComplete(order.id);
    navigate(`/pesanan/${order.id}/ulasan`);
  };

  if (order.status === "pending") {
    return (
      <div className="mt-4 space-y-2">
        <div className="w-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] py-2 rounded-xl font-medium text-xs text-center">
          ✓ Pembayaran berhasil — menunggu provider accept
        </div>
        <Link
          to={`/pesanan/${order.id}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-full bg-white border border-[#FACC15] text-[#CA8A04] hover:bg-[#FEFCE8] py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          Lihat Status Pesanan
        </Link>
      </div>
    );
  }

  if (order.status === "berlangsung") {
    return (
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Link
          to={`/pesanan/${order.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-gradient-to-r from-[#E91E8C] to-[#7C3AED] hover:from-[#D81B60] hover:to-[#6D28D9] text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm text-center"
        >
          Chat Provider
        </Link>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 bg-white border-2 border-[#22C55E] text-[#16A34A] hover:bg-[#F0FDF4] py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          Konfirmasi Selesai
        </button>
      </div>
    );
  }

  if (order.status === "selesai") {
    if (order.reviewStatus === "sent") {
      return (
        <div className="mt-4 w-full py-2.5 rounded-xl border border-[#E9D5FF] bg-[#FAFAFA] text-center text-[#94A3B8] text-sm font-medium">
          Ulasan Dikirim
        </div>
      );
    }

    return (
      <Link
        to={`/pesanan/${order.id}/ulasan`}
        onClick={(e) => e.stopPropagation()}
        className="mt-4 w-full bg-white border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FDF4FF] py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Star className="w-4 h-4 fill-[#E91E8C]" />
        Beri Ulasan
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      className="mt-4 w-full bg-white border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FDF4FF] py-2.5 rounded-xl font-medium text-sm transition-colors"
    >
      Rincian Pembatalan
    </button>
  );
}

function OrderCard({
  order,
  onConfirmComplete,
}: {
  order: Order;
  onConfirmComplete: (id: string | number) => Promise<void>;
}) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[order.status];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/pesanan/${order.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/pesanan/${order.id}`);
        }
      }}
      className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 cursor-pointer hover:border-[#FBCFE8] hover:shadow-md transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm flex-shrink-0">
            {order.initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-[#4C1D95] font-bold text-base">
              {order.providerName}
            </h3>
            <p className="text-[#94A3B8] text-sm mt-0.5">
              {order.service} • {order.duration}
            </p>
            <p className="text-[#64748B] text-sm mt-1">{order.datetime}</p>
          </div>
        </div>

        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
          <span
            className={cn(
              "text-xs font-semibold px-3 py-1 rounded-full",
              status.className,
            )}
          >
            {status.label}
          </span>
          <p className="text-[#2C1810] font-bold text-base">
            {formatRupiah(order.price)}
          </p>
        </div>
      </div>

      <OrderActions order={order} onConfirmComplete={onConfirmComplete} />
    </div>
  );
}

function EmptyState({
  hasOrders,
  activeFilter,
}: {
  hasOrders: boolean;
  activeFilter: FilterTab;
}) {
  const isFiltered = activeFilter !== "semua";

  return (
    <div className="w-full py-16 lg:py-20 px-6 bg-white rounded-2xl border border-dashed border-[#E9D5FF] flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-16 h-16 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D8B4E2"
          strokeWidth="1.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {!hasOrders ? (
        <>
          <p className="text-[#2C1810] font-semibold text-base mb-1.5">
            Belum ada pesanan
          </p>
          <p className="text-[#94A3B8] text-sm max-w-sm leading-relaxed">
            Kamu belum memesan layanan Temenin. Cari Temanian dan pesan jasa
            untuk melihat riwayat pesanan di sini.
          </p>
          <Link
            to="/jasa-temenin"
            className="mt-5 bg-[#E91E8C] hover:bg-[#D81B60] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            Cari Temanian
          </Link>
        </>
      ) : (
        <>
          <p className="text-[#2C1810] font-semibold text-base mb-1.5">
            Tidak ada pesanan{" "}
            {activeFilter === "aktif"
              ? "aktif"
              : activeFilter === "selesai"
                ? "selesai"
                : "dibatalkan"}
          </p>
          <p className="text-[#94A3B8] text-sm max-w-sm">
            {isFiltered
              ? "Coba pilih filter lain untuk melihat pesanan kamu."
              : "Belum ada pesanan dengan status ini."}
          </p>
        </>
      )}
    </div>
  );
}

export default function Pesanan() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("semua");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);
    try {
      const data = await listBookings();
      setOrders(data.map(mapBookingToOrder));
    } catch (err) {
      if (!quiet) {
        setFetchError(
          err instanceof Error ? err.message : "Gagal memuat pesanan.",
        );
      }
    } finally {
      if (!quiet) setLoading(false);
      else setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Poll every 10 seconds to pick up provider accept/reject
    pollingRef.current = setInterval(() => fetchOrders(true), 10_000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchOrders]);

  async function handleConfirmComplete(id: string | number) {
    if (typeof id === "string" && isUuid(id)) {
      await completeBooking(id);
      await fetchOrders();
    }
  }

  const filteredOrders = useMemo(() => {
    if (activeFilter === "semua") return orders;
    if (activeFilter === "aktif") {
      return orders.filter(
        (o) => o.status === "berlangsung" || o.status === "pending",
      );
    }
    if (activeFilter === "selesai") {
      return orders.filter((o) => o.status === "selesai");
    }
    return orders.filter((o) => o.status === "dibatalkan");
  }, [orders, activeFilter]);

  const hasAnyOrders = orders.length > 0;

  return (
    <div className="min-h-screen w-full bg-[#FFF8F5] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#F3E8FF] rounded-full blur-3xl opacity-50" />
      </div>

      <AppNavbar activePage="pesanan" />

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          <section className="mb-6 lg:mb-8">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveFilter(tab.key)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                      activeFilter === tab.key
                        ? "bg-[#E91E8C] text-white shadow-sm"
                        : "bg-[#FDF4FF] text-[#94A3B8] border border-[#FBCFE8] hover:bg-[#FCE7F3] hover:text-[#7C3AED]",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => fetchOrders(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#7C3AED] transition-colors"
                aria-label="Refresh pesanan"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Memuat..." : "Perbarui"}
              </button>
            </div>
          </section>

          <section>
            {fetchError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
                {fetchError}
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center text-[#94A3B8]">Memuat pesanan...</div>
            ) : filteredOrders.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onConfirmComplete={handleConfirmComplete}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                hasOrders={hasAnyOrders}
                activeFilter={activeFilter}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
