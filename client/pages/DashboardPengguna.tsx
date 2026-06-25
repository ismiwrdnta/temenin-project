import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import ProviderListCard from "@/components/ProviderListCard";
import type { MapProvider } from "@/components/ProviderMap";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { useMapLocation } from "@/hooks/useMapLocation";
import { listBookings, mapBookingToOrder, searchProviders } from "@/lib/bookingApi";
import { getStoredToken } from "@/lib/authApi";
import { mapApiProviderToMapProvider } from "@/lib/provider-map";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

function getProviderLink(provider: MapProvider): string {
  return `/provider/${provider.id}/pilih-layanan`;
}

const EMPTY_STATS = {
  balance: 0,
  stats: {
    active: 0,
    completed: 0,
    rating: 0,
    curhat: 0,
  },
};

function EmptyStateCard({
  message,
  hint,
  action,
}: {
  message: string;
  hint?: string;
  action?: { label: string; onClick?: () => void };
}) {
  return (
    <div className="w-full py-10 lg:py-12 px-6 bg-white rounded-2xl border border-dashed border-[#E9D5FF] flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-3">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D8B4E2"
          strokeWidth="1.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-[#64748B] font-medium text-sm max-w-xs">{message}</p>
      {hint && (
        <p className="text-[#94A3B8] text-xs mt-1.5 max-w-sm">{hint}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 bg-[#E91E8C] hover:bg-[#D81B60] text-white px-5 py-2 rounded-xl font-medium text-xs transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  emptyLabel,
  formatValue,
}: {
  value: number;
  label: string;
  emptyLabel: string;
  formatValue?: (v: number) => string;
}) {
  const isEmpty = !value || value <= 0;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 lg:p-6 flex flex-col items-center justify-center shadow-sm border min-h-[120px]",
        isEmpty ? "border-dashed border-[#E9D5FF]" : "border-gray-100",
      )}
    >
      {isEmpty ? (
        <>
          <span className="text-sm font-semibold text-[#94A3B8] mb-1.5 text-center leading-snug">
            {emptyLabel}
          </span>
          <span className="text-[#CBD5E1] text-xs font-medium text-center">
            {label}
          </span>
        </>
      ) : (
        <>
          <span className="text-3xl lg:text-4xl font-bold text-[#4C1D95] mb-2">
            {formatValue ? formatValue(value) : value}
          </span>
          <span className="text-[#94A3B8] text-xs font-medium text-center">
            {label}
          </span>
        </>
      )}
    </div>
  );
}

export default function DashboardPengguna() {
  usePageTitle("Dashboard | TEMENIN");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { orders: localOrders } = useOrders();
  const { userLocation } = useMapLocation();
  const [nearbyProviders, setNearbyProviders] = useState<MapProvider[]>([]);
  const [apiOrders, setApiOrders] = useState<ReturnType<typeof mapBookingToOrder>[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [topupSuccess, setTopupSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listBookings();
        if (!cancelled) setApiOrders(data.map(mapBookingToOrder));
      } catch {
        if (!cancelled) setApiOrders([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = getStoredToken();
    fetch("/api/user/balance", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((d) => { if (d?.data?.balance != null) setUserBalance(parseFloat(d.data.balance)); })
      .catch(() => {});
  }, [isAuthenticated, topupSuccess]);

  useEffect(() => {
    if (!userLocation) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = await searchProviders({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 25,
          limit: 10,
        });
        const mapped = raw
          .map((p) => mapApiProviderToMapProvider(p, userLocation))
          .filter((p): p is MapProvider => p !== null)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 3);
        if (!cancelled) setNearbyProviders(mapped);
      } catch {
        if (!cancelled) setNearbyProviders([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userLocation]);

  const orders = apiOrders.length > 0 ? apiOrders : localOrders;

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.status === "berlangsung" || o.status === "pending",
      ),
    [orders],
  );

  const completedCount = useMemo(
    () => orders.filter((o) => o.status === "selesai").length,
    [orders],
  );

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

  if (user.role === "penyedia") {
    return <Navigate to="/dashboard-penyedia" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/dashboard-admin" replace />;
  }

  const ratingCount = useMemo(
    () => orders.filter((o) => o.status === "selesai" && o.reviewStatus === "sent").length,
    [orders],
  );

  const curhatCount = useMemo(
    () => orders.filter((o) => o.status === "selesai" && o.serviceCategory === "curhat").length,
    [orders],
  );

  const userData = {
    name: user.name,
    initials: user.initials,
    balance: userBalance,
    stats: {
      active: activeOrders.length,
      completed: completedCount,
      rating: ratingCount,
      curhat: curhatCount,
    },
  };

  const hasBalance = userData.balance > 0;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "Rp ");
  };

  const TOPUP_PRESETS = [20000, 50000, 100000, 200000];

  async function handleTopup() {
    const amount = parseFloat(topupAmount.replace(/\D/g, ""));
    if (!amount || amount < 10000) {
      setTopupError("Minimal top-up Rp 10.000.");
      return;
    }
    if (amount > 10000000) {
      setTopupError("Maksimal top-up Rp 10.000.000.");
      return;
    }
    const token = getStoredToken();
    setTopupLoading(true);
    setTopupError(null);
    try {
      const res = await fetch("/api/user/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ amount }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error ?? "Gagal top-up.");
      setUserBalance(d.data.balance);
      setTopupSuccess(true);
      setTimeout(() => { setShowTopup(false); setTopupSuccess(false); }, 2000);
    } catch (err) {
      setTopupError(err instanceof Error ? err.message : "Gagal top-up.");
    } finally {
      setTopupLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#F3E8FF] rounded-full blur-3xl opacity-50" />
      </div>

      {/* Modal Top-Up */}
      {showTopup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            {topupSuccess ? (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-[#2C1810] font-bold text-lg">Top-Up Berhasil!</p>
                <p className="text-[#94A3B8] text-sm mt-1">Saldo kamu sudah diperbarui.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[#2C1810] font-bold text-lg">Isi Saldo TEMENIN</h3>
                  <button type="button" onClick={() => setShowTopup(false)} className="text-[#94A3B8] hover:text-[#2C1810] text-xl">✕</button>
                </div>
                <p className="text-[#94A3B8] text-xs mb-4">Saldo tersedia: <span className="font-semibold text-[#4C1D95]">{formatRupiah(userBalance)}</span></p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {TOPUP_PRESETS.map((p) => (
                    <button key={p} type="button" onClick={() => setTopupAmount(String(p))}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                        topupAmount === String(p) ? "bg-[#E91E8C] border-[#E91E8C] text-white" : "border-[#E9D5FF] text-[#7C3AED] bg-[#FDF4FF] hover:border-[#E91E8C]")}
                    >
                      {formatRupiah(p)}
                    </button>
                  ))}
                </div>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm font-medium">Rp</span>
                  <input type="text" inputMode="numeric" value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value.replace(/\D/g, ""))}
                    placeholder="Nominal lainnya..."
                    className="w-full pl-10 pr-4 py-3.5 bg-[#F8F9FA] border border-[#F3E8FF] rounded-xl text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                  />
                </div>
                {topupAmount && Number(topupAmount) >= 10000 && (
                  <p className="text-[#94A3B8] text-xs mb-3">= {formatRupiah(parseFloat(topupAmount) || 0)}</p>
                )}
                {topupError && <p className="text-[#DC2626] text-xs mb-3">{topupError}</p>}
                <button type="button" onClick={handleTopup} disabled={topupLoading}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity disabled:opacity-60">
                  {topupLoading ? "Memproses..." : "Konfirmasi Top-Up"}
                </button>
                <p className="text-[#94A3B8] text-[10px] text-center mt-3 leading-relaxed">Simulasi pembayaran. Dana akan masuk ke saldo TEMENIN kamu.</p>
              </>
            )}
          </div>
        </div>
      )}

      <AppNavbar
        activePage="beranda"
        userName={userData.name}
        userInitials={userData.initials}
      />

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <section className="mb-8 lg:mb-10">
            <h1 className="text-[#2C1810] font-bold text-xl lg:text-2xl mb-1">
              Halo, {userData.name.split(" ")[0]}!
            </h1>
            <p className="text-[#94A3B8] text-sm mb-5">
              Apa yang kamu butuhkan hari ini?
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/jasa-temenin"
                className="bg-[#E91E8C] hover:bg-[#D81B60] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm inline-block"
              >
                Cari Temanian
              </Link>
              <Link
                to="/jasa-curhat/pilih"
                className="bg-transparent border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FDF4FF] px-6 py-2.5 rounded-xl font-medium text-sm transition-colors inline-block"
              >
                Curhat
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 lg:mb-10">
            {/* Saldo */}
            <div
              className={cn(
                "lg:col-span-4 rounded-2xl p-6 lg:p-8 shadow-sm border flex flex-col justify-between min-h-[160px]",
                hasBalance
                  ? "bg-[#F3E8FF] border-[#E9D5FF]"
                  : "bg-[#FAFAFA] border-dashed border-[#E9D5FF]",
              )}
            >
              <div>
                <p className="text-[#4C1D95] text-sm font-medium mb-1">
                  Saldo TEMENIN
                </p>
                {hasBalance ? (
                  <h3 className="text-3xl lg:text-4xl font-bold text-[#2C1810]">
                    {formatRupiah(userData.balance)}
                  </h3>
                ) : (
                  <>
                    <h3 className="text-xl lg:text-2xl font-semibold text-[#94A3B8]">
                      Belum terisi
                    </h3>
                    <p className="text-[#94A3B8] text-xs mt-2 leading-relaxed">
                      Isi saldo dulu untuk mulai pesan jasa Temenin.
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setShowTopup(true); setTopupError(null); setTopupSuccess(false); setTopupAmount(""); }}
                className={cn(
                  "mt-6 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 shadow-sm w-fit",
                  hasBalance
                    ? "bg-white text-[#4C1D95] border border-[#E9D5FF] hover:bg-gray-50"
                    : "bg-[#E91E8C] hover:bg-[#D81B60] text-white border-0",
                )}
              >
                <span className="text-lg leading-none">+</span>
                {hasBalance ? "Top Up" : "Isi Saldo"}
              </button>
            </div>

            {/* Stats */}
            <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                value={userData.stats.active}
                label="Pesanan aktif"
                emptyLabel="Belum ada pesanan"
              />
              <StatCard
                value={userData.stats.completed}
                label="Sesi selesai"
                emptyLabel="Belum ada sesi"
              />
              <StatCard
                value={userData.stats.rating}
                label="Rating diberikan"
                emptyLabel="Belum ada rating"
                formatValue={(v) => v.toFixed(1)}
              />
              <StatCard
                value={userData.stats.curhat}
                label="Sesi Temenin Curhat"
                emptyLabel="Belum ada sesi"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10">
            <div>
              <h3 className="text-[#2C1810] font-bold text-base lg:text-lg mb-4">
                Pesanan Aktif
              </h3>

              {activeOrders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm border border-gray-100 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E91E8C]" />

                      <div className="flex items-center gap-4 pl-2">
                        <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm flex-shrink-0">
                          {order.initials}
                        </div>
                        <div>
                          <h4 className="text-[#4C1D95] font-bold text-base">
                            {order.providerName}
                          </h4>
                          <p className="text-[#94A3B8] text-xs mt-0.5">
                            {order.service} • {order.duration}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-[#F59E0B] text-xs font-medium">
                              {order.datetime}
                            </p>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="#F59E0B"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/pesanan/${order.id}`)}
                        className="bg-[#E91E8C] hover:bg-[#D81B60] text-white px-5 py-2 rounded-xl font-medium text-xs transition-colors sm:ml-auto w-full sm:w-auto"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStateCard
                  message="Belum ada pesanan aktif"
                  hint="Pesan jasa Temenin untuk melihat pesanan yang sedang berjalan di sini."
                  action={{
                    label: "Cari Temanian",
                    onClick: () => navigate("/jasa-temenin"),
                  }}
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#2C1810] font-bold text-base lg:text-lg">
                  Temanian Terdekat
                </h3>
                <Link
                  to="/pencarian"
                  className="text-[#E91E8C] text-sm font-medium hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {nearbyProviders.map((provider) => (
                  <ProviderListCard
                    key={provider.id}
                    provider={provider}
                    linkTo={getProviderLink(provider)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
