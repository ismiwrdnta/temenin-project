import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageSquare,
  PackageSearch,
  RefreshCw,
  Star,
  UserSearch,
  XCircle,
} from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { STATUS_CONFIG, formatRupiah, type Order } from "@/data/orders";
import {
  completeBooking,
  isUuid,
  listBookings,
  mapBookingToOrder,
} from "@/lib/bookingApi";
import { useOrders } from "@/context/OrderContext";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────

function getSearchRoute(serviceCategory?: string): string {
  switch (serviceCategory) {
    case "temenin":          return "/jasa-temenin/pilih";
    case "curhat":           return "/jasa-curhat/pilih";
    case "bantu_aktivitas":  return "/jasa-bantu";
    default:                 return "/pencarian";
  }
}
type FilterTab = "semua" | "aktif" | "selesai" | "dibatalkan";

const FILTER_TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
  { key: "semua",      label: "Semua",      icon: <PackageSearch className="w-3.5 h-3.5" /> },
  { key: "aktif",      label: "Aktif",      icon: <Clock className="w-3.5 h-3.5" /> },
  { key: "selesai",    label: "Selesai",    icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { key: "dibatalkan", label: "Dibatalkan", icon: <XCircle className="w-3.5 h-3.5" /> },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  gradient,
}: {
  label: string;
  value: string | number;
  sub?: string;
  gradient?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-sm border",
        gradient
          ? "bg-gradient-to-br from-[#E91E8C] to-[#A131CC] text-white border-transparent"
          : "bg-white border-gray-100",
      )}
    >
      <p className={cn("text-xs font-semibold mb-1", gradient ? "text-white/70" : "text-[#94A3B8]")}>
        {label}
      </p>
      <p className={cn("text-3xl font-bold", gradient ? "text-white" : "text-[#2C1810]")}>
        {value}
      </p>
      {sub && (
        <p className={cn("text-xs mt-1", gradient ? "text-white/70" : "text-[#94A3B8]")}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  order,
  onConfirmComplete,
}: {
  order: Order;
  onConfirmComplete: (id: string | number) => Promise<void>;
}) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[order.status];

  const statusIcon = {
    pending:     <Clock className="w-3.5 h-3.5" />,
    berlangsung: <MessageSquare className="w-3.5 h-3.5" />,
    selesai:     <CheckCircle2 className="w-3.5 h-3.5" />,
    dibatalkan:  <XCircle className="w-3.5 h-3.5" />,
  }[order.status];

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onConfirmComplete(order.id);
    navigate(`/pesanan/${order.id}/ulasan`);
  };

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
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#FBCFE8] hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      {/* Status bar */}
      <div
        className={cn(
          "h-1 w-full",
          order.status === "pending"     && "bg-[#FACC15]",
          order.status === "berlangsung" && "bg-gradient-to-r from-[#E91E8C] to-[#7C3AED]",
          order.status === "selesai"     && "bg-[#22C55E]",
          order.status === "dibatalkan"  && "bg-[#EF4444]",
        )}
      />

      <div className="p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Provider info */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
              {order.initials}
            </div>
            <div className="min-w-0">
              <h3 className="text-[#2C1810] font-bold text-base group-hover:text-[#E91E8C] transition-colors">
                {order.providerName}
              </h3>
              <p className="text-[#94A3B8] text-sm mt-0.5">{order.service}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-[#64748B] text-xs">
                  <CalendarDays className="w-3 h-3" />
                  {order.datetime}
                </span>
                <span className="text-[#94A3B8] text-xs">·</span>
                <span className="text-[#64748B] text-xs">{order.duration}</span>
                {order.paymentMethod && (
                  <>
                    <span className="text-[#94A3B8] text-xs">·</span>
                    <span className="text-[#64748B] text-xs">{order.paymentMethod}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status + Price */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full",
                status.className,
              )}
            >
              {statusIcon}
              {status.label}
            </span>
            <p className="text-[#2C1810] font-bold text-lg">{formatRupiah(order.price)}</p>
          </div>
        </div>

        {/* Actions */}
        {order.status === "pending" && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FEFCE8] border border-[#FACC15] rounded-xl">
              <Clock className="w-3.5 h-3.5 text-[#CA8A04] flex-shrink-0" />
              <p className="text-[#CA8A04] text-xs font-medium">
                Pembayaran berhasil — menunggu konfirmasi provider
              </p>
            </div>
            <Link
              to={`/pesanan/${order.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block w-full text-center py-2.5 rounded-xl border border-[#E9D5FF] text-[#7C3AED] text-sm font-medium hover:bg-[#FDF4FF] transition-colors"
            >
              Lihat Detail Pesanan →
            </Link>
          </div>
        )}

        {order.status === "berlangsung" && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Link
              to={`/pesanan/${order.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-[#E91E8C] to-[#7C3AED] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              Chat Provider
            </Link>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl border-2 border-[#22C55E] text-[#16A34A] text-sm font-medium hover:bg-[#F0FDF4] transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Konfirmasi Selesai
            </button>
          </div>
        )}

        {order.status === "selesai" && (
          <div className="mt-4">
            {order.reviewStatus === "sent" ? (
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                  <span className="text-[#16A34A] text-sm font-medium">Ulasan Dikirim</span>
                </div>
                {order.rating && (
                  <span className="text-[#16A34A] font-bold text-sm">{order.rating}/5</span>
                )}
              </div>
            ) : (
              <Link
                to={`/pesanan/${order.id}/ulasan`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#E91E8C] text-[#E91E8C] text-sm font-medium hover:bg-[#FDF4FF] transition-colors"
              >
                <Star className="w-4 h-4" />
                Beri Ulasan
              </Link>
            )}
          </div>
        )}

        {order.status === "dibatalkan" && (
          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
              <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
              <p className="text-[#DC2626] text-xs font-medium">
                {order.cancelReason ?? "Provider tidak dapat menerima pesanan ini."}
              </p>
            </div>
            <Link
              to={getSearchRoute(order.serviceCategory)}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E91E8C] to-[#7C3AED] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <UserSearch className="w-4 h-4" />
              Pilih Provider Lain
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded-full w-2/5" />
            <div className="h-3 bg-gray-100 rounded-full w-3/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Pesanan() {
  usePageTitle("Pesanan Saya | TEMENIN");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders: localOrders } = useOrders();
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
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
      setApiOrders(data.map(mapBookingToOrder));
    } catch (err) {
      if (!quiet)
        setFetchError(err instanceof Error ? err.message : "Gagal memuat pesanan.");
    } finally {
      if (!quiet) setLoading(false);
      else setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOrders();
      pollingRef.current = setInterval(() => void fetchOrders(true), 10_000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [authLoading, isAuthenticated, fetchOrders]);

  async function handleConfirmComplete(id: string | number) {
    if (typeof id === "string" && isUuid(id)) {
      await completeBooking(id);
      await fetchOrders();
    }
  }

  // Merge API orders + local (simulation) orders, dedup by id
  const allOrders = useMemo(() => {
    const apiIds = new Set(apiOrders.map((o) => String(o.id)));
    const uniqueLocal = localOrders.filter((o) => !apiIds.has(String(o.id)));
    return [...apiOrders, ...uniqueLocal].sort(
      (a, b) => Number(b.id) - Number(a.id),
    );
  }, [apiOrders, localOrders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "semua") return allOrders;
    if (activeFilter === "aktif")
      return allOrders.filter((o) => o.status === "berlangsung" || o.status === "pending");
    if (activeFilter === "selesai")
      return allOrders.filter((o) => o.status === "selesai");
    return allOrders.filter((o) => o.status === "dibatalkan");
  }, [allOrders, activeFilter]);

  // Stats
  const stats = useMemo(() => {
    const aktif   = allOrders.filter((o) => o.status === "pending" || o.status === "berlangsung").length;
    const selesai = allOrders.filter((o) => o.status === "selesai").length;
    const totalSpend = allOrders
      .filter((o) => o.status === "selesai")
      .reduce((sum, o) => sum + o.price, 0);
    return { aktif, selesai, totalSpend };
  }, [allOrders]);

  const tabCounts = useMemo(() => ({
    semua:      allOrders.length,
    aktif:      allOrders.filter((o) => o.status === "berlangsung" || o.status === "pending").length,
    selesai:    allOrders.filter((o) => o.status === "selesai").length,
    dibatalkan: allOrders.filter((o) => o.status === "dibatalkan").length,
  }), [allOrders]);

  if (authLoading) return null;

  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;
  if (user.role === "penyedia") return <Navigate to="/dashboard-penyedia" replace />;

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#FFF0F8] rounded-full blur-3xl opacity-50" />
      </div>

      <AppNavbar activePage="pesanan" />

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl">Pesanan Saya</h1>
            <p className="text-[#94A3B8] text-sm mt-1">
              Riwayat semua layanan yang pernah kamu pesan
            </p>
          </div>

          {/* Stats */}
          {!loading && allOrders.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard label="Pesanan Aktif"    value={stats.aktif}   sub={stats.aktif > 0 ? "sedang berjalan" : "tidak ada"} />
              <StatCard label="Pesanan Selesai"  value={stats.selesai} sub="total layanan" />
              <StatCard label="Total Pengeluaran" value={formatRupiah(stats.totalSpend)} gradient />
            </div>
          )}

          {/* Filter tabs + refresh */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeFilter === tab.key
                      ? "bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white shadow-sm"
                      : "bg-white text-[#64748B] border border-[#E5E7EB] hover:border-[#FBCFE8]",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tabCounts[tab.key] > 0 && (
                    <span
                      className={cn(
                        "ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        activeFilter === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-[#F3E8FF] text-[#7C3AED]",
                      )}
                    >
                      {tabCounts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void fetchOrders(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#7C3AED] transition-colors"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Memuat..." : "Perbarui"}
            </button>
          </div>

          {/* Error */}
          {fetchError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {fetchError}
            </div>
          )}

          {/* Order list */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
            </div>
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
            <div className="py-16 bg-white rounded-2xl border border-dashed border-[#E9D5FF] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-4">
                <PackageSearch className="w-7 h-7 text-[#D8B4E2]" />
              </div>
              <p className="text-[#2C1810] font-semibold text-base mb-1">
                {activeFilter === "semua" ? "Belum ada pesanan" : `Tidak ada pesanan ${activeFilter}`}
              </p>
              <p className="text-[#94A3B8] text-sm max-w-xs">
                {activeFilter === "semua"
                  ? "Cari Temanian dan mulai memesan layanan pertamamu!"
                  : "Coba pilih tab filter lain untuk melihat pesanan kamu."}
              </p>
              {activeFilter === "semua" && (
                <Link
                  to="/jasa-temenin"
                  className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                >
                  Cari Temanian →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
