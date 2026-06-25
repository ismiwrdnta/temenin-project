import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export type ProviderNavPage = "dashboard" | "profil" | "wallet";

export default function ProviderNavbar({
  activePage = "dashboard",
  pendingCount = 0,
}: {
  activePage?: ProviderNavPage;
  pendingCount?: number;
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayInitials = user?.initials ?? "?";

  const handleLogout = () => {
    logout();
    navigate("/masuk", { replace: true });
  };

  return (
    <header className="w-full bg-[#FFF0F8] rounded-2xl px-5 sm:px-8 py-4 flex items-center justify-between gap-3 shadow-sm border border-[#FBCFE8]/50">
      <Link to="/" className="flex-shrink-0">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/204a9c97054fe9fbe2b19613c323c412af8bb108?width=300"
          alt="Temenin Logo"
          className="h-10 sm:h-12 w-auto"
        />
      </Link>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
        {/* Dashboard */}
        <Link
          to="/dashboard-penyedia"
          className={cn(
            "relative px-4 sm:px-6 py-2 rounded-full text-sm font-semibold shadow-sm transition-opacity",
            activePage === "dashboard"
              ? "text-white bg-gradient-to-r from-[#E91E8C] to-[#A131CC]"
              : "text-[#7C3AED] bg-white border border-[#FBCFE8] hover:bg-[#FDF4FF]",
          )}
        >
          Dashboard
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </Link>

        {/* Wallet */}
        <Link
          to="/wallet-penyedia"
          className={cn(
            "flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition-opacity",
            activePage === "wallet"
              ? "text-white bg-gradient-to-r from-[#E91E8C] to-[#A131CC]"
              : "text-[#7C3AED] bg-white border border-[#FBCFE8] hover:bg-[#FDF4FF]",
          )}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Wallet</span>
        </Link>

        {/* Notifikasi */}
        <Link
          to="/notifikasi"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#E91E8C] hover:bg-[#FDF4FF] transition-colors border border-[#FBCFE8] bg-white"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Avatar / Profil */}
        <Link
          to="/profil-penyedia"
          className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center text-white text-xs font-bold transition-opacity hover:opacity-90",
            activePage === "profil"
              ? "ring-2 ring-[#E91E8C] ring-offset-2 bg-gradient-to-br from-[#E91E8C] to-[#7C3AED]"
              : "bg-gradient-to-br from-[#E91E8C] to-[#7C3AED]",
          )}
          title="Profil"
        >
          {displayInitials}
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#E91E8C] border border-[#FBCFE8] bg-white hover:bg-[#FDF4FF] transition-colors"
          title="Keluar"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

