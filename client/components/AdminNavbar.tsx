import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, Settings, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard-admin", key: "dashboard" },
  { label: "Manajemen User", path: "/dashboard-admin?view=manajemen-user", key: "manajemen-user" },
  { label: "Manajemen Provider", path: "/dashboard-admin?view=manajemen-provider", key: "manajemen-provider" },
  { label: "Manajemen Transaksi", path: "/dashboard-admin?view=manajemen-transaksi", key: "manajemen-transaksi" },
  { label: "Manajemen Laporan", path: "/dashboard-admin?view=manajemen-laporan", key: "manajemen-laporan" },
  { label: "Manajemen Konten", path: "/dashboard-admin?view=manajemen-konten", key: "manajemen-konten" },
  { label: "Log Aktivitas", path: "/dashboard-admin?view=log-aktivitas", key: "log-aktivitas" },
] as const;

export type AdminNavKey = (typeof NAV_ITEMS)[number]["key"];

export default function AdminNavbar({
  activePage = "dashboard",
}: {
  activePage?: AdminNavKey;
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/masuk", { replace: true });
  };

  // tutup user dropdown kalau klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setUserDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E9D5FF]/60 bg-[#FFF0F8]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 px-3 py-3 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link to="/dashboard-admin" className="flex-shrink-0">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
            alt="Temenin Logo"
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        {/* Desktop nav — tampil di xl+ */}
        <nav className="hidden xl:flex flex-1 items-center justify-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                "text-xs whitespace-nowrap transition-colors 2xl:text-sm",
                activePage === item.key
                  ? "text-[#7C3AED] font-semibold"
                  : "text-[#D8B4E2] hover:text-[#7C3AED] font-medium",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Kanan: user icon dropdown + hamburger */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          {/* User avatar + dropdown */}
          <div ref={dropRef} className="relative">
            <button
              type="button"
              onClick={() => setUserDropOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-white px-2 py-1.5 transition-colors hover:bg-[#F5F3FF] sm:px-3"
              aria-label="Menu akun"
            >
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#EDE9FE] text-xs font-bold text-[#7C3AED]">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.initials ?? "AD"
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#4C1D95] leading-tight">{user?.name ?? "Admin"}</p>
                <p className="text-[10px] text-[#94A3B8] leading-tight">Administrator</p>
              </div>
            </button>

            {/* Dropdown */}
            {userDropOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#E9D5FF] bg-white py-2 shadow-lg z-[60]">
                {/* info */}
                <div className="border-b border-[#F3E8FF] px-4 py-3">
                  <p className="text-sm font-semibold text-[#111111]">{user?.name ?? "Admin"}</p>
                  <p className="text-xs text-[#64748B] truncate">{user?.email ?? ""}</p>
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
                    Administrator
                  </span>
                </div>
                {/* actions */}
                <div className="px-2 pt-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#64748B] hover:bg-[#F5F3FF] hover:text-[#7C3AED]"
                    onClick={() => setUserDropOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Pengaturan Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUserDropOpen(false); handleLogout(); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2]"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger — hanya tampil di bawah xl */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex xl:hidden items-center justify-center rounded-full border border-[#DDD6FE] bg-white p-2 text-[#7C3AED] hover:bg-[#F5F3FF]"
            aria-label="Buka menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="xl:hidden border-t border-[#E9D5FF] bg-[#FFF0F8] px-4 py-3">
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  activePage === item.key
                    ? "bg-[#EDE9FE] text-[#7C3AED]"
                    : "text-[#64748B] hover:bg-[#F5F3FF] hover:text-[#7C3AED]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
