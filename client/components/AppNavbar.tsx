import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Beranda", path: "/dashboard", key: "beranda" },
  { label: "Pencarian", path: "/pencarian", key: "pencarian" },
  { label: "Jasa Temenin", path: "#", key: "jasa" },
  { label: "Pesanan", path: "#", key: "pesanan" },
  { label: "Profil", path: "#", key: "profil" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

export default function AppNavbar({
  activePage,
  userName = "Diah Ayu Lestari",
  userInitials = "DA",
}: {
  activePage: NavKey;
  userName?: string;
  userInitials?: string;
}) {
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

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-[#2C1810] leading-tight">
              Selamat datang,
            </p>
            <p className="text-xs font-bold text-[#4C1D95] leading-tight">
              {userName}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm border border-[#F9A8D4]">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
