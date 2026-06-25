import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Bell, BellOff, AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import ProviderNavbar from "@/components/ProviderNavbar";
import { useAuth } from "@/context/AuthContext";
import { getStoredToken } from "@/lib/authApi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/utils";

type NotifRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  violation_warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-[#D97706] bg-[#FFF7ED]",
  },
  violation_suspension: {
    icon: <ShieldAlert className="w-4 h-4" />,
    color: "text-[#DC2626] bg-[#FEF2F2]",
  },
  violation_ban: {
    icon: <ShieldAlert className="w-4 h-4" />,
    color: "text-[#DC2626] bg-[#FEF2F2]",
  },
  booking_confirmed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-[#16A34A] bg-[#F0FDF4]",
  },
  default: {
    icon: <Info className="w-4 h-4" />,
    color: "text-[#7C3AED] bg-[#F5F3FF]",
  },
};

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  const d = Math.floor(diff / 86400);
  return `${d} hari lalu`;
}

export default function Notifikasi() {
  usePageTitle("Notifikasi | TEMENIN");
  const { user, isAuthenticated, isLoading } = useAuth();
  const [notifs, setNotifs] = useState<NotifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = getStoredToken();
    setLoading(true);
    fetch("/api/notifications", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => setNotifs(d.data ?? []))
      .catch(() => setError("Gagal memuat notifikasi."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;

  const isPenyedia = user.role === "penyedia";

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-['Poppins',sans-serif]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[25%] h-[25%] bg-[#FFF0F8] rounded-full blur-3xl opacity-60" />
      </div>

      {isPenyedia ? (
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
          <ProviderNavbar activePage="dashboard" />
        </div>
      ) : (
        <AppNavbar activePage="profil" />
      )}

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FDF4FF] flex items-center justify-center text-[#E91E8C]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[#2C1810] font-bold text-lg">Notifikasi</h1>
            <p className="text-[#94A3B8] text-xs">{notifs.length} riwayat notifikasi</p>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-[#DC2626] text-sm text-center py-10">{error}</p>
        )}

        {!loading && !error && notifs.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <BellOff className="w-12 h-12 text-[#D1D5DB] mb-4" />
            <p className="text-[#94A3B8] font-medium">Belum ada notifikasi</p>
            <p className="text-[#D1D5DB] text-sm mt-1">Notifikasi akan muncul di sini</p>
          </div>
        )}

        {!loading && !error && notifs.length > 0 && (
          <div className="space-y-2">
            {notifs.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.default;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "rounded-2xl border p-4 flex items-start gap-3 transition-colors",
                    n.is_read
                      ? "bg-white border-gray-100"
                      : "bg-[#FFF0F8] border-[#FBCFE8]",
                  )}
                >
                  <div className={cn("rounded-full p-2 flex-shrink-0 mt-0.5", meta.color)}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[#2C1810] text-sm leading-snug">
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#E91E8C] mt-1.5" />
                      )}
                    </div>
                    <p className="text-[#64748B] text-xs mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[#D1D5DB] text-[10px] mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
