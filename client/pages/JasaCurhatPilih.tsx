import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

export type CurhatMode = "reguler" | "anonim";

const OPTIONS = [
  {
    mode: "reguler" as CurhatMode,
    title: "Reguler",
    desc: "Temanian tahu nama & fotomu",
    price: "20-35rb/jam",
    features: [
      "Temanian tahu identitasmu",
      "Riwayat sesi tersimpan",
      "Bisa lanjut sesi berikutnya",
    ],
  },
  {
    mode: "anonim" as CurhatMode,
    title: "Anonim",
    desc: "Identitasmu tersembunyi",
    price: "35-50rb/jam",
    features: [
      "Nama & foto kamu disembunyikan",
      "Log dihapus otomatis 7 hari",
      "Temanian juga anonim bagimu",
    ],
  },
] as const;

function RegulerIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className="text-[#7C3AED]"
    >
      <path
        d="M5 8a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H9l-3 3v-3H7a2 2 0 01-2-2V8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M11 11a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2h-2l-3 3v-3h-1a2 2 0 01-2-2v-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnonimIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className="text-[#7C3AED]"
    >
      <path
        d="M6 10c0-3.314 2.686-6 6-6s6 2.686 6 6v1.5H6V10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 12.5h18v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="16.5" r="1" fill="currentColor" />
      <circle cx="17" cy="16.5" r="1" fill="currentColor" />
      <path
        d="M10 19.5c.8.8 1.9 1.2 4 1.2s3.2-.4 4-1.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function JasaCurhatPilih() {
  usePageTitle("Jasa Curhat | TEMENIN");
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selected, setSelected] = useState<CurhatMode>("reguler");

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

  const selectedOption = OPTIONS.find((o) => o.mode === selected)!;

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-8">
            <Link
              to="/jasa-temenin"
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Jasa Curhat
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Pilih metode yang nyaman buat kamu
              </p>
            </div>
          </div>

          <p className="text-[#2C1810] font-semibold text-base sm:text-lg mb-5">
            Pilih senyaman kamu, mau curhat secara anonim atau reguler?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {OPTIONS.map((option) => {
              const isSelected = selected === option.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => setSelected(option.mode)}
                  className={cn(
                    "rounded-2xl border-2 p-6 sm:p-8 text-left transition-all shadow-sm hover:shadow-md",
                    isSelected
                      ? "border-[#7C3AED] bg-[#F5F3FF]"
                      : "border-[#E5D5C5] bg-white",
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center mb-4",
                      isSelected ? "bg-[#EDE9FE]" : "bg-[#F5F3FF]",
                    )}
                  >
                    {option.mode === "reguler" ? (
                      <RegulerIcon />
                    ) : (
                      <AnonimIcon />
                    )}
                  </div>
                  <h2 className="text-[#2C1810] font-bold text-xl mb-2">
                    {option.title}
                  </h2>
                  <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
                    {option.desc}
                  </p>
                  <p className="text-[#7C3AED] font-bold text-lg mb-5">
                    {option.price}
                  </p>
                  <ul className="space-y-2">
                    {option.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[#64748B] text-sm"
                      >
                        <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              if (selected === "anonim") {
                navigate("/jasa-curhat/anonim");
              } else {
                navigate("/jasa-curhat/reguler");
              }
            }}
            className="w-full py-4 rounded-xl border-2 border-[#2C1810] bg-white text-[#2C1810] font-semibold text-base hover:bg-[#F5EBE0] transition-colors"
          >
            Lanjut dengan Mode {selectedOption.title} →
          </button>
        </div>
      </main>
    </div>
  );
}
