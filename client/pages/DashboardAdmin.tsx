import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronsUpDown,
  MessageCircleQuestion,
  PackageOpen,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import AdminNavbar, { type AdminNavKey } from "@/components/AdminNavbar";
import { useAuth } from "@/context/AuthContext";
import {
  adminApi,
  type AdminReport,
  type AdminUser,
  type AdminVerifikasiItem,
  type AdminProvider,
  type AdminTransaction,
  type AdminLog,
  type AdminStats,
  type AdminChartData,
} from "@/lib/adminApi";
import { cn } from "@/lib/utils";

const ADMIN_VIEWS = [
  "dashboard",
  "manajemen-user",
  "manajemen-provider",
  "manajemen-transaksi",
  "manajemen-laporan",
  "manajemen-konten",
  "log-aktivitas",
] as const satisfies readonly AdminNavKey[];

function getAdminView(view: string | null): AdminNavKey {
  if (view && ADMIN_VIEWS.includes(view as AdminNavKey)) return view as AdminNavKey;
  return "dashboard";
}

function formatRupiah(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(1)} Jt`;
  if (num >= 1_000) return `Rp${(num / 1_000).toFixed(0)} Rb`;
  return `Rp${num.toLocaleString("id-ID")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function categoryLabel(cat: string): string {
  if (cat === "temenin") return "Jasa Temenin";
  if (cat === "curhat") return "Jasa Curhat";
  if (cat === "bantu_aktivitas") return "Jasa Bantu";
  return cat;
}

// ── Shared UI helpers ──────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-5 text-center text-2xl font-medium text-[#4C1D95] sm:text-3xl">
      {children}
    </h1>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-base font-semibold text-[#4C1D95]">{children}</h2>
  );
}

function SearchField({ placeholder = "Cari..." }: { placeholder?: string }) {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BDBDBD]" />
      <input
        type="search"
        placeholder={placeholder}
        className="h-9 w-full rounded-full border border-[#B794FF] bg-[#FFFCF9] pl-9 pr-4 text-sm text-[#2C1810] outline-none placeholder:text-[#C7C7C7] focus:border-[#7C3AED]"
      />
    </div>
  );
}

function ActionButton({
  label,
  variant = "danger",
  disabled,
  onClick,
}: {
  label: string;
  variant?: "danger" | "success";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-0.5 text-xs font-semibold border transition-colors disabled:opacity-50",
        variant === "danger"
          ? "border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FCA5A5]/30"
          : "border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A] hover:bg-[#86EFAC]/30",
      )}
    >
      {label}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 text-[#94A3B8]">
      Memuat data...
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-[#DC2626]">
      {message}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-[#94A3B8] text-sm">
      {text}
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "success";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#E9D5FF] bg-white px-6 py-7 shadow-2xl">
        <h3 className="mb-2 text-base font-bold text-[#111111]">{title}</h3>
        <p className="mb-6 text-sm text-[#64748B]">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#DDD6FE] bg-white px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F5F3FF]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors",
              confirmVariant === "danger"
                ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                : "bg-[#16A34A] hover:bg-[#15803D]",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#7C3AED] bg-[#FFFCF9] p-3 overflow-x-auto">
      {children}
    </div>
  );
}

function Th({ children, center }: { children?: React.ReactNode; center?: boolean }) {
  return (
    <th className={cn("px-4 py-1.5 font-normal whitespace-nowrap", center ? "text-center" : "text-left")}>
      {children}
    </th>
  );
}

function Td({ children, center }: { children?: React.ReactNode; center?: boolean }) {
  return (
    <td className={cn("px-4 py-3 text-sm text-[#64748B]", center && "text-center")}>
      {children}
    </td>
  );
}

// ── Modals ────────────────────────────────────────────────────

function BroadcastModal({
  isOpen, showSuccess, onClose, onSubmit, onDismissSuccess,
}: {
  isOpen: boolean; showSuccess: boolean;
  onClose: () => void; onSubmit: () => void; onDismissSuccess: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[1px]" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-[610px] rounded-[24px] border border-[#EC2D8F] bg-white px-6 py-8 shadow-2xl sm:px-11">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-[#EC2D8F] hover:text-[#BE185D]"><X className="h-7 w-7" /></button>
        <h2 className="mb-6 text-center text-lg font-bold text-[#EC2D8F]">Broadcast</h2>
        {showSuccess && (
          <div className="relative mb-3 flex min-h-[50px] items-center justify-center rounded-lg border border-[#EC2D8F] bg-white px-8 text-center text-[#EC2D8F]">
            <p>Broadcast berhasil dibuat</p>
            <button type="button" onClick={onDismissSuccess} className="absolute right-3 top-2 text-[#EC2D8F]"><X className="h-4 w-4" /></button>
          </div>
        )}
        <div className="mx-auto max-w-[510px]">
          <label htmlFor="broadcast-message" className="mb-2 block text-[#111111]">Buat Broadcast</label>
          <textarea id="broadcast-message" placeholder="Tulis pesan..." className="h-32 w-full resize-none rounded-lg bg-[#F8F1ED] px-4 py-3 text-sm text-[#2C1810] outline-none focus:ring-1 focus:ring-[#EC2D8F]" />
        </div>
        <div className="mt-5 flex justify-center">
          <button type="button" onClick={onSubmit} className="h-10 w-full max-w-[235px] rounded-lg border border-[#EC2D8F] bg-[#F8F1E8] font-bold text-[#EC2D8F] hover:bg-[#FDE7F3]">Kirim</button>
        </div>
      </div>
    </div>
  );
}

function FaqModal({
  isOpen, showSuccess, onClose, onSubmit, onDismissSuccess,
}: {
  isOpen: boolean; showSuccess: boolean;
  onClose: () => void; onSubmit: () => void; onDismissSuccess: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[1px]" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-[720px] rounded-[24px] border border-[#EC2D8F] bg-white px-5 py-8 shadow-2xl sm:px-10">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-[#EC2D8F] hover:text-[#BE185D]"><X className="h-7 w-7" /></button>
        <h2 className="mb-5 text-center text-2xl font-bold text-[#EC2D8F]">Kelola FAQ</h2>
        <div className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-[#111111]">Tambah FAQ</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Pertanyaan" className="h-10 w-full rounded-lg bg-[#F8F1ED] px-4 text-sm outline-none focus:ring-1 focus:ring-[#EC2D8F]" />
            <input type="text" placeholder="Jawaban" className="h-10 w-full rounded-lg bg-[#F8F1ED] px-4 text-sm outline-none focus:ring-1 focus:ring-[#EC2D8F]" />
          </div>
          <div className="mt-5 flex justify-center">
            <button type="button" onClick={onSubmit} className="h-10 w-full max-w-[240px] rounded-lg border border-[#EC2D8F] bg-[#F8F1E8] font-bold text-[#EC2D8F] hover:bg-[#FDE7F3]">Tambah</button>
          </div>
        </div>
        {showSuccess && (
          <div className="absolute left-1/2 top-1/2 z-10 w-[min(90%,400px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[#EC2D8F] bg-white px-6 py-4 text-center text-[#EC2D8F] shadow-xl">
            <button type="button" onClick={onDismissSuccess} className="absolute right-3 top-2"><X className="h-4 w-4" /></button>
            <p>FAQ sudah ditambahkan</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── A01 Dashboard ────────────────────────────────────────────

function DashboardView() {
  const [chartTab, setChartTab] = useState<"users" | "bookings" | "revenue">("users");

  const { data: stats, isLoading: loadingStats, isError: errorStats } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  const { data: charts, isLoading: loadingCharts } = useQuery<AdminChartData>({
    queryKey: ["admin-charts"],
    queryFn: adminApi.getCharts,
  });

  const statCards = stats
    ? [
        {
          label: "Total Pengguna",
          value: stats.totalPengguna.toLocaleString("id-ID"),
          up: true,
          hint: "Lihat semua pengguna →",
          to: "/dashboard-admin?view=manajemen-user",
        },
        {
          label: "Total Transaksi",
          value: stats.totalTransaksi.toLocaleString("id-ID"),
          up: true,
          hint: "Lihat semua transaksi →",
          to: "/dashboard-admin?view=manajemen-transaksi",
        },
        {
          label: "Total Pendapatan",
          value: formatRupiah(stats.totalPendapatan),
          up: true,
          hint: "Lihat transaksi selesai →",
          to: "/dashboard-admin?view=manajemen-transaksi",
        },
        {
          label: "Laporan Aktif",
          value: stats.laporanAktif.toLocaleString("id-ID"),
          up: false,
          hint: "Lihat semua laporan →",
          to: "/dashboard-admin?view=manajemen-laporan",
        },
      ]
    : [];

  const chartData = charts
    ? chartTab === "users"
      ? charts.monthlyUsers
      : chartTab === "bookings"
      ? charts.monthlyBookings
      : charts.monthlyRevenue
    : [];

  const chartLabel = chartTab === "users" ? "Pengguna Baru" : chartTab === "bookings" ? "Transaksi" : "Pendapatan";

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      {loadingStats ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F3E8FF]" />
          ))}
        </div>
      ) : errorStats ? (
        <ErrorState message="Gagal memuat statistik." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {statCards.map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              className="group rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm transition-all hover:border-[#7C3AED] hover:shadow-md hover:-translate-y-0.5"
            >
              <p className="text-[#64748B] text-sm font-medium mb-2">{stat.label}</p>
              <div className="flex items-end justify-between gap-3">
                <p className="text-[#2C1810] font-bold text-3xl">{stat.value}</p>
                {stat.up ? (
                  <TrendingUp className="w-5 h-5 text-[#16A34A]" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-[#DC2626]" />
                )}
              </div>
              <p className="mt-2 text-[10px] text-[#C4B5FD] opacity-0 group-hover:opacity-100 transition-opacity">
                {stat.hint}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">
        {/* Chart 1: Trafik bulanan (tab) */}
        <div className="rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm">
          <h2 className="text-[#2C1810] font-bold text-base mb-3">Trafik Bulanan</h2>
          <div className="flex gap-3 mb-4 border-b border-[#F3E8FF] pb-3">
            {(["users", "bookings", "revenue"] as const).map((tab) => {
              const labels = { users: "Pengguna", bookings: "Transaksi", revenue: "Pendapatan" };
              return (
                <button key={tab} type="button" onClick={() => setChartTab(tab)}
                  className={cn("text-xs font-medium pb-1 border-b-2 transition-colors",
                    chartTab === tab ? "text-[#7C3AED] border-[#7C3AED]" : "text-[#94A3B8] border-transparent hover:text-[#64748B]")}>
                  {labels[tab]}
                </button>
              );
            })}
          </div>
          {loadingCharts ? (
            <div className="h-[200px] animate-pulse rounded-lg bg-[#F3E8FF]" />
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                  <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number) => [chartTab === "revenue" ? formatRupiah(v) : v, chartLabel]} />
                  <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={{ fill: "#7C3AED", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Distribusi jasa (bar) */}
        <div className="rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm">
          <h2 className="text-[#2C1810] font-bold text-base mb-4">Transaksi per Jasa</h2>
          {loadingCharts ? (
            <div className="h-[230px] animate-pulse rounded-lg bg-[#F3E8FF]" />
          ) : (
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.byCategory ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                  <XAxis dataKey="category" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number) => [v, "Transaksi"]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#E9D5FF" activeBar={{ fill: "#7C3AED" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 3: Pendapatan bulanan */}
        <div className="rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm">
          <h2 className="text-[#2C1810] font-bold text-base mb-4">Pendapatan Bulanan</h2>
          {loadingCharts ? (
            <div className="h-[230px] animate-pulse rounded-lg bg-[#F3E8FF]" />
          ) : (
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.monthlyRevenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                  <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number) => [formatRupiah(v), "Pendapatan"]} />
                  <Line type="monotone" dataKey="value" stroke="#EC4899" strokeWidth={2} dot={{ fill: "#EC4899", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── A02 Manajemen User (pengguna only) ────────────────────────

function ManajemenUserView() {
  const qc = useQueryClient();
  const { data: users, isLoading, isError } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: adminApi.getUsers,
  });

  const banMut = useMutation({
    mutationFn: adminApi.banUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const unbanMut = useMutation({
    mutationFn: adminApi.unbanUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="space-y-5">
      <SectionTitle>Manajemen User</SectionTitle>
      <SearchField placeholder="Cari pengguna..." />
      {isLoading ? <LoadingState /> : isError ? <ErrorState message="Gagal memuat user." /> : (users?.length ?? 0) === 0 ? (
        <EmptyState text="Belum ada pengguna terdaftar." />
      ) : (
        <TableWrap>
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="bg-[#F0E9FF] text-[#111111]">
                <Th><span className="inline-flex items-center gap-1">Nama <ChevronsUpDown className="h-3.5 w-3.5" /></span></Th>
                <Th>Email</Th>
                <Th>Tgl Daftar</Th>
                <Th center>Pelanggaran</Th>
                <Th center>Status</Th>
                <Th center>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {users!.map((u) => {
                const isSuspended = u.suspended_until && new Date(u.suspended_until) > new Date();
                const statusLabel = u.is_banned ? "Diblokir" : isSuspended ? "Suspend" : "Aktif";
                const statusStyle = u.is_banned || isSuspended
                  ? "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                  : "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]";
                const busy = banMut.isPending || unbanMut.isPending;
                return (
                  <tr key={u.id} className="border-b border-[#F3E8FF] last:border-0">
                    <td className="px-4 py-3 text-[#111111] font-medium">{u.full_name}</td>
                    <Td>{u.email}</Td>
                    <Td>{formatDate(u.created_at)}</Td>
                    <Td center>{u.violation_count}</Td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs", statusStyle)}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.is_banned ? (
                        <ActionButton label="Aktifkan" variant="success" disabled={busy} onClick={() => unbanMut.mutate(u.id)} />
                      ) : (
                        <ActionButton label="Blokir" variant="danger" disabled={busy} onClick={() => banMut.mutate(u.id)} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  );
}

// ── A03+A04 Manajemen Provider (verifikasi + daftar) ──────────

function ManajemenProviderView() {
  const qc = useQueryClient();

  const { data: queue, isLoading: loadingQueue, isError: errorQueue } = useQuery<AdminVerifikasiItem[]>({
    queryKey: ["admin-verifikasi"],
    queryFn: adminApi.getPendingVerification,
  });

  const { data: providers, isLoading: loadingProviders, isError: errorProviders } = useQuery<AdminProvider[]>({
    queryKey: ["admin-providers"],
    queryFn: adminApi.getProviders,
  });

  const verifyMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      adminApi.verifyProvider(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-verifikasi"] });
      qc.invalidateQueries({ queryKey: ["admin-providers"] });
    },
  });

  const suspendMut = useMutation({
    mutationFn: adminApi.suspendProvider,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-providers"] }),
  });
  const activateMut = useMutation({
    mutationFn: adminApi.activateProvider,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-providers"] }),
  });

  // confirmation state: simpan provider yang akan diaktifkan
  const [confirmActivate, setConfirmActivate] = useState<AdminProvider | null>(null);

  const admittedProviders = (providers ?? []).filter(
    (p) => p.verification_status === "verified",
  );

  const accountBadge = (p: AdminProvider) => {
    const isSuspended = p.suspended_until && new Date(p.suspended_until) > new Date();
    if (p.is_banned) return { label: "Diblokir", style: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]" };
    if (isSuspended) return { label: "Suspend", style: "bg-[#FFEDD5] text-[#EA580C] border-[#FED7AA]" };
    return { label: "Aktif", style: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]" };
  };

  const verStatusStyle = (s: string) =>
    s === "verified"
      ? "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]"
      : s === "rejected"
      ? "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
      : "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]";

  return (
    <div className="space-y-8">
      <SectionTitle>Manajemen Provider</SectionTitle>

      {/* Tabel atas: antrian verifikasi */}
      <section>
        <SubTitle>Antrian Verifikasi Provider</SubTitle>
        {loadingQueue ? (
          <LoadingState />
        ) : errorQueue ? (
          <ErrorState message="Gagal memuat antrian verifikasi." />
        ) : (queue?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-[#DDD6FE] bg-[#F8F5FF] py-8 text-center text-sm text-[#94A3B8]">
            Tidak ada antrian verifikasi saat ini.
          </div>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-[#F0E9FF] text-[#111111]">
                  <Th>Nama Provider</Th>
                  <Th>Email</Th>
                  <Th center>Tgl Daftar</Th>
                  <Th center>KTP</Th>
                  <Th center>Selfie</Th>
                  <Th center>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {queue!.map((item: AdminVerifikasiItem) => {
                  const busy = verifyMut.isPending;
                  return (
                    <tr key={item.id} className="border-b border-[#F3E8FF] last:border-0">
                      <td className="px-4 py-3 text-[#111111] font-medium">{item.full_name}</td>
                      <Td>{item.email}</Td>
                      <Td center>{formatDate(item.created_at)}</Td>
                      <td className="px-4 py-3 text-center">
                        {item.ktp_url ? (
                          <a href={item.ktp_url} target="_blank" rel="noreferrer"
                            className="text-xs text-[#7C3AED] underline">Lihat KTP</a>
                        ) : (
                          <span className="text-xs text-[#94A3B8]">Belum ada</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.selfie_url ? (
                          <a href={item.selfie_url} target="_blank" rel="noreferrer"
                            className="text-xs text-[#7C3AED] underline">Lihat Selfie</a>
                        ) : (
                          <span className="text-xs text-[#94A3B8]">Belum ada</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <ActionButton label="Verifikasi" variant="success" disabled={busy}
                            onClick={() => verifyMut.mutate({ id: item.id, action: "approve" })} />
                          <ActionButton label="Tolak" variant="danger" disabled={busy}
                            onClick={() => verifyMut.mutate({ id: item.id, action: "reject" })} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </section>

      {/* Tabel bawah: provider yang sudah diverifikasi */}
      <section>
        <SubTitle>Provider Terverifikasi</SubTitle>
        <SearchField placeholder="Cari provider..." />
        {loadingProviders ? (
          <LoadingState />
        ) : errorProviders ? (
          <ErrorState message="Gagal memuat daftar provider." />
        ) : admittedProviders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#DDD6FE] bg-[#F8F5FF] py-8 text-center text-sm text-[#94A3B8]">
            Belum ada provider yang terverifikasi.
          </div>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-[#F0E9FF] text-[#111111]">
                  <Th>Nama Provider</Th>
                  <Th>Email</Th>
                  <Th center>Rating</Th>
                  <Th center>Pesanan</Th>
                  <Th center>Status Akun</Th>
                  <Th center>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {admittedProviders.map((p: AdminProvider) => {
                  const isSuspended = p.suspended_until && new Date(p.suspended_until) > new Date();
                  const badge = accountBadge(p);
                  const isRestricted = p.is_banned || isSuspended;
                  const busy = suspendMut.isPending || activateMut.isPending;
                  return (
                    <tr key={p.id} className="border-b border-[#F3E8FF] last:border-0">
                      <td className="px-4 py-3 text-[#111111] font-medium">{p.full_name}</td>
                      <Td>{p.email}</Td>
                      <Td center>{p.avg_rating > 0 ? Number(p.avg_rating).toFixed(2) : "-"}</Td>
                      <Td center>{p.total_bookings}</Td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", badge.style)}>
                            {badge.label}
                          </span>
                          {isSuspended && p.suspended_until && (
                            <span className="text-[10px] text-[#94A3B8]">
                              s/d {formatDate(p.suspended_until)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isRestricted ? (
                          <ActionButton label="Aktifkan" variant="success" disabled={busy}
                            onClick={() => setConfirmActivate(p)} />
                        ) : (
                          <ActionButton label="Suspend" variant="danger" disabled={busy}
                            onClick={() => suspendMut.mutate(p.id)} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}

        {/* Provider rejected / belum diverifikasi — info singkat */}
        {(providers ?? []).some(p => p.verification_status !== "verified") && (
          <div className="mt-4">
            <p className="text-xs text-[#94A3B8] mb-2">Provider lainnya (belum/ditolak verifikasi)</p>
            <TableWrap>
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="bg-[#F9F5FF] text-[#111111]">
                    <Th>Nama Provider</Th>
                    <Th>Email</Th>
                    <Th center>Status Verifikasi</Th>
                    <Th center>Tgl Daftar</Th>
                  </tr>
                </thead>
                <tbody>
                  {(providers ?? [])
                    .filter(p => p.verification_status !== "verified")
                    .map((p: AdminProvider) => (
                      <tr key={p.id} className="border-b border-[#F3E8FF] last:border-0">
                        <td className="px-4 py-3 text-[#111111] font-medium">{p.full_name}</td>
                        <Td>{p.email}</Td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs", verStatusStyle(p.verification_status))}>
                            {p.verification_status === "rejected" ? "Ditolak" : "Menunggu"}
                          </span>
                        </td>
                        <Td center>-</Td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </TableWrap>
          </div>
        )}
      </section>

      {/* Confirmation modal — aktifkan provider */}
      {confirmActivate && (
        <ConfirmModal
          title="Aktifkan Provider?"
          message={`Akun ${confirmActivate.full_name} (${confirmActivate.email}) akan diaktifkan kembali. Semua pembatasan suspend/blokir akan dihapus.`}
          confirmLabel="Ya, Aktifkan"
          confirmVariant="success"
          onCancel={() => setConfirmActivate(null)}
          onConfirm={() => {
            activateMut.mutate(confirmActivate.id);
            setConfirmActivate(null);
          }}
        />
      )}
    </div>
  );
}

// ── A05 Manajemen Transaksi ───────────────────────────────────

const txStatusStyle = (status: string) => {
  if (status === "completed") return "bg-[#DCFCE7] text-[#16A34A]";
  if (status === "confirmed" || status === "in_progress") return "bg-[#EDE9FE] text-[#7C3AED]";
  if (status === "cancelled" || status === "auto_cancelled") return "bg-[#F3F4F6] text-[#6B7280]";
  return "bg-[#FEF3C7] text-[#D97706]";
};
const txStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    waiting_confirmation: "Menunggu", confirmed: "Dikonfirmasi",
    in_progress: "Berlangsung", completed: "Selesai",
    cancelled: "Dibatalkan", auto_cancelled: "Batal Otomatis",
  };
  return map[status] ?? status;
};
const payStatusLabel = (s: string | null) => {
  if (!s) return "-";
  const map: Record<string, string> = {
    pending: "Menunggu", paid: "Terbayar", refunded: "Refund", failed: "Gagal", expired: "Kedaluwarsa",
  };
  return map[s] ?? s;
};

function TransaksiDetailModal({
  tx,
  onClose,
  onRefund,
  refundPending,
}: {
  tx: AdminTransaction;
  onClose: () => void;
  onRefund: (id: string) => void;
  refundPending: boolean;
}) {
  const canRefund =
    tx.payment_status === "paid" &&
    tx.status !== "cancelled" &&
    tx.status !== "auto_cancelled";

  const rows: [string, string][] = [
    ["ID Transaksi", tx.id.slice(0, 8) + "…"],
    ["Provider", tx.provider_name],
    ["Pengguna", tx.user_name],
    ["Jasa", categoryLabel(tx.service_category)],
    ["Tanggal Sesi", formatDate(tx.session_date)],
    ["Tgl Dibuat", formatDateTime(tx.created_at)],
    ["Total Dibayar", formatRupiah(tx.total_price)],
    ["Pendapatan Platform", formatRupiah(tx.platform_fee)],
    ["Status Booking", txStatusLabel(tx.status)],
    ["Status Pembayaran", payStatusLabel(tx.payment_status)],
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[560px] rounded-2xl border border-[#7C3AED] bg-white px-6 py-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#7C3AED] hover:text-[#4C1D95]"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-5 text-center text-base font-bold text-[#4C1D95]">Detail Transaksi</h2>
        <div className="space-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[160px_8px_1fr] items-start gap-1">
              <span className="text-[#64748B]">{label}</span>
              <span className="text-[#64748B]">:</span>
              <span
                className={cn(
                  "font-medium text-[#111111]",
                  label === "Pendapatan Platform" && "text-[#7C3AED]",
                )}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
        {canRefund && (
          <div className="mt-5 flex justify-center">
            <ActionButton
              label={refundPending ? "Memproses…" : "Proses Refund"}
              variant="danger"
              disabled={refundPending}
              onClick={() => onRefund(tx.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function exportTransaksiPdf(
  rows: AdminTransaction[],
  month: string,
  type: string,
) {
  const now = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const monthLabel = month === "all" ? "Semua Bulan" : month;
  const typeLabel = type === "all" ? "Semua Jasa" : categoryLabel(type);

  const totalFee = rows.reduce((s, tx) => s + parseFloat(tx.platform_fee), 0);
  const totalNominal = rows.reduce((s, tx) => s + parseFloat(tx.total_price), 0);

  const bodyRows = rows
    .map(
      (tx, i) => `<tr>
        <td>${i + 1}</td>
        <td>${tx.provider_name}</td>
        <td>${tx.user_name}</td>
        <td>${categoryLabel(tx.service_category)}</td>
        <td>${new Date(tx.session_date).toLocaleDateString("id-ID")}</td>
        <td style="text-align:right">Rp${parseFloat(tx.total_price).toLocaleString("id-ID")}</td>
        <td style="text-align:right;color:#4C1D95;font-weight:600">Rp${parseFloat(tx.platform_fee).toLocaleString("id-ID")}</td>
        <td>${txStatusLabel(tx.status)}</td>
        <td>${payStatusLabel(tx.payment_status)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="id"><head>
    <meta charset="UTF-8"/>
    <title>Laporan Transaksi — ${monthLabel}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:28px}
      h1{font-size:16px;color:#4C1D95;margin-bottom:3px}
      .meta{font-size:10px;color:#64748B;margin-bottom:16px}
      .summary{display:flex;gap:24px;margin-bottom:16px}
      .card{background:#F5F3FF;border:1px solid #DDD6FE;border-radius:8px;padding:10px 16px}
      .card p{font-size:10px;color:#7C3AED;margin-bottom:2px}
      .card b{font-size:14px;color:#4C1D95}
      table{width:100%;border-collapse:collapse}
      th{background:#F0E9FF;padding:7px 8px;text-align:left;font-size:10px;border:1px solid #DDD6FE}
      td{padding:6px 8px;border:1px solid #E9D5FF;font-size:10px}
      tr:nth-child(even) td{background:#FAFAFE}
      tfoot td{background:#F0E9FF;font-weight:700;color:#4C1D95}
      @media print{body{padding:14px}}
    </style>
  </head><body>
    <h1>Laporan Transaksi Bulanan</h1>
    <p class="meta">Periode: ${monthLabel} &nbsp;|&nbsp; Jasa: ${typeLabel} &nbsp;|&nbsp; Dicetak: ${now}</p>
    <div class="summary">
      <div class="card"><p>Total Transaksi</p><b>${rows.length}</b></div>
      <div class="card"><p>Total Nominal</p><b>Rp${totalNominal.toLocaleString("id-ID")}</b></div>
      <div class="card"><p>Pendapatan Platform</p><b>Rp${totalFee.toLocaleString("id-ID")}</b></div>
    </div>
    <table>
      <thead><tr>
        <th>#</th><th>Provider</th><th>Pengguna</th><th>Jasa</th>
        <th>Tgl Sesi</th><th style="text-align:right">Total Dibayar</th>
        <th style="text-align:right">Fee Platform</th><th>Status</th><th>Bayar</th>
      </tr></thead>
      <tbody>${bodyRows}</tbody>
      <tfoot><tr>
        <td colspan="5" style="text-align:right">TOTAL</td>
        <td style="text-align:right">Rp${totalNominal.toLocaleString("id-ID")}</td>
        <td style="text-align:right">Rp${totalFee.toLocaleString("id-ID")}</td>
        <td colspan="2"></td>
      </tr></tfoot>
    </table>
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

const JASA_OPTIONS = [
  { value: "all", label: "Semua Jasa" },
  { value: "temenin", label: "Jasa Temenin" },
  { value: "curhat", label: "Jasa Curhat" },
  { value: "bantu_aktivitas", label: "Jasa Bantu" },
] as const;

function ManajemenTransaksiView() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<AdminTransaction | null>(null);
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const { data: transactions, isLoading, isError } = useQuery<AdminTransaction[]>({
    queryKey: ["admin-transactions"],
    queryFn: adminApi.getTransactions,
  });

  const refundMut = useMutation({
    mutationFn: adminApi.refundTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
      setSelected(null);
    },
  });

  // daftar bulan unik dari data
  const availableMonths = useMemo(() => {
    if (!transactions) return [];
    const seen = new Set<string>();
    transactions.forEach((tx) => {
      const key = new Date(tx.created_at).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      seen.add(key);
    });
    return Array.from(seen);
  }, [transactions]);

  // data tabel bawah (filtered)
  const filteredTx = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((tx) => {
      const monthKey = new Date(tx.created_at).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      const monthOk = filterMonth === "all" || monthKey === filterMonth;
      const typeOk = filterType === "all" || tx.service_category === filterType;
      return monthOk && typeOk;
    });
  }, [transactions, filterMonth, filterType]);

  return (
    <div className="space-y-8">
      <SectionTitle>Manajemen Transaksi</SectionTitle>

      {/* ── Tabel semua transaksi (klik untuk detail) ── */}
      <section>
        <SubTitle>Semua Transaksi</SubTitle>
        <SearchField placeholder="Cari transaksi..." />
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message="Gagal memuat transaksi." />
        ) : (transactions?.length ?? 0) === 0 ? (
          <EmptyState text="Belum ada transaksi." />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-[#F0E9FF] text-[#111111]">
                  <Th>Provider</Th>
                  <Th>Pengguna</Th>
                  <Th>Jasa</Th>
                  <Th center>Tanggal</Th>
                  <Th center>Pendapatan Platform</Th>
                  <Th center>Status Booking</Th>
                  <Th center>Status Bayar</Th>
                </tr>
              </thead>
              <tbody>
                {transactions!.map((tx: AdminTransaction) => (
                  <tr
                    key={tx.id}
                    tabIndex={0}
                    onClick={() => setSelected(tx)}
                    onKeyDown={(e) => { if (e.key === "Enter") setSelected(tx); }}
                    className="cursor-pointer border-b border-[#F3E8FF] last:border-0 hover:bg-[#F8F5FF] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#111111] font-medium">{tx.provider_name}</td>
                    <Td>{tx.user_name}</Td>
                    <Td>{categoryLabel(tx.service_category)}</Td>
                    <Td center>{formatDate(tx.session_date)}</Td>
                    <td className="px-4 py-3 text-center font-semibold text-[#7C3AED]">
                      {formatRupiah(tx.platform_fee)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold", txStatusStyle(tx.status))}>
                        {txStatusLabel(tx.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-[#64748B]">{payStatusLabel(tx.payment_status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </section>

      {/* ── Laporan transaksi (filter + export PDF) ── */}
      <section>
        <SubTitle>Laporan Transaksi</SubTitle>

        {/* toolbar filter */}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {/* filter bulan */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="h-9 rounded-lg border border-[#DDD6FE] bg-white px-3 text-sm text-[#111111] outline-none focus:border-[#7C3AED]"
          >
            <option value="all">Semua Bulan</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* filter jenis */}
          <div className="flex rounded-lg border border-[#DDD6FE] overflow-hidden">
            {JASA_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterType(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  filterType === opt.value
                    ? "bg-[#7C3AED] text-white"
                    : "bg-white text-[#64748B] hover:bg-[#F5F3FF]",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs text-[#94A3B8]">
            <span>{filteredTx.length} transaksi</span>
            <span>·</span>
            <span className="font-semibold text-[#7C3AED]">
              Fee: {formatRupiah(filteredTx.reduce((s, tx) => s + parseFloat(tx.platform_fee), 0))}
            </span>
          </div>

          {/* export PDF */}
          <button
            type="button"
            disabled={filteredTx.length === 0}
            onClick={() => exportTransaksiPdf(filteredTx, filterMonth, filterType)}
            className="flex items-center gap-2 rounded-lg border border-[#7C3AED] bg-white px-4 py-1.5 text-sm font-medium text-[#7C3AED] transition-colors hover:bg-[#EDE9FE] disabled:opacity-40"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export PDF
          </button>
        </div>

        {/* tabel filtered */}
        {isLoading ? (
          <LoadingState />
        ) : filteredTx.length === 0 ? (
          <EmptyState text="Tidak ada transaksi untuk filter ini." />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-[#F0E9FF] text-[#111111]">
                  <Th>Provider</Th>
                  <Th>Pengguna</Th>
                  <Th>Jasa</Th>
                  <Th center>Tanggal</Th>
                  <Th center>Total Dibayar</Th>
                  <Th center>Pendapatan Platform</Th>
                  <Th center>Status</Th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr
                    key={tx.id}
                    tabIndex={0}
                    onClick={() => setSelected(tx)}
                    onKeyDown={(e) => { if (e.key === "Enter") setSelected(tx); }}
                    className="cursor-pointer border-b border-[#F3E8FF] last:border-0 hover:bg-[#F8F5FF] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#111111] font-medium">{tx.provider_name}</td>
                    <Td>{tx.user_name}</Td>
                    <Td>{categoryLabel(tx.service_category)}</Td>
                    <Td center>{formatDate(tx.session_date)}</Td>
                    <td className="px-4 py-3 text-center text-[#111111]">{formatRupiah(tx.total_price)}</td>
                    <td className="px-4 py-3 text-center font-semibold text-[#7C3AED]">{formatRupiah(tx.platform_fee)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold", txStatusStyle(tx.status))}>
                        {txStatusLabel(tx.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* ringkasan bawah */}
              <tfoot>
                <tr className="bg-[#F8F5FF]">
                  <td colSpan={4} className="px-4 py-2 text-right text-xs font-semibold text-[#64748B]">Total</td>
                  <td className="px-4 py-2 text-center text-xs font-bold text-[#111111]">
                    {formatRupiah(filteredTx.reduce((s, tx) => s + parseFloat(tx.total_price), 0))}
                  </td>
                  <td className="px-4 py-2 text-center text-xs font-bold text-[#7C3AED]">
                    {formatRupiah(filteredTx.reduce((s, tx) => s + parseFloat(tx.platform_fee), 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </TableWrap>
        )}
      </section>

      {selected && (
        <TransaksiDetailModal
          tx={selected}
          onClose={() => setSelected(null)}
          onRefund={(id) => refundMut.mutate(id)}
          refundPending={refundMut.isPending}
        />
      )}
    </div>
  );
}

// ── A06 Manajemen Laporan ─────────────────────────────────────

const actionLabel = (a: string) => {
  if (a === "warning") return "Peringatan";
  if (a === "suspension") return "Suspensi";
  if (a === "permanent_ban") return "Ban Permanen";
  return a;
};
const actionStyle = (a: string) => {
  if (a === "warning") return "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]";
  if (a === "suspension") return "bg-[#FFEDD5] text-[#EA580C] border-[#FED7AA]";
  return "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]";
};

function exportLaporanPdf(
  mode: "transaksi" | "bulan",
  reports: AdminReport[],
) {
  const now = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  let bodyHtml = "";

  if (mode === "transaksi") {
    const rows = reports
      .map(
        (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.reporter_name}<br/><small>${r.reporter_email}</small></td>
          <td>${r.provider_name}<br/><small>${r.provider_email}</small></td>
          <td>${r.reason ?? "-"}</td>
          <td>${actionLabel(r.action_taken)}</td>
          <td>${new Date(r.created_at).toLocaleDateString("id-ID")}</td>
        </tr>`,
      )
      .join("");

    bodyHtml = `
      <table>
        <thead>
          <tr>
            <th>#</th><th>Pelapor</th><th>Provider Dilaporkan</th>
            <th>Alasan</th><th>Tindakan</th><th>Tanggal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  } else {
    const grouped: Record<string, AdminReport[]> = {};
    reports.forEach((r) => {
      const key = new Date(r.created_at).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    const rows = Object.entries(grouped)
      .map(
        ([month, items]) => `
        <tr>
          <td>${month}</td>
          <td>${items.length}</td>
          <td>${items.filter((r) => r.action_taken === "warning").length}</td>
          <td>${items.filter((r) => r.action_taken === "suspension").length}</td>
          <td>${items.filter((r) => r.action_taken === "permanent_ban").length}</td>
        </tr>`,
      )
      .join("");

    bodyHtml = `
      <table>
        <thead>
          <tr>
            <th>Bulan</th><th>Total Laporan</th>
            <th>Peringatan</th><th>Suspensi</th><th>Ban Permanen</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  const modeLabel = mode === "transaksi" ? "Per Transaksi" : "Per Bulan";

  const html = `<!DOCTYPE html><html lang="id"><head>
    <meta charset="UTF-8"/>
    <title>Laporan Temenin — ${modeLabel}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
      h1 { font-size: 18px; margin-bottom: 4px; color: #4C1D95; }
      .meta { font-size: 11px; color: #64748B; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #F0E9FF; padding: 8px 10px; text-align: left; font-weight: 600; border: 1px solid #DDD6FE; }
      td { padding: 7px 10px; border: 1px solid #E9D5FF; vertical-align: top; }
      tr:nth-child(even) td { background: #FAFAFE; }
      small { color: #94A3B8; font-size: 10px; }
      @media print { body { padding: 16px; } }
    </style>
  </head><body>
    <h1>Laporan Manajemen — ${modeLabel}</h1>
    <p class="meta">Dicetak: ${now} &nbsp;|&nbsp; Total: ${
      mode === "transaksi"
        ? reports.length + " laporan"
        : Object.keys(
            reports.reduce<Record<string, boolean>>((acc, r) => {
              const k = new Date(r.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
              acc[k] = true;
              return acc;
            }, {}),
          ).length + " bulan"
    }</p>
    ${bodyHtml}
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

function ManajemenLaporanView() {
  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [mode, setMode] = useState<"transaksi" | "bulan">("transaksi");

  const { data: reports, isLoading, isError } = useQuery<AdminReport[]>({
    queryKey: ["admin-reports"],
    queryFn: adminApi.getReports,
  });

  // group per bulan
  const byMonth = (() => {
    if (!reports) return [];
    const grouped: Record<string, AdminReport[]> = {};
    reports.forEach((r) => {
      const key = new Date(r.created_at).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    return Object.entries(grouped).map(([month, items]) => ({
      month,
      total: items.length,
      warning: items.filter((r) => r.action_taken === "warning").length,
      suspension: items.filter((r) => r.action_taken === "suspension").length,
      permanent_ban: items.filter((r) => r.action_taken === "permanent_ban").length,
    }));
  })();

  return (
    <div className="space-y-5">
      <SectionTitle>Manajemen Laporan</SectionTitle>

      {/* toolbar: filter + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-[#DDD6FE] overflow-hidden">
          {(["transaksi", "bulan"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors",
                mode === m
                  ? "bg-[#7C3AED] text-white"
                  : "bg-white text-[#64748B] hover:bg-[#F5F3FF]",
              )}
            >
              Per {m === "transaksi" ? "Transaksi" : "Bulan"}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!reports || reports.length === 0}
          onClick={() => reports && exportLaporanPdf(mode, reports)}
          className="flex items-center gap-2 rounded-lg border border-[#7C3AED] bg-white px-4 py-1.5 text-sm font-medium text-[#7C3AED] transition-colors hover:bg-[#EDE9FE] disabled:opacity-40"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export PDF
        </button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message="Gagal memuat laporan." />
      ) : (reports?.length ?? 0) === 0 ? (
        <EmptyState text="Belum ada laporan masuk." />
      ) : mode === "transaksi" ? (
        /* ── Tabel per transaksi ── */
        <TableWrap>
          <table className="w-full min-w-[750px] text-sm">
            <thead>
              <tr className="bg-[#F0E9FF] text-[#111111]">
                <Th>Pelapor</Th>
                <Th>Provider Dilaporkan</Th>
                <Th>Alasan</Th>
                <Th center>Tindakan</Th>
                <Th center>Tanggal</Th>
                <Th center>Detail</Th>
              </tr>
            </thead>
            <tbody>
              {reports!.map((r: AdminReport) => (
                <tr
                  key={r.id}
                  tabIndex={0}
                  onClick={() => setSelected(r)}
                  onKeyDown={(e) => { if (e.key === "Enter") setSelected(r); }}
                  className="cursor-pointer border-b border-[#F3E8FF] last:border-0 hover:bg-[#F8F5FF] transition-colors"
                >
                  <td className="px-4 py-3 text-[#111111] font-medium">{r.reporter_name}</td>
                  <td className="px-4 py-3 text-[#111111]">{r.provider_name}</td>
                  <td className="px-4 py-3 text-[#64748B] max-w-[200px] truncate">{r.reason ?? "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs", actionStyle(r.action_taken))}>
                      {actionLabel(r.action_taken)}
                    </span>
                  </td>
                  <Td center>{formatDate(r.created_at)}</Td>
                  <td className="px-4 py-3 text-center text-xs text-[#7C3AED] hover:underline">Detail</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        /* ── Tabel per bulan ── */
        <TableWrap>
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-[#F0E9FF] text-[#111111]">
                <Th>Bulan</Th>
                <Th center>Total Laporan</Th>
                <Th center>Peringatan</Th>
                <Th center>Suspensi</Th>
                <Th center>Ban Permanen</Th>
              </tr>
            </thead>
            <tbody>
              {byMonth.map((row) => (
                <tr key={row.month} className="border-b border-[#F3E8FF] last:border-0">
                  <td className="px-4 py-3 text-[#111111] font-medium">{row.month}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#4C1D95]">{row.total}</td>
                  <td className="px-4 py-3 text-center">
                    {row.warning > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-2.5 py-0.5 text-xs text-[#D97706]">
                        {row.warning}
                      </span>
                    ) : <span className="text-[#CBD5E1]">0</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.suspension > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-[#FED7AA] bg-[#FFEDD5] px-2.5 py-0.5 text-xs text-[#EA580C]">
                        {row.suspension}
                      </span>
                    ) : <span className="text-[#CBD5E1]">0</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.permanent_ban > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-[#FECACA] bg-[#FEE2E2] px-2.5 py-0.5 text-xs text-[#DC2626]">
                        {row.permanent_ban}
                      </span>
                    ) : <span className="text-[#CBD5E1]">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {/* Modal detail laporan */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="relative w-full max-w-[560px] rounded-2xl border border-[#EC2D8F] bg-white px-6 py-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-[#EC2D8F] hover:text-[#BE185D]"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-5 text-center text-base font-bold text-[#EC2D8F]">Detail Laporan</h2>
            <div className="space-y-2.5 text-sm">
              {([
                ["Pelapor", `${selected.reporter_name} (${selected.reporter_email})`],
                ["Provider", `${selected.provider_name} (${selected.provider_email})`],
                ["Alasan", selected.reason ?? "-"],
                ["Tindakan", actionLabel(selected.action_taken)],
                ["Pelanggaran ke-", String(selected.violation_count)],
                ["Tanggal", formatDateTime(selected.created_at)],
                ...(selected.suspended_until
                  ? [["Suspend sampai", formatDate(selected.suspended_until)]]
                  : []),
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="grid grid-cols-[150px_8px_1fr] items-start gap-1">
                  <span className="text-[#64748B]">{label}</span>
                  <span className="text-[#64748B]">:</span>
                  <span className="font-medium text-[#111111]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── A07 Manajemen Konten ──────────────────────────────────────

function ManajemenKontenView({ onOpenBroadcast, onOpenFaq }: {
  onOpenBroadcast: () => void;
  onOpenFaq: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle>Manajemen Konten</SectionTitle>
      <section className="rounded-xl border border-[#E9D5FF] bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-[#4C1D95]">Notifikasi & Broadcast</h2>
        <button type="button" onClick={onOpenBroadcast}
          className="flex flex-col items-center gap-2 rounded-xl border border-[#E9D5FF] p-5 text-[#111111] transition-colors hover:border-[#7C3AED] hover:bg-[#F8F5FF]">
          <PackageOpen className="h-10 w-10 stroke-[2] text-[#7C3AED]" />
          <span className="text-sm font-bold">Broadcast</span>
        </button>
      </section>
      <section className="rounded-xl border border-[#E9D5FF] bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#4C1D95]">FAQ</h2>
        <button type="button" onClick={onOpenFaq}
          className="flex items-center gap-2 rounded-xl border border-[#DDD6FE] px-5 py-2.5 text-[#7C3AED] hover:bg-[#F8F5FF]">
          <MessageCircleQuestion className="h-5 w-5" />
          <span className="text-sm font-bold">Kelola FAQ</span>
        </button>
      </section>
      <section className="rounded-xl border border-[#E9D5FF] bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-[#4C1D95]">Kategori Jasa</h2>
        <div className="flex flex-wrap gap-2">
          {["Jasa Temenin", "Jasa Curhat", "Jasa Bantu Aktivitas"].map((cat) => (
            <span key={cat} className="rounded-full border border-[#DDD6FE] bg-[#EDE9FE] px-4 py-1.5 text-sm font-medium text-[#7C3AED]">
              {cat}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── A08 Log Aktivitas ─────────────────────────────────────────

function LogAktivitasView() {
  const { data: logs, isLoading, isError } = useQuery<AdminLog[]>({
    queryKey: ["admin-logs"],
    queryFn: adminApi.getLogs,
  });

  return (
    <div className="space-y-5">
      <SectionTitle>Log Aktivitas</SectionTitle>
      <SearchField placeholder="Cari log..." />
      {isLoading ? <LoadingState /> : isError ? <ErrorState message="Gagal memuat log." /> : (logs?.length ?? 0) === 0 ? (
        <EmptyState text="Belum ada log aktivitas admin." />
      ) : (
        <TableWrap>
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-[#F0E9FF] text-[#111111]">
                <Th>Admin</Th>
                <Th>Aksi</Th>
                <Th>Detail</Th>
                <Th center><span className="inline-flex items-center gap-1">Waktu <ChevronsUpDown className="h-3.5 w-3.5" /></span></Th>
              </tr>
            </thead>
            <tbody>
              {logs!.map((log: AdminLog) => (
                <tr key={log.id} className="border-b border-[#F3E8FF] last:border-0">
                  <td className="px-4 py-3 text-[#111111] font-medium">{log.admin_name}</td>
                  <Td>{log.action}</Td>
                  <Td>{log.details ?? log.target_type ?? "-"}</Td>
                  <Td center>{formatDateTime(log.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

const PAGE_TITLES: Record<AdminNavKey, string> = {
  dashboard: "Dashboard",
  "manajemen-user": "Manajemen User",
  "manajemen-provider": "Manajemen Provider",
  "manajemen-transaksi": "Manajemen Transaksi",
  "manajemen-laporan": "Manajemen Laporan",
  "manajemen-konten": "Manajemen Konten",
  "log-aktivitas": "Log Aktivitas",
};

export default function DashboardAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [showBroadcastSuccess, setShowBroadcastSuccess] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [showFaqSuccess, setShowFaqSuccess] = useState(false);
  const activePage = getAdminView(searchParams.get("view"));

  useEffect(() => {
    document.title = `${PAGE_TITLES[activePage]} — Temenin Admin`;
    return () => { document.title = "Temenin"; };
  }, [activePage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;
  if (user.role !== "admin") {
    return <Navigate to={user.role === "penyedia" ? "/dashboard-penyedia" : "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AdminNavbar activePage={activePage} />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
          {activePage === "manajemen-user" ? (
            <ManajemenUserView />
          ) : activePage === "manajemen-provider" ? (
            <ManajemenProviderView />
          ) : activePage === "manajemen-transaksi" ? (
            <ManajemenTransaksiView />
          ) : activePage === "manajemen-laporan" ? (
            <ManajemenLaporanView />
          ) : activePage === "manajemen-konten" ? (
            <ManajemenKontenView
              onOpenBroadcast={() => { setShowBroadcastSuccess(false); setIsBroadcastOpen(true); }}
              onOpenFaq={() => { setShowFaqSuccess(false); setIsFaqOpen(true); }}
            />
          ) : activePage === "log-aktivitas" ? (
            <LogAktivitasView />
          ) : (
            <DashboardView />
          )}
        </div>
      </main>

      <BroadcastModal
        isOpen={isBroadcastOpen}
        showSuccess={showBroadcastSuccess}
        onClose={() => { setIsBroadcastOpen(false); setShowBroadcastSuccess(false); }}
        onSubmit={() => setShowBroadcastSuccess(true)}
        onDismissSuccess={() => setShowBroadcastSuccess(false)}
      />
      <FaqModal
        isOpen={isFaqOpen}
        showSuccess={showFaqSuccess}
        onClose={() => { setIsFaqOpen(false); setShowFaqSuccess(false); }}
        onSubmit={() => setShowFaqSuccess(true)}
        onDismissSuccess={() => setShowFaqSuccess(false)}
      />
    </div>
  );
}
