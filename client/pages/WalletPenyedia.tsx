import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";
import ProviderNavbar from "@/components/ProviderNavbar";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/data/orders";
import { getStoredToken } from "@/lib/authApi";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WalletData {
  id: string;
  balance: string;
  total_earned: string;
  total_withdrawn: string;
}

interface TxRow {
  id: string;
  type: "credit" | "debit";
  amount: string;
  commission_amount: string | null;
  net_amount: string;
  description: string | null;
  created_at: string;
}

interface WithdrawalRow {
  id: string;
  amount: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
async function fetchWalletData(): Promise<{
  wallet: WalletData;
  transactions: TxRow[];
  withdrawals: WithdrawalRow[];
}> {
  const token = getStoredToken();
  const res = await fetch("/api/payments/wallet/transactions", {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Gagal memuat wallet.");
  }
  const data = await res.json();
  return data.data;
}

async function requestWithdrawal(input: {
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
}): Promise<void> {
  const token = getStoredToken();
  const res = await fetch("/api/payments/withdraw", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Gagal memproses penarikan.",
    );
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          accent,
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-[#94A3B8] text-xs font-medium">{label}</p>
        <p className="text-[#2C1810] font-bold text-lg leading-tight">{value}</p>
      </div>
    </div>
  );
}

function TxItem({ tx }: { tx: TxRow }) {
  const isCredit = tx.type === "credit";
  const date = new Date(tx.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
            isCredit
              ? "bg-[#DCFCE7] text-[#16A34A]"
              : "bg-[#FEE2E2] text-[#DC2626]",
          )}
        >
          {isCredit ? (
            <ArrowDownLeft className="w-4 h-4" />
          ) : (
            <ArrowUpRight className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[#2C1810] text-sm font-medium truncate">
            {tx.description ?? (isCredit ? "Pemasukan sesi" : "Penarikan dana")}
          </p>
          {isCredit && tx.commission_amount && parseFloat(tx.commission_amount) > 0 && (
            <p className="text-[#94A3B8] text-xs">
              Gross {formatRupiah(parseFloat(tx.amount))} · Fee{" "}
              {formatRupiah(parseFloat(tx.commission_amount))}
            </p>
          )}
          <p className="text-[#CBD5E1] text-xs mt-0.5">{date}</p>
        </div>
      </div>
      <p
        className={cn(
          "font-bold text-sm flex-shrink-0",
          isCredit ? "text-[#16A34A]" : "text-[#DC2626]",
        )}
      >
        {isCredit ? "+" : "-"}
        {formatRupiah(parseFloat(tx.net_amount))}
      </p>
    </div>
  );
}

function WithdrawItem({ w }: { w: WithdrawalRow }) {
  const date = new Date(w.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const isPending = w.status === "pending";

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center flex-shrink-0">
          <Banknote className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[#2C1810] text-sm font-medium">
            {w.bank_name} · {w.account_number}
          </p>
          <p className="text-[#94A3B8] text-xs">{w.account_name} · {date}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-[#DC2626] font-bold text-sm">
          -{formatRupiah(parseFloat(w.amount))}
        </p>
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
            isPending
              ? "bg-[#FEF9C3] text-[#CA8A04]"
              : "bg-[#DCFCE7] text-[#16A34A]",
          )}
        >
          {isPending ? "Diproses" : "Selesai"}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const BANKS = [
  "BCA", "BNI", "BRI", "Mandiri", "BSI", "CIMB Niaga", "Danamon",
  "Permata", "Jenius (BTPN)", "OVO", "GoPay", "Dana",
];

export default function WalletPenyedia() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [walletData, setWalletData] = useState<{
    wallet: WalletData;
    transactions: TxRow[];
    withdrawals: WithdrawalRow[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Withdraw form
  const [showForm, setShowForm] = useState(false);
  const [wAmount, setWAmount] = useState("");
  const [wBank, setWBank] = useState(BANKS[0]);
  const [wAccount, setWAccount] = useState("");
  const [wName, setWName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Tab
  const [tab, setTab] = useState<"history" | "withdraw">("history");

  async function load() {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchWalletData();
      setWalletData(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Gagal memuat wallet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;
  if (user.role !== "penyedia") return <Navigate to="/dashboard" replace />;

  const balance = walletData ? parseFloat(walletData.wallet.balance) : 0;
  const totalEarned = walletData
    ? parseFloat(walletData.wallet.total_earned)
    : 0;
  const totalWithdrawn = walletData
    ? parseFloat(walletData.wallet.total_withdrawn)
    : 0;

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const amount = parseFloat(wAmount.replace(/\D/g, ""));
    if (!amount || amount <= 0) {
      setSubmitError("Masukkan jumlah penarikan yang valid.");
      return;
    }
    if (amount > balance) {
      setSubmitError("Jumlah melebihi saldo yang tersedia.");
      return;
    }
    if (!wAccount.trim() || !wName.trim()) {
      setSubmitError("Lengkapi data rekening tujuan.");
      return;
    }

    setSubmitting(true);
    try {
      await requestWithdrawal({
        amount,
        bank_name: wBank,
        account_number: wAccount.trim(),
        account_name: wName.trim(),
      });
      setSubmitSuccess(true);
      setWAmount("");
      setWAccount("");
      setWName("");
      await load();
      setTimeout(() => {
        setSubmitSuccess(false);
        setTab("history");
      }, 2500);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gagal memproses penarikan.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-[#EDE9FE] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#EDE9FE] rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[40%] left-[15%] w-[25%] h-[25%] bg-[#FFF0F8] rounded-full blur-3xl opacity-50" />
      </div>

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <ProviderNavbar activePage="wallet" />

          {/* ── Saldo Hero ─────────────────────────────────────────── */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#E91E8C] via-[#C026A4] to-[#7C3AED] p-6 sm:p-8 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 opacity-80" />
                  <p className="text-white/80 text-sm font-medium">
                    Saldo Tersedia
                  </p>
                </div>
                {loading ? (
                  <div className="h-10 w-48 bg-white/20 rounded-xl animate-pulse" />
                ) : (
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                    {formatRupiah(balance)}
                  </p>
                )}
                <p className="text-white/60 text-xs mt-2">
                  Dana aman, siap ditarik kapan saja
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTab("withdraw")}
                className="self-start bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                Tarik Dana
              </button>
            </div>
          </div>

          {/* ── Stat Cards ─────────────────────────────────────────── */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Total Pendapatan"
              value={loading ? "—" : formatRupiah(totalEarned)}
              icon={<TrendingUp className="w-5 h-5 text-[#16A34A]" />}
              accent="bg-[#DCFCE7]"
            />
            <StatCard
              label="Total Dicairkan"
              value={loading ? "—" : formatRupiah(totalWithdrawn)}
              icon={<Banknote className="w-5 h-5 text-[#7C3AED]" />}
              accent="bg-[#EDE9FE]"
            />
          </div>

          {fetchError && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
              {fetchError}
            </div>
          )}

          {/* ── Tabs ───────────────────────────────────────────────── */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(
                [
                  { key: "history", label: "Riwayat Transaksi" },
                  { key: "withdraw", label: "Tarik Dana" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex-1 py-4 text-sm font-semibold transition-colors",
                    tab === t.key
                      ? "text-[#E91E8C] border-b-2 border-[#E91E8C]"
                      : "text-[#94A3B8] hover:text-[#7C3AED]",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── History Tab ─────────────────────────────────────── */}
            {tab === "history" && (
              <div className="p-5 lg:p-6">
                {loading ? (
                  <div className="py-12 text-center text-[#94A3B8] text-sm">
                    Memuat riwayat...
                  </div>
                ) : (walletData?.transactions ?? []).length === 0 &&
                  (walletData?.withdrawals ?? []).length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-4">
                      <Wallet className="w-6 h-6 text-[#D8B4E2]" />
                    </div>
                    <p className="text-[#2C1810] font-semibold text-sm mb-1">
                      Belum ada transaksi
                    </p>
                    <p className="text-[#94A3B8] text-xs max-w-xs">
                      Dana akan masuk ke sini setelah user mengkonfirmasi sesi
                      selesai.
                    </p>
                  </div>
                ) : (
                  <div>
                    {(walletData?.transactions ?? []).length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-[#2C1810] font-bold text-sm mb-3">
                          Pemasukan & Pengeluaran
                        </h3>
                        {walletData!.transactions.map((tx) => (
                          <TxItem key={tx.id} tx={tx} />
                        ))}
                      </div>
                    )}

                    {(walletData?.withdrawals ?? []).length > 0 && (
                      <div>
                        <h3 className="text-[#2C1810] font-bold text-sm mb-3">
                          Riwayat Penarikan
                        </h3>
                        {walletData!.withdrawals.map((w) => (
                          <WithdrawItem key={w.id} w={w} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Withdraw Tab ────────────────────────────────────── */}
            {tab === "withdraw" && (
              <div className="p-5 lg:p-6 max-w-lg">
                {submitSuccess ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
                    </div>
                    <p className="text-[#2C1810] font-bold text-lg mb-1">
                      Permintaan Diterima!
                    </p>
                    <p className="text-[#64748B] text-sm">
                      Dana akan ditransfer dalam 1×24 jam kerja.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="bg-[#FEFCE8] border border-[#FACC15] rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#CA8A04]">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      Saldo tersedia:{" "}
                      <span className="font-bold">{formatRupiah(balance)}</span>
                    </div>

                    <div>
                      <label className="block text-[#2C1810] font-semibold text-sm mb-2">
                        Jumlah Penarikan
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm font-medium">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={wAmount}
                          onChange={(e) =>
                            setWAmount(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="0"
                          className="w-full pl-10 pr-4 py-3.5 bg-[#F8F9FA] border border-[#F3E8FF] rounded-xl text-[#2C1810] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                        />
                      </div>
                      {wAmount && (
                        <p className="text-[#94A3B8] text-xs mt-1">
                          = {formatRupiah(parseFloat(wAmount) || 0)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#2C1810] font-semibold text-sm mb-2">
                        Bank / E-Wallet Tujuan
                      </label>
                      <select
                        value={wBank}
                        onChange={(e) => setWBank(e.target.value)}
                        className="w-full py-3.5 px-4 bg-[#F8F9FA] border border-[#F3E8FF] rounded-xl text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                      >
                        {BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#2C1810] font-semibold text-sm mb-2">
                        Nomor Rekening / Akun
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={wAccount}
                        onChange={(e) => setWAccount(e.target.value)}
                        placeholder="Contoh: 1234567890"
                        className="w-full py-3.5 px-4 bg-[#F8F9FA] border border-[#F3E8FF] rounded-xl text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[#2C1810] font-semibold text-sm mb-2">
                        Nama Pemilik Rekening
                      </label>
                      <input
                        type="text"
                        value={wName}
                        onChange={(e) => setWName(e.target.value)}
                        placeholder="Sesuai nama di buku tabungan"
                        className="w-full py-3.5 px-4 bg-[#F8F9FA] border border-[#F3E8FF] rounded-xl text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                      />
                    </div>

                    {submitError && (
                      <div className="px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
                        {submitError}
                      </div>
                    )}

                    <div className="pt-2 space-y-3 pb-4">
                      <button
                        type="submit"
                        disabled={submitting || balance <= 0}
                        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity disabled:opacity-60"
                      >
                        {submitting ? "Memproses..." : "Ajukan Penarikan"}
                      </button>
                      <p className="text-[#94A3B8] text-xs text-center leading-relaxed">
                        Dana akan diproses dalam 1×24 jam kerja. Platform tidak
                        memungut biaya transfer.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
