import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard-admin", key: "dashboard" },
  { label: "User Traffic", path: "/dashboard-admin", key: "user-traffic" },
  { label: "Location Traffic", path: "/dashboard-admin", key: "location-traffic" },
  { label: "Jasa Traffic", path: "/dashboard-admin", key: "jasa-traffic" },
  { label: "Profil", path: "/dashboard-admin", key: "profil" },
] as const;

type AdminNavKey = (typeof NAV_ITEMS)[number]["key"];

export default function AdminNavbar({
  activePage = "dashboard",
}: {
  activePage?: AdminNavKey;
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/masuk", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E9D5FF]/60 bg-[#FFF0F8]/95 backdrop-blur-md">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
        <Link to="/dashboard-admin" className="flex-shrink-0">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
            alt="Temenin Logo"
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
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
              {user?.name ?? "Admin"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-bold text-sm border border-[#DDD6FE] overflow-hidden">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.initials ?? "AD"
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#7C3AED] border border-[#DDD6FE] bg-white hover:bg-[#F5F3FF] transition-colors"
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
