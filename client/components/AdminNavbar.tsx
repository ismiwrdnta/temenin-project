import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard-admin", key: "dashboard" },
  {
    label: "User Traffic",
    path: "/dashboard-admin?view=user-traffic",
    key: "user-traffic",
  },
  {
    label: "Location Traffic",
    path: "/dashboard-admin?view=location-traffic",
    key: "location-traffic",
  },
  {
    label: "Jasa Traffic",
    path: "/dashboard-admin?view=jasa-traffic",
    key: "jasa-traffic",
  },
  { label: "Profil", path: "/dashboard-admin?view=profil", key: "profil" },
] as const;

export type AdminNavKey = (typeof NAV_ITEMS)[number]["key"];

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
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 lg:px-10">
        <Link to="/dashboard-admin" className="flex-shrink-0">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
            alt="Temenin Logo"
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-start gap-4 overflow-x-auto px-1 sm:gap-6 lg:justify-center lg:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                "text-xs whitespace-nowrap transition-colors sm:text-sm",
                activePage === item.key
                  ? "text-[#7C3AED] font-semibold"
                  : "text-[#D8B4E2] hover:text-[#7C3AED] font-medium",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-[#2C1810] leading-tight">
              Selamat datang,
            </p>
            <p className="text-xs font-bold text-[#4C1D95] leading-tight">
              {user?.name ?? "Admin"}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#DDD6FE] bg-[#EDE9FE] text-xs font-bold text-[#7C3AED] sm:h-10 sm:w-10 sm:text-sm">
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
            className="flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-white px-2 py-2 text-xs font-medium text-[#7C3AED] transition-colors hover:bg-[#F5F3FF] sm:px-3"
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
