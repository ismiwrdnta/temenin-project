import { useMemo, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import {
  COMPANION_FILTERS,
  TEMENIN_COMPANIONS,
  getModeLabel,
  type Companion,
  type CompanionFilter,
  type TemeninMode,
} from "@/data/temenin-companions";
import { canBookCompanion } from "@/lib/order-factory";
import { cn } from "@/lib/utils";

function isValidMode(mode: string | undefined): mode is TemeninMode {
  return mode === "tatap-muka" || mode === "online";
}

function StatusBadge({ status }: { status: Companion["status"] }) {
  if (status === "verified-online") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold">
          Verified
        </span>
        <span className="flex items-center gap-1 text-[#16A34A] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          Online
        </span>
      </div>
    );
  }

  if (status === "verified-offline") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold">
          Verified
        </span>
        <span className="flex items-center gap-1 text-[#94A3B8] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
          Offline
        </span>
      </div>
    );
  }

  return (
    <span className="px-2.5 py-0.5 rounded-full bg-[#F5EBE0] text-[#92400E] text-xs font-semibold">
      Menunggu Verifikasi
    </span>
  );
}

function CompanionCard({
  companion,
  onSelect,
}: {
  companion: Companion;
  onSelect: () => void;
}) {
  const bookable = canBookCompanion(companion);

  return (
    <div className="bg-white rounded-2xl border border-[#FBCFE8]/60 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div className="w-14 h-14 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-base flex-shrink-0">
        {companion.initials}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[#4C1D95] font-bold text-lg mb-2">
          {companion.name}
        </h3>
        <div className="mb-2">
          <StatusBadge status={companion.status} />
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {companion.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-[#FDF4FF] text-[#E91E8C] text-xs font-medium border border-[#FBCFE8]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[#64748B] text-sm">
          <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
          <span className="font-semibold text-[#2C1810]">
            {companion.rating.toFixed(2)}
          </span>
          <span>({companion.reviews})</span>
          <span className="text-[#CBD5E1]">•</span>
          <span>{companion.age} Tahun</span>
        </div>
      </div>

      <div className="sm:ml-auto flex-shrink-0 w-full sm:w-auto">
        <button
          type="button"
          disabled={!bookable}
          onClick={onSelect}
          className={cn(
            "w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors",
            bookable
              ? "bg-gradient-to-r from-[#E91E8C] to-[#7C3AED] text-white hover:opacity-90 shadow-sm"
              : "bg-[#F5F5F5] text-[#94A3B8] cursor-not-allowed",
          )}
        >
          {bookable ? "Pilih Temanian" : "Belum Terverifikasi"}
        </button>
      </div>
    </div>
  );
}

export default function JasaTemeninCari() {
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState<CompanionFilter>("Semua");

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

  if (!isValidMode(mode)) {
    return <Navigate to="/jasa-temenin/pilih" replace />;
  }

  const companions = useMemo(() => {
    return TEMENIN_COMPANIONS.filter((c) => c.modes.includes(mode)).filter(
      (c) =>
        activeFilter === "Semua" ||
        c.tags.some(
          (tag) => tag.toLowerCase() === activeFilter.toLowerCase(),
        ),
    );
  }, [mode, activeFilter]);

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-6">
            <Link
              to="/jasa-temenin/pilih"
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Jasa Temenin
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Temanian aktivitas terverifikasi di sekitarmu
                <span className="hidden sm:inline">
                  {" "}
                  · {getModeLabel(mode)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
            {COMPANION_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  activeFilter === filter
                    ? "border-[#2C1810] bg-white text-[#2C1810] font-semibold"
                    : "border-[#E5D5C5] bg-white text-[#64748B] hover:border-[#D8B4E2]",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <p className="text-[#64748B] text-sm mb-4">
            {companions.length} Temanian tersedia
          </p>

          <div className="flex flex-col gap-4">
            {companions.length > 0 ? (
              companions.map((companion) => (
                <CompanionCard
                  key={companion.id}
                  companion={companion}
                  onSelect={() =>
                    navigate(
                      `/jasa-temenin/pesan/${mode}/${companion.id}`,
                    )
                  }
                />
              ))
            ) : (
              <div className="py-16 text-center rounded-2xl border border-dashed border-[#E9D5FF] bg-white">
                <p className="text-[#64748B] font-medium text-sm">
                  Belum ada Temanian untuk filter ini
                </p>
                <p className="text-[#94A3B8] text-xs mt-1">
                  Coba pilih kategori lain atau ubah mode layanan.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
