import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { MessageCircle, Phone, Star } from "lucide-react";
import ProviderNavbar from "@/components/ProviderNavbar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type TransactionStatus = "pending" | "berlangsung" | "dibatalkan" | "selesai";

type ProviderTransaction = {
  id: number;
  userName: string;
  userInitials: string;
  location: string;
  service: string;
  schedule: string;
  price: number;
  status: TransactionStatus;
  feedback?: number;
};

const MOCK_TRANSACTIONS: ProviderTransaction[] = [
  {
    id: 1,
    userName: "Nama User",
    userInitials: "NU",
    location: "Pesanggrahan, Jakarta Selatan",
    service: "Bantu Ambil Rapor",
    schedule: "Selasa, 19 Mei 2026",
    price: 35000,
    status: "pending",
  },
  {
    id: 2,
    userName: "Nama User",
    userInitials: "NU",
    location: "Pesanggrahan, Jakarta Selatan",
    service: "Bantu Ambil Rapor",
    schedule: "Jumat, 15 Mei 2026",
    price: 35000,
    status: "berlangsung",
  },
  {
    id: 3,
    userName: "Nama User",
    userInitials: "NU",
    location: "Pesanggrahan, Jakarta Selatan",
    service: "Bantu Ambil Rapor",
    schedule: "Jumat, 15 Mei 2026",
    price: 35000,
    status: "dibatalkan",
  },
  {
    id: 4,
    userName: "Nama User",
    userInitials: "NU",
    location: "Pesanggrahan, Jakarta Selatan",
    service: "Bantu Ambil Rapor",
    schedule: "Jumat, 15 Mei 2026",
    price: 35000,
    status: "selesai",
    feedback: 5.0,
  },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("Rp", "Rp ");
}

function StatusBadge({ status }: { status: TransactionStatus }) {
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

  if (status === "pending") return null;

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
  transaction,
  onAccept,
  onReject,
}: {
  transaction: ProviderTransaction;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  if (transaction.status === "pending") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAccept(transaction.id)}
          className="px-4 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold transition-colors"
        >
          Terima
        </button>
        <button
          type="button"
          onClick={() => onReject(transaction.id)}
          className="px-4 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold transition-colors"
        >
          Tolak
        </button>
      </div>
    );
  }

  if (transaction.status === "berlangsung") {
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
          className="w-9 h-9 rounded-full bg-[#FDF4FF] border border-[#FBCFE8] flex items-center justify-center text-[#7C3AED] hover:bg-[#FCE7F3] transition-colors"
          aria-label="Chat"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <StatusBadge status={transaction.status} />
      </div>
    );
  }

  if (transaction.status === "selesai") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[#2C1810]">
          <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
          <span className="text-xs font-bold">
            {transaction.feedback?.toFixed(1)} Feedback
          </span>
        </div>
        <StatusBadge status={transaction.status} />
      </div>
    );
  }

  return <StatusBadge status={transaction.status} />;
}

function TransactionRow({
  transaction,
  onAccept,
  onReject,
}: {
  transaction: ProviderTransaction;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,1.4fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(90px,0.7fr)_minmax(160px,1.2fr)] gap-4 lg:gap-3 items-center py-5 border-b border-[#FBCFE8]/40 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-[#2C1810] font-bold text-sm truncate">
            {transaction.userName}
          </p>
          <p className="text-[#94A3B8] text-xs truncate">
            {transaction.location}
          </p>
        </div>
      </div>

      <div className="lg:text-left">
        <p className="text-[#94A3B8] text-xs font-medium lg:hidden mb-0.5">
          Jasa
        </p>
        <p className="text-[#2C1810] text-sm font-medium">
          {transaction.service}
        </p>
      </div>

      <div className="lg:text-left">
        <p className="text-[#94A3B8] text-xs font-medium lg:hidden mb-0.5">
          Jadwal
        </p>
        <p className="text-[#2C1810] text-sm">{transaction.schedule}</p>
      </div>

      <div className="lg:text-left">
        <p className="text-[#2C1810] text-sm font-bold">
          {formatRupiah(transaction.price)}
        </p>
      </div>

      <div className="flex lg:justify-end">
        <TransactionActions
          transaction={transaction}
          onAccept={onAccept}
          onReject={onReject}
        />
      </div>
    </div>
  );
}

export default function DashboardPenyedia() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

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
    return <Navigate to="/dashboard" replace />;
  }

  const stats = useMemo(() => {
    const upcoming = transactions.filter(
      (t) => t.status === "pending" || t.status === "berlangsung",
    ).length;
    const completed = transactions.filter((t) => t.status === "selesai").length;
    const totalIncome = transactions
      .filter((t) => t.status === "selesai")
      .reduce((sum, t) => sum + t.price, 0);

    return { upcoming, completed, totalIncome };
  }, [transactions]);

  const handleAccept = (id: number) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "berlangsung" as const } : t,
      ),
    );
  };

  const handleReject = (id: number) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "dibatalkan" as const } : t,
      ),
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-[#EDE9FE] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#EDE9FE] rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[40%] left-[20%] w-[25%] h-[25%] bg-[#FFF0F8] rounded-full blur-3xl opacity-50" />
      </div>

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <ProviderNavbar />

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 lg:mt-8">
            <div className="bg-white rounded-2xl p-6 border border-[#FBCFE8] shadow-sm text-center">
              <p className="text-[#2C1810] font-bold text-sm sm:text-base mb-2">
                Transaksi Akan Datang
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-[#2C1810]">
                {stats.upcoming}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#FBCFE8] shadow-sm text-center">
              <p className="text-[#2C1810] font-bold text-sm sm:text-base mb-2">
                Transaksi Selesai
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-[#2C1810]">
                {stats.completed}
              </p>
            </div>
          </section>

          <section className="mt-4">
            <div className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm sm:text-base text-center bg-gradient-to-r from-[#E91E8C] to-[#A131CC] shadow-sm">
              Total Pemasukan: {formatRupiah(stats.totalIncome)}
            </div>
          </section>

          <section className="mt-6 bg-[#FFF8F5] rounded-2xl border border-[#FBCFE8] shadow-sm overflow-hidden">
            <div className="hidden lg:grid grid-cols-[minmax(180px,1.4fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(90px,0.7fr)_minmax(160px,1.2fr)] gap-3 px-6 py-4 border-b border-[#FBCFE8]/60 bg-white/60">
              <p className="text-[#2C1810] font-bold text-sm">Nama User</p>
              <p className="text-[#2C1810] font-bold text-sm">Jasa</p>
              <p className="text-[#2C1810] font-bold text-sm">Jadwal</p>
              <p className="text-[#2C1810] font-bold text-sm">Harga</p>
              <p className="text-[#2C1810] font-bold text-sm text-right">
                Aksi
              </p>
            </div>

            <div className="px-4 sm:px-6">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))
              ) : (
                <div className="py-16 text-center">
                  <p className="text-[#64748B] font-medium text-sm">
                    Belum ada transaksi
                  </p>
                  <p className="text-[#94A3B8] text-xs mt-1">
                    Transaksi dari pengguna akan muncul di sini.
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
