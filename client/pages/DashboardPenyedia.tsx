import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { MessageCircle, Phone, Wallet } from "lucide-react";
import ProviderNavbar from "@/components/ProviderNavbar";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah, type Order } from "@/data/orders";
import {
  confirmBooking,
  listBookings,
  mapBookingToOrder,
} from "@/lib/bookingApi";
import { getStoredToken } from "@/lib/authApi";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: Order["status"] }) {
  if (status === "pending") return null;

  const config = {
    berlangsung: {
      label: "Berlangsung",
      className: "bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white",
    },
    dibatalkan: {
      label: "Dibatalkan",
      className: "bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white",
    },
    selesai: {
      label: "Selesai",
      className: "bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white",
    },
  } as const;

  const { label, className } = config[status];
  return (
    <span
      className={cn(
        "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap",
        className,
      )}
    >
      {label}
    </span>
  );
}

function TransactionActions({
  order,
  onAccept,
  onReject,
  onChat,
  busy,
}: {
  order: Order;
  onAccept: (id: string | number) => void;
  onReject: (id: string | number) => void;
  onChat: (id: string | number) => void;
  busy: boolean;
}) {
  if (order.status === "pending") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onAccept(order.id)}
          className="px-4 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold transition-colors disabled:opacity-60"
        >
          Terima
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onReject(order.id)}
          className="px-4 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold transition-colors disabled:opacity-60"
        >
          Tolak
        </button>
      </div>
    );
  }

  if (order.status === "berlangsung") {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-[#FDF4FF] border border-[#FBCFE8] flex items-center justify-center text-[#7C3AED] hover:bg-[#FCE7F3] transition-colors"
          aria-label="Telepon"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onChat(order.id)}
          className="w-9 h-9 rounded-full bg-[#FDF4FF] border border-[#FBCFE8] flex items-center justify-center text-[#7C3AED] hover:bg-[#FCE7F3] transition-colors"
          aria-label="Chat"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <StatusBadge status={order.status} />
      </div>
    );
  }

  if (order.status === "selesai") {
    return <StatusBadge status={order.status} />;
  }

  return <StatusBadge status={order.status} />;
}

function TransactionRow({
  order,
  onAccept,
  onReject,
  onChat,
  busy,
}: {
  order: Order;
  onAccept: (id: string | number) => void;
  onReject: (id: string | number) => void;
  onChat: (id: string | number) => void;
  busy: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,1.4fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(90px,0.7fr)_minmax(160px,1.2fr)] gap-4 lg:gap-3 items-center py-5 border-b border-[#FBCFE8]/40 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] font-bold text-xs flex-shrink-0">
          {order.userInitials}
        </div>
        <div className="min-w-0">
          <p className="text-[#2C1810] font-bold text-sm truncate">
            {order.userName}
          </p>
          <p className="text-[#94A3B8] text-xs truncate">
            {order.userLocation}
          </p>
        </div>
      </div>

      <div className="lg:text-left">
        <p className="text-[#94A3B8] text-xs font-medium lg:hidden mb-0.5">
          Jasa
        </p>
        <p className="text-[#2C1810] text-sm font-medium">{order.service}</p>
      </div>

      <div className="lg:text-left">
        <p className="text-[#94A3B8] text-xs font-medium lg:hidden mb-0.5">
          Jadwal
        </p>
        <p className="text-[#2C1810] text-sm">{order.datetimeRange}</p>
      </div>

      <div className="lg:text-left">
        <p className="text-[#2C1810] text-sm font-bold">
          {formatRupiah(order.price)}
        </p>
      </div>

      <div className="flex lg:justify-end">
        <TransactionActions
          order={order}
          onAccept={onAccept}
          onReject={onReject}
          onChat={onChat}
          busy={busy}
        />
      </div>
    </div>
  );
}

const STATUS_SORT: Record<Order["status"], number> = {
  pending: 0,
  berlangsung: 1,
  selesai: 2,
  dibatalkan: 3,
};

export default function DashboardPenyedia() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      // silent — wallet tidak wajib tampil
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === "penyedia") {
      loadOrders();
      loadWallet();
      // Auto-refresh setiap 15 detik
      pollingRef.current = setInterval(() => {
        loadOrders();
      }, 15_000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthenticated, user?.role, loadOrders]);

  const providerOrders = useMemo(
    () => [...orders].sort((a, b) => STATUS_SORT[a.status] - STATUS_SORT[b.status]),
    [orders],
  );

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders],
  );

  const stats = useMemo(() => {
    const upcoming = providerOrders.filter(
      (o) => o.status === "pending" || o.status === "berlangsung",
    ).length;
    const completed = providerOrders.filter((o) => o.status === "selesai").length;

    return { upcoming, completed };
  }, [providerOrders]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/masuk" replace />;
  }

  if (user.role !== "penyedia") {
    return (
      <Navigate
        to={user.role === "admin" ? "/dashboard-admin" : "/dashboard"}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-[#EDE9FE] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#EDE9FE] rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[40%] left-[20%] w-[25%] h-[25%] bg-[#FFF0F8] rounded-full blur-3xl opacity-50" />
      </div>

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <ProviderNavbar activePage="dashboard" pendingCount={pendingCount} />

          {/* ── Stats ─────────────────────────────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 lg:mt-8">
            <div className="bg-white rounded-2xl p-6 border border-[#FBCFE8] shadow-sm text-center">
              <p className="text-[#2C1810] font-bold text-sm sm:text-base mb-2">
                Pesanan Aktif
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-[#2C1810]">
                {stats.upcoming}
              </p>
              {pendingCount > 0 && (
                <p className="text-[#E91E8C] text-xs font-semibold mt-1">
                  {pendingCount} menunggu konfirmasi
                </p>
              )}
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#FBCFE8] shadow-sm text-center">
              <p className="text-[#2C1810] font-bold text-sm sm:text-base mb-2">
                Transaksi Selesai
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-[#2C1810]">
                {stats.completed}
              </p>
            </div>
            <Link
              to="/wallet-penyedia"
              className="bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] rounded-2xl p-6 shadow-sm text-center text-white hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="w-4 h-4 opacity-80" />
                <p className="font-bold text-sm">Saldo Wallet</p>
              </div>
              <p className="text-3xl sm:text-4xl font-bold">
                {walletBalance !== null ? formatRupiah(walletBalance) : "—"}
              </p>
              <p className="text-white/70 text-xs mt-1">Klik untuk detail →</p>
            </Link>
          </section>

          {/* ── Tabel Pesanan ─────────────────────────────── */}
          <section className="mt-6 bg-[#FFF8F5] rounded-2xl border border-[#FBCFE8] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#FBCFE8]/60 bg-white/60 flex items-center justify-between">
              <p className="text-[#2C1810] font-bold text-sm">
                Pesanan Masuk
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full">
                    {pendingCount}
                  </span>
                )}
              </p>
            </div>
            <div className="hidden lg:grid grid-cols-[minmax(180px,1.4fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(90px,0.7fr)_minmax(160px,1.2fr)] gap-3 px-6 py-3 border-b border-[#FBCFE8]/40 bg-white/40">
              <p className="text-[#94A3B8] font-semibold text-xs">Nama User</p>
              <p className="text-[#94A3B8] font-semibold text-xs">Jasa</p>
              <p className="text-[#94A3B8] font-semibold text-xs">Jadwal</p>
              <p className="text-[#94A3B8] font-semibold text-xs">Harga</p>
              <p className="text-[#94A3B8] font-semibold text-xs text-right">Aksi</p>
            </div>

            <div className="px-4 sm:px-6">
              {loadingOrders ? (
                <div className="py-16 text-center text-[#94A3B8] text-sm">
                  Memuat transaksi...
                </div>
              ) : providerOrders.length > 0 ? (
                providerOrders.map((order) => (
                  <TransactionRow
                    key={order.id}
                    order={order}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onChat={(id) => navigate(`/pesanan/${id}`)}
                    busy={busyId === order.id}
                  />
                ))
              ) : (
                <div className="py-16 text-center">
                  <p className="text-[#64748B] font-medium text-sm">
                    Belum ada transaksi
                  </p>
                  <p className="text-[#94A3B8] text-xs mt-1 max-w-sm mx-auto">
                    Pesanan dari pengguna akan muncul di sini setelah mereka
                    memesan jasa Temenin.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
