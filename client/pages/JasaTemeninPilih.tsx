import { useState } from "react";
import { ArrowLeft, Check, Monitor, Users } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import type { TemeninMode } from "@/data/temenin-companions";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    mode: "tatap-muka" as TemeninMode,
    title: "Tatap Muka",
    desc: "Ketemu langsung — nonton bioskop, makan bareng, olahraga, jalan-jalan, dll.",
    price: "60-75rb/jam",
    icon: Users,
    selectedBorder: "border-[#E91E8C]",
    selectedBg: "bg-[#FFF0F8]",
    defaultBorder: "border-[#FBCFE8]",
    features: [
      "Ketemu fisik di lokasimu",
      "Bagikan lokasi aktif selama sesi",
      "Tombol darurat tersedia",
    ],
  },
  {
    mode: "online" as TemeninMode,
    title: "Online Bareng",
    desc: "Main game bareng, nonton film bersama (watch party), belajar online, ngobrol via video call, dll.",
    price: "40-60rb/jam",
    icon: Monitor,
    selectedBorder: "border-[#93C5FD]",
    selectedBg: "bg-white",
    defaultBorder: "border-[#BFDBFE]",
    features: [
      "Dari kenyamanan rumahmu",
      "Chat & koordinasi via aplikasi",
      "Lebih fleksibel & terjangkau",
    ],
  },
] as const;

export default function JasaTemeninPilih() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selected, setSelected] = useState<TemeninMode>("tatap-muka");

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
                Jasa Temenin
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Pilih cara menemanimu
              </p>
            </div>
          </div>

          <p className="text-[#2C1810] font-semibold text-base sm:text-lg mb-5">
            Mau ketemu langsung atau main online bareng?
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
                      ? `${option.selectedBorder} ${option.selectedBg} ring-2 ring-offset-2 ring-[#E91E8C]/20`
                      : `${option.defaultBorder} bg-white`,
                  )}
                >
                  <div className="w-14 h-14 rounded-full bg-[#FFF0F8] flex items-center justify-center mb-4">
                    <option.icon className="w-7 h-7 text-[#E91E8C]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-[#2C1810] font-bold text-xl mb-2">
                    {option.title}
                  </h2>
                  <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
                    {option.desc}
                  </p>
                  <p className="text-[#E91E8C] font-bold text-lg mb-5">
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
            onClick={() => navigate(`/jasa-temenin/cari/${selected}`)}
            className="w-full max-w-xl mx-auto block py-4 rounded-xl border-2 border-[#E5D5C5] bg-white text-[#2C1810] font-semibold text-base hover:bg-[#F5EBE0] transition-colors"
          >
            Cari Temanian {selectedOption.title} →
          </button>
        </div>
      </main>
    </div>
  );
}
