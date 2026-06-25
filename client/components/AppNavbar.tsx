import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Beranda", path: "/dashboard", key: "beranda" },
  { label: "Pencarian", path: "/pencarian", key: "pencarian" },
  { label: "Jasa Temenin", path: "/jasa-temenin", key: "jasa" },
  { label: "Pesanan", path: "/pesanan", key: "pesanan" },
  { label: "Profil", path: "/profil", key: "profil" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

export default function AppNavbar({
  activePage,
  userName,
  userInitials,
}: {
  activePage: NavKey;
  userName?: string;
  userInitials?: string;
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = userName ?? user?.name ?? "Pengguna";
  const displayInitials = userInitials ?? user?.initials ?? "?";

  const handleLogout = () => {
    logout();
    navigate("/masuk", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#FBCFE8]/40 bg-[#FFF0F8]/95 backdrop-blur-md">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="flex-shrink-0">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
            alt="Temenin Logo"
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-10 flex-1 justify-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                "text-sm whitespace-nowrap transition-colors",
                activePage === item.key
                  ? "text-[#7C3AED] font-semibold"
                  : "text-[#D8B4E2] hover:text-[#7C3AED] font-medium",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-[#2C1810] leading-tight">
              Selamat datang,
            </p>
            <p className="text-xs font-bold text-[#4C1D95] leading-tight">
              {displayName}
            </p>
          </div>
          <Link
            to="/notifikasi"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#E91E8C] hover:bg-[#FDF4FF] transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-4.5 h-4.5" />
          </Link>
          <Link
            to="/profil"
            className="w-10 h-10 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm border border-[#F9A8D4] hover:ring-2 hover:ring-[#E91E8C]/40 transition-shadow"
            title={displayName}
          >
            {displayInitials}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#E91E8C] border border-[#FBCFE8] bg-white hover:bg-[#FDF4FF] transition-colors"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
