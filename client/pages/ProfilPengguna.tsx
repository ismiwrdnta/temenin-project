import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Edit3, LogOut, Mail, Phone, Shield, User } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/utils";

export default function ProfilPengguna() {
  usePageTitle("Profil | TEMENIN");
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { orders } = useOrders();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;
  if (user.role === "penyedia") return <Navigate to="/profil-penyedia" replace />;

  const completedOrders = orders.filter((o) => o.status === "selesai").length;
  const activeOrders = orders.filter((o) => o.status === "berlangsung" || o.status === "pending").length;
  const reviewsGiven = orders.filter((o) => o.reviewStatus === "sent").length;

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-['Poppins',sans-serif]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[25%] h-[25%] bg-[#FFF0F8] rounded-full blur-3xl opacity-60" />
      </div>

      <AppNavbar activePage="profil" />

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Avatar + nama */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
            {user.initials}
          </div>
          <h1 className="text-[#2C1810] font-bold text-2xl">{user.name}</h1>
          <span className="mt-1 px-3 py-1 rounded-full bg-[#FDF4FF] text-[#7C3AED] text-xs font-semibold border border-[#E9D5FF]">
            Pengguna Temenin
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Pesanan Aktif", value: activeOrders },
            { label: "Sesi Selesai", value: completedOrders },
            { label: "Ulasan Diberikan", value: reviewsGiven },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-[#2C1810]">{s.value}</p>
              <p className="text-[#94A3B8] text-xs mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info akun */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-[#2C1810] font-semibold text-sm">Informasi Akun</h2>
            <span className="text-[#94A3B8] text-xs flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              Edit (segera hadir)
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            <InfoRow icon={<User className="w-4 h-4" />} label="Nama Lengkap" value={user.name} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="Nomor Telepon"
              value={user.phone ?? "Belum ditambahkan"}
              muted={!user.phone}
            />
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="Status Akun"
              value="Aktif"
              valueClass="text-[#16A34A] font-semibold"
            />
          </div>
        </div>

        {/* Keluar */}
        {showLogoutConfirm ? (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-5 text-center">
            <p className="text-[#DC2626] font-semibold text-sm mb-4">Yakin ingin keluar?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[#64748B] text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-[#FECACA] text-[#DC2626] text-sm font-semibold hover:bg-[#FEF2F2] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar dari Akun
          </button>
        )}
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  muted,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className={cn("flex-shrink-0", muted ? "text-[#D1D5DB]" : "text-[#94A3B8]")}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[#94A3B8] text-xs">{label}</p>
        <p className={cn("text-[#2C1810] text-sm font-medium truncate mt-0.5", muted && "text-[#D1D5DB]", valueClass)}>
          {value}
        </p>
      </div>
    </div>
  );
}
