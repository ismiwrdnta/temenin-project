import { ArrowLeft, Briefcase } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { BANTU_CATEGORIES, type BantuCategory } from "@/data/jasa-bantu-categories";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

function BantuCategoryCard({
  category,
  onSelect,
}: {
  category: BantuCategory;
  onSelect: () => void;
}) {
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 text-left shadow-sm hover:shadow-md hover:border-[#5EEAD4] transition-all"
    >
      <div className="flex gap-4 sm:gap-5">
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
            category.iconBg,
          )}
        >
          <Icon className={cn("w-7 h-7", category.iconColor)} strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h3 className="text-[#2C1810] font-bold text-base sm:text-lg">
                {category.title}
              </h3>
              {category.popular && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFEDD5] text-[#EA580C] text-xs font-semibold whitespace-nowrap">
                  Paling Populer 🔥
                </span>
              )}
            </div>
            <p className="text-right flex-shrink-0 leading-tight">
              <span className="text-[#0D9488] font-bold text-base sm:text-lg">
                {category.price}
              </span>
              <span className="text-[#0D9488] text-sm font-medium">
                {category.priceUnit}
              </span>
            </p>
          </div>

          <p className="text-[#64748B] text-sm leading-relaxed mb-4">
            {category.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag) => (
              <span
                key={tag.label}
                className={cn(
                  "text-xs font-medium",
                  tag.variant === "accent"
                    ? "text-[#0D9488]"
                    : "text-[#94A3B8]",
                )}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function JasaBantu() {
  usePageTitle("Jasa Bantu Aktivitas | TEMENIN");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/masuk" replace />;
  }

  if (user.role === "penyedia") {
    return <Navigate to="/dashboard-penyedia" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-6">
            <Link
              to="/jasa-temenin"
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Jasa Bantu Aktivitas
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Bantuan tugas harian dari orang terpercaya
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#5EEAD4] bg-[#F0FDFA] px-5 py-4 sm:px-6 sm:py-5 mb-8 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-[#0D9488] flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[#0F766E] font-bold text-base sm:text-lg mb-1">
                Layanan Bantu — Eksklusif TEMENIN ID
              </h2>
              <p className="text-[#0F766E] text-sm sm:text-base leading-relaxed">
                Layanan unik yang{" "}
                <span className="font-bold">hanya ada di TEMENIN</span>. Tidak
                perlu khawatir — semua helper sudah terverifikasi KTP dan ada
                sistem keamanan berlapis.
              </p>
            </div>
          </div>

          <h2 className="text-[#2C1810] font-bold text-lg sm:text-xl mb-5">
            Pilih Kategori Bantuan
          </h2>

          <div className="flex flex-col gap-4">
            {BANTU_CATEGORIES.map((category) => (
              <BantuCategoryCard
                key={category.id}
                category={category}
                onSelect={() => {
                  if (category.id === "ambil-rapor") {
                    navigate("/jasa-bantu/ambil-rapor");
                  } else if (category.id === "antri-mewakili") {
                    navigate("/jasa-bantu/antri-mewakili");
                  } else if (category.id === "belanja-titip") {
                    navigate("/jasa-bantu/belanja-titip");
                  }
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
