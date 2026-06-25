import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import ProviderNavbar from "@/components/ProviderNavbar";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah, type Order } from "@/data/orders";
import {
  confirmBooking,
  listBookings,
  mapBookingToOrder,
} from "@/lib/bookingApi";
import {
  acceptActivityRequest,
  activityRequestTypeLabel,
  listOpenActivityRequests,
  type ActivityRequestRecord,
} from "@/lib/activityRequestApi";
import { getStoredToken } from "@/lib/authApi";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterTab = "semua" | "aktif" | "selesai" | "dibatalkan";

const STATUS_SORT: Record<Order["status"], number> = {
  pending: 0,
  berlangsung: 1,
  selesai: 2,
  dibatalkan: 3,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  gradient?: boolean;
  to?: string;
}) {
  const inner = (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-sm border h-full",
        gradient
          ? "bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] text-white border-transparent"
          : "bg-white border-gray-100",
      )}
    >
      <div className={cn("flex items-center gap-2 mb-3", gradient ? "text-white/80" : "text-[#94A3B8]")}>
        {icon}
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <p className={cn("text-3xl font-bold", gradient ? "text-white" : "text-[#2C1810]")}>
        {value}
      </p>
      {sub && (
        <p className={cn("text-xs mt-1.5", gradient ? "text-white/70" : "text-[#94A3B8]")}>
          {sub}
        </p>
      )}
      {to && <p className={cn("text-xs mt-2 font-medium", gradient ? "text-white/80" : "text-[#7C3AED]")}>Klik untuk detail →</p>}
    </div>
  );

  return to ? (
    <Link to={to} className="block hover:opacity-90 transition-opacity">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── Order Row (desktop table) ────────────────────────────────────────────────
function OrderRow({
  order,
  onAccept,
  onReject,
  busy,
}: {
  order: Order;
  onAccept: (id: string | number) => void;
  onReject: (id: string | number) => void;
  busy: boolean;
}) {
  const navigate = useNavigate();
  const statusConfig = {
    pending:     { label: "Menunggu",    className: "bg-[#FEFCE8] text-[#CA8A04] border border-[#FACC15]" },
    berlangsung: { label: "Berlangsung", className: "bg-[#FDF4FF] text-[#7C3AED] border border-[#E9D5FF]" },
    selesai:     { label: "Selesai",     className: "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]" },
    dibatalkan:  { label: "Dibatalkan",  className: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]" },
  };
  const s = statusConfig[order.status];

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[2fr_1.6fr_1.2fr_0.8fr_1.4fr] gap-3 items-center py-4 border-b border-gray-50 last:border-b-0 hover:bg-[#FAFAFA] transition-colors px-4 sm:px-6 rounded-xl"
    >
      {/* User */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {order.userInitials || order.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[#2C1810] font-semibold text-sm truncate">{order.userName}</p>
          <p className="text-[#94A3B8] text-xs truncate">{order.userLocation}</p>
        </div>
      </div>

      {/* Service */}
      <div>
        <p className="text-[#94A3B8] text-xs lg:hidden mb-0.5 font-medium">Jasa</p>
        <p className="text-[#2C1810] text-sm font-medium truncate">{order.service}</p>
        <p className="text-[#94A3B8] text-xs truncate">{order.duration}</p>
      </div>

      {/* Schedule */}
      <div>
        <p className="text-[#94A3B8] text-xs lg:hidden mb-0.5 font-medium">Jadwal</p>
        <p className="text-[#2C1810] text-sm">{order.datetime}</p>
      </div>

      {/* Price */}
      <div>
        <p className="text-[#94A3B8] text-xs lg:hidden mb-0.5 font-medium">Pendapatan</p>
        <p className="text-[#2C1810] font-bold text-sm">{formatRupiah(order.providerEarnings ?? order.price)}</p>
        <p className="text-[#94A3B8] text-xs">setelah komisi</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-start lg:justify-end flex-wrap">
        <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", s.className)}>
          {s.label}
        </span>
        {order.status === "pending" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAccept(order.id)}
              className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              Terima
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onReject(order.id)}
              className="px-3 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              Tolak
            </button>
          </>
        )}
        {order.status === "berlangsung" && (
          <button
            type="button"
            onClick={() => navigate(`/pesanan/${order.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FDF4FF] border border-[#E9D5FF] text-[#7C3AED] text-xs font-semibold hover:bg-[#FCE7F3] transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            Chat
          </button>
        )}
        {order.status === "selesai" && (
          <button
            type="button"
            onClick={() => navigate(`/pesanan/${order.id}`)}
            className="px-3 py-1.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-xs font-semibold hover:bg-[#DCFCE7] transition-colors"
          >
            Detail
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Order Card (mobile) ──────────────────────────────────────────────────────
function OrderCard({
  order,
  onAccept,
  onReject,
  busy,
}: {
  order: Order;
  onAccept: (id: string | number) => void;
  onReject: (id: string | number) => void;
  busy: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className={cn(
          "h-1",
          order.status === "pending"     && "bg-[#FACC15]",
          order.status === "berlangsung" && "bg-gradient-to-r from-[#E91E8C] to-[#7C3AED]",
          order.status === "selesai"     && "bg-[#22C55E]",
          order.status === "dibatalkan"  && "bg-[#EF4444]",
        )}
      />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {order.userInitials || order.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#2C1810] font-bold text-sm">{order.userName}</p>
            <p className="text-[#94A3B8] text-xs">{order.service} · {order.duration}</p>
            <p className="text-[#64748B] text-xs mt-1 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {order.datetime}
            </p>
          </div>
          <p className="text-[#2C1810] font-bold text-sm flex-shrink-0">{formatRupiah(order.providerEarnings ?? order.price)}</p>
        </div>

        {order.status === "pending" && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onAccept(order.id)}
              className="flex-1 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              ✓ Terima
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onReject(order.id)}
              className="flex-1 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              ✗ Tolak
            </button>
          </div>
        )}
        {order.status === "berlangsung" && (
          <button
            type="button"
            onClick={() => navigate(`/pesanan/${order.id}`)}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-[#E91E8C] to-[#7C3AED] text-white text-xs font-semibold"
          >
            Buka Chat
          </button>
        )}
        {(order.status === "selesai" || order.status === "dibatalkan") && (
          <button
            type="button"
            onClick={() => navigate(`/pesanan/${order.id}`)}
            className="w-full py-2 rounded-xl border border-[#E5E7EB] text-[#64748B] text-xs font-semibold hover:bg-[#F8FAFC] transition-colors"
          >
            Lihat Detail
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPenyedia() {
  usePageTitle("Dashboard Penyedia | TEMENIN");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("semua");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [openRequests, setOpenRequests] = useState<ActivityRequestRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(
    null,
  );

  const loadOpenRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const data = await listOpenActivityRequests();
      setOpenRequests(data);
    } catch {
      setOpenRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await listBookings();
      setOrders(data.map(mapBookingToOrder));
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  async function loadWallet() {
    try {
      const token = getStoredToken();
      const res = await fetch("/api/payments/wallet/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(parseFloat(data.data.balance));
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === "penyedia") {
      void loadOrders();
      void loadWallet();
      void loadOpenRequests();
      pollingRef.current = setInterval(() => {
        void loadOrders();
        void loadOpenRequests();
      }, 10_000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthenticated, user?.role, loadOrders, loadOpenRequests]);

  async function handleAccept(id: string | number) {
    if (typeof id !== "string") return;
    setBusyId(id);
    try {
      await confirmBooking(id, { action: "accept" });
      await loadOrders();
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string | number) {
    if (typeof id !== "string") return;
    setBusyId(id);
    try {
      await confirmBooking(id, { action: "reject", reason: "Ditolak oleh provider" });
      await loadOrders();
    } finally {
      setBusyId(null);
    }
  }

  async function handleAcceptRequest(requestId: string) {
    setAcceptingRequestId(requestId);
    try {
      const result = await acceptActivityRequest(requestId);
      await loadOpenRequests();
      await loadOrders();
      navigate(`/pesanan/${result.booking.id}`);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Gagal menerima permintaan.",
      );
      await loadOpenRequests();
    } finally {
      setAcceptingRequestId(null);
    }
  }

  function requestSummary(request: ActivityRequestRecord): string {
    const payload = request.payload ?? {};
    switch (request.request_type) {
      case "belanja_titip":
        return String(payload.storeName ?? request.address ?? "Belanja titip");
      case "antri_mewakili":
        return String(payload.location ?? request.address ?? "Antri mewakili");
      case "ambil_rapor":
        return String(payload.schoolName ?? request.address ?? "Ambil rapor");
      default:
        return request.address ?? "-";
    }
  }

  // Computed
  const filteredOrders = useMemo(() => {
    const base =
      activeFilter === "semua"
        ? orders
        : activeFilter === "aktif"
          ? orders.filter((o) => o.status === "pending" || o.status === "berlangsung")
          : activeFilter === "selesai"
            ? orders.filter((o) => o.status === "selesai")
            : orders.filter((o) => o.status === "dibatalkan");

    return [...base].sort((a, b) => STATUS_SORT[a.status] - STATUS_SORT[b.status]);
  }, [orders, activeFilter]);

  const stats = useMemo(() => {
    const pending     = orders.filter((o) => o.status === "pending").length;
    const berlangsung = orders.filter((o) => o.status === "berlangsung").length;
    const selesai     = orders.filter((o) => o.status === "selesai").length;
    const totalEarned = orders
      .filter((o) => o.status === "selesai")
      .reduce((sum, o) => sum + o.price, 0);
    return { pending, berlangsung, selesai, totalEarned };
  }, [orders]);

  const tabCounts = useMemo(() => ({
    semua:      orders.length,
    aktif:      orders.filter((o) => o.status === "pending" || o.status === "berlangsung").length,
    selesai:    orders.filter((o) => o.status === "selesai").length,
    dibatalkan: orders.filter((o) => o.status === "dibatalkan").length,
  }), [orders]);

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;
  if (user.role !== "penyedia") {
    return (
      <Navigate
        to={user.role === "admin" ? "/dashboard-admin" : "/dashboard"}
        replace
      />
    );
  }

  const FILTER_TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: "semua",      label: "Semua",      icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: "aktif",      label: "Aktif",      icon: <Clock className="w-3.5 h-3.5" /> },
    { key: "selesai",    label: "Selesai",    icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { key: "dibatalkan", label: "Dibatalkan", icon: <XCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-[#EDE9FE] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#FFF0F8] rounded-full blur-3xl opacity-40" />
      </div>

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          <ProviderNavbar activePage="dashboard" pendingCount={stats.pending} />

          {/* ── Header ─────────────────────────────────────── */}
          <div className="mt-6 mb-6">
            <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl">Dashboard Penyedia</h1>
            <p className="text-[#94A3B8] text-sm mt-1">
              Selamat datang, <span className="font-semibold text-[#4C1D95]">{user.name}</span>
            </p>
          </div>

          {/* ── Stats ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Clock className="w-4 h-4" />}
              label="Menunggu Konfirmasi"
              value={stats.pending}
              sub={stats.pending > 0 ? "perlu tindakan" : "tidak ada"}
            />
            <StatCard
              icon={<MessageSquare className="w-4 h-4" />}
              label="Sedang Berlangsung"
              value={stats.berlangsung}
              sub="sesi aktif"
            />
            <StatCard
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Selesai"
              value={stats.selesai}
              sub="total pesanan"
            />
            <StatCard
              icon={<Wallet className="w-4 h-4" />}
              label="Saldo Wallet"
              value={walletBalance !== null ? formatRupiah(walletBalance) : "—"}
              gradient
              to="/wallet-penyedia"
            />
          </div>

          {/* ── Permintaan Bantu (broadcast) ──────────────── */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#2C1810] font-bold text-lg">
                Permintaan Bantu Aktivitas
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A]">
                {openRequests.length} terbuka
              </span>
            </div>

            {loadingRequests ? (
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 text-center text-[#94A3B8] text-sm">
                Memuat permintaan...
              </div>
            ) : openRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 text-center text-[#94A3B8] text-sm">
                Belum ada permintaan bantu saat ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {openRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl border border-[#BBF7D0] p-5 shadow-sm"
                  >
                    <div className="mb-3">
                      <p className="text-[#16A34A] text-xs font-bold uppercase tracking-wide">
                        {activityRequestTypeLabel(request.request_type)}
                      </p>
                      <p className="text-[#2C1810] font-bold text-base mt-1">
                        {requestSummary(request)}
                      </p>
                      <p className="text-[#64748B] text-sm mt-1">
                        {request.user_name ?? "Pengguna"} •{" "}
                        <span className="font-semibold text-[#16A34A]">
                          {formatRupiah(parseFloat(request.total_price) * 0.9)}
                        </span>
                        <span className="text-xs ml-1">(setelah komisi)</span>
                      </p>
                    </div>
                    {request.address && (
                      <p className="text-[#94A3B8] text-xs mb-4 line-clamp-2">
                        {request.address}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={acceptingRequestId === request.id}
                      onClick={() => void handleAcceptRequest(request.id)}
                      className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {acceptingRequestId === request.id
                        ? "Memproses..."
                        : "Terima Permintaan"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Filter Tabs ─────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-5">
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

          {/* ── Desktop Table ───────────────────────────────── */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1.6fr_1.2fr_0.8fr_1.4fr] gap-3 px-6 py-3 border-b border-gray-100 bg-[#FAFAFA]">
              {["Pengguna", "Jasa", "Jadwal", "Pendapatan", "Aksi"].map((h) => (
                <p key={h} className="text-[#94A3B8] font-semibold text-xs uppercase tracking-wide">
                  {h}
                </p>
              ))}
            </div>

            {loadingOrders ? (
              <div className="py-16 text-center text-[#94A3B8] text-sm">Memuat data...</div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  busy={busyId === order.id}
                />
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-[#64748B] font-medium text-sm mb-1">Tidak ada pesanan</p>
                <p className="text-[#94A3B8] text-xs">
                  {activeFilter === "semua"
                    ? "Pesanan dari pengguna akan muncul di sini."
                    : "Tidak ada pesanan dengan status ini."}
                </p>
              </div>
            )}
          </div>

          {/* ── Mobile Cards ────────────────────────────────── */}
          <div className="lg:hidden">
            {loadingOrders ? (
              <div className="py-12 text-center text-[#94A3B8] text-sm">Memuat data...</div>
            ) : filteredOrders.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    busy={busyId === order.id}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E9D5FF]">
                <p className="text-[#64748B] font-medium text-sm mb-1">Tidak ada pesanan</p>
                <p className="text-[#94A3B8] text-xs">
                  {activeFilter === "semua"
                    ? "Pesanan dari pengguna akan muncul di sini."
                    : "Tidak ada pesanan dengan status ini."}
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
