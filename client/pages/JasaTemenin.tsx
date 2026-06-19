import { Link, Navigate } from "react-router-dom";
import {
  Briefcase,
  CreditCard,
  Lock,
  MessageCircle,
  Siren,
  Star,
  Users,
} from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    title: "Jasa Temenin",
    desc: "Hang out, Nonton, Gaming",
    price: "50-75rb/jam",
    tags: ["Tatap Muka", "Online"],
    icon: Users,
    accent: "#E91E8C",
    border: "border-[#F9A8D4]",
    bg: "bg-[#FFF0F8]",
    tagClass: "text-[#E91E8C] border-[#FBCFE8] bg-[#FDF4FF]",
  },
  {
    title: "Jasa Curhat",
    desc: "Didengar tanpa dihakimi",
    price: "25-50rb/jam",
    tags: ["Reguler", "Anonim"],
    icon: MessageCircle,
    accent: "#7C3AED",
    border: "border-[#C4B5FD]",
    bg: "bg-[#F5F3FF]",
    tagClass: "text-[#7C3AED] border-[#DDD6FE] bg-[#EDE9FE]",
  },
  {
    title: "Jasa Bantu",
    desc: "Ambil rapor, antar dokumen",
    price: "40rb/aktivitas",
    tags: ["Berbasis Tugas"],
    icon: Briefcase,
    accent: "#0D9488",
    border: "border-[#5EEAD4]",
    bg: "bg-[#F0FDFA]",
    tagClass: "text-[#0D9488] border-[#99F6E4] bg-[#CCFBF1]",
  },
] as const;

const TRUST_ITEMS = [
  { label: "Verifikasi KTP + Selfie", icon: CreditCard },
  { label: "Dana Aman", icon: Lock },
  { label: "Rating & Ulasan Terbuka", icon: Star },
  { label: "Tombol Darurat 24/7", icon: Siren },
] as const;

function ServiceCard({
  service,
  linkTo,
}: {
  service: (typeof SERVICES)[number];
  linkTo?: string;
}) {
  const content = (
    <>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${service.accent}18` }}
      >
        <service.icon
          className="w-8 h-8"
          style={{ color: service.accent }}
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#2C1810] mb-2">
        {service.title}
      </h3>
      <p className="text-[#94A3B8] text-sm mb-3">{service.desc}</p>
      <p
        className="text-xl sm:text-2xl font-bold mb-5"
        style={{ color: service.accent }}
      >
        {service.price}
      </p>
      <div className="flex flex-wrap gap-2 justify-center mt-auto">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border",
              service.tagClass,
            )}
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  );

  const className = cn(
    "rounded-[24px] border-2 p-6 sm:p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow",
    service.border,
    service.bg,
    linkTo && "cursor-pointer hover:scale-[1.01]",
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function SakuraDecor() {
  return (
    <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-90">
      <svg
        width="140"
        height="120"
        viewBox="0 0 140 120"
        fill="none"
        aria-hidden
        className="hidden sm:block"
      >
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 28}, ${i % 2 === 0 ? 0 : 18})`}>
            <circle cx="20" cy="20" r="6" fill="#F9A8D4" />
            <circle cx="32" cy="14" r="5" fill="#F472B6" />
            <circle cx="14" cy="32" r="5" fill="#F472B6" />
            <circle cx="28" cy="30" r="5" fill="#EC4899" />
            <circle cx="20" cy="22" r="3" fill="#FDF2F8" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function JasaTemenin() {
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[28%] h-[28%] bg-[#FFF0F8] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[24%] h-[24%] bg-[#EDE9FE] rounded-full blur-3xl opacity-50" />
      </div>

      <AppNavbar activePage="jasa" />

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl border border-[#FBCFE8] bg-gradient-to-r from-[#FFF0F8] to-[#FDF4FF] px-6 sm:px-10 py-8 sm:py-10 mb-8 lg:mb-10">
            <SakuraDecor />
            <div className="relative max-w-2xl">
              <p className="text-[#E91E8C] text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
                Layanan Temenin
              </p>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3">
                Temukan Temanian yang Tepat Buat Kamu
              </h1>
              <p className="text-[#64748B] text-sm sm:text-base">
                Semua Temanian terverifikasi KTP dan aman
              </p>
            </div>
          </section>

          {/* Pilih Layanan */}
          <section className="mb-8 lg:mb-10">
            <h2 className="text-[#2C1810] font-bold text-xl sm:text-2xl mb-6">
              Pilih Layanan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {SERVICES.map((service) => (
                <ServiceCard
                  key={service.title}
                  service={service}
                  linkTo={
                    service.title === "Jasa Temenin"
                      ? "/jasa-temenin/pilih"
                      : service.title === "Jasa Curhat"
                        ? "/jasa-curhat/pilih"
                        : service.title === "Jasa Bantu"
                          ? "/jasa-bantu"
                          : undefined
                  }
                />
              ))}
            </div>
          </section>

          {/* Trust bar */}
          <section className="rounded-2xl border-2 border-[#93C5FD] bg-white px-5 sm:px-8 py-6 sm:py-8">
            <h3 className="text-[#2C1810] font-bold text-base sm:text-lg mb-5 sm:mb-6">
              Semua Temanian TEMENIN
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 sm:gap-4"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#3B82F6]" />
                  </div>
                  <p className="text-[#2C1810] text-xs sm:text-sm font-semibold leading-snug">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
