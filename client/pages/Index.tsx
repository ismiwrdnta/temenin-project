import { Link, useNavigate } from "react-router-dom";
import {
  Headphones,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const HERO_TAGS = ["Hangout", "Curhat", "Nonton Bareng", "Deep Talk"];

const SERVICES = [
  {
    title: "Jasa Temenin",
    desc: "Hangout, jalan-jalan, nonton bareng",
    price: "50–75rb/jam",
    tags: ["Hangout", "Curhat"],
  },
  {
    title: "Jasa Curhat",
    desc: "Didengar tanpa dihakimi",
    price: "25–50rb/jam",
    tags: ["Deep Talk", "Konsultasi"],
  },
  {
    title: "Jasa Bantu Aktivitas",
    desc: "Antar dokumen, ambil rapor",
    price: "40rb/aktivitas",
    tags: ["Custom"],
  },
];

const WHY_US = [
  {
    title: "Sistem Escrow Aman",
    desc: "Dana kamu tersimpan aman, hanya cair ke provider setelah sesi selesai.",
    icon: Lock,
  },
  {
    title: "Teman Terverifikasi KTP",
    desc: "Semua Temanian wajib verifikasi identitas sebelum aktif.",
    icon: Shield,
  },
  {
    title: "Bantuan CS 24/7",
    desc: "Tim support siap membantu kapan pun kamu butuh.",
    icon: Headphones,
  },
  {
    title: "Geolokasi dan Smart Matching",
    desc: "Temukan Temanian terdekat dengan rekomendasi yang relevan.",
    icon: MapPin,
  },
];

const STEPS = [
  { num: 1, title: "Daftar & Verifikasi", desc: "Buat akun dan verifikasi identitasmu." },
  { num: 2, title: "Temukan Temanmu", desc: "Cari Temanian sesuai kebutuhan dan lokasi." },
  { num: 3, title: "Pesan & Bayar", desc: "Pesan jasa dengan pembayaran aman via escrow." },
  { num: 4, title: "Bertemu & Beri Rating", desc: "Nikmati sesi dan berikan ulasan setelah selesai." },
];

const SECURITY = [
  "Verifikasi KTP + Selfie",
  "Pembayaran Bertahap",
  "Privasi & Keamanan Aman",
  "Konfirmasi Sesi",
  "Sistem Laporan",
  "Ulasan Terpercaya",
];

const TESTIMONIALS = [
  {
    quote:
      "Awalnya ragu, tapi prosesnya aman dan Temanian-nya ramah banget. Cocok buat yang butuh temen nonton atau jalan.",
    name: "Diah Ayu",
    role: "Pengguna",
  },
  {
    quote:
      "Fitur curhat anonimnya membantu banget. Rasanya didengar tanpa takut di-judge.",
    name: "Rafi Ananda",
    role: "Pengguna",
  },
  {
    quote:
      "Sebagai provider, dashboard-nya jelas dan pembayaran cair setelah sesi selesai.",
    name: "Sari Dewi",
    role: "Provider",
  },
];

function LandingNavbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/masuk", { replace: true });
  };

  const dashboardPath =
    user?.role === "penyedia" ? "/dashboard-penyedia" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 px-4 md:px-8 py-4 bg-[#FFFCF9]/90 backdrop-blur-md">
      <div className="max-w-[1236px] mx-auto bg-[#FCE7F3] rounded-[30px] px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-6">
        <Link to="/" className="flex-shrink-0">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
            alt="Temenin Logo"
            className="h-10 sm:h-12 w-auto"
          />
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <input
            type="search"
            placeholder="Cari layanan atau Temanian..."
            className="w-full h-10 px-4 rounded-full border border-[#FBCFE8] bg-white text-sm text-[#2C1810] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
          />
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link
              to={dashboardPath}
              className="hidden sm:inline px-4 py-2 rounded-[10px] text-[#4C1D95] font-semibold text-sm hover:bg-white/60 transition-colors"
            >
              Dashboard
            </Link>
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-xs sm:text-sm border border-[#F9A8D4]"
              title={user?.name}
            >
              {user?.initials}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#E91E8C] border border-[#FBCFE8] bg-white hover:bg-[#FDF4FF] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link
              to="/masuk"
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-[10px] border border-[#E91E8C] bg-[#F5EBE0] text-[#E91E8C] font-semibold text-sm sm:text-base hover:bg-[#fce7f3] transition-colors"
            >
              Masuk
            </Link>
            <Link
              to="/daftar"
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-[10px] border border-[#7C3AED] text-white font-semibold text-sm sm:text-base bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity"
            >
              Daftar Sekarang
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function Index() {
  return (
    <div className="font-['Poppins',sans-serif] bg-[#FFFCF9] overflow-x-hidden">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative px-4 md:px-8 pt-8 pb-16 overflow-hidden">
        <div className="absolute top-[-80px] right-[5%] w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#EDE9FE] pointer-events-none" />
        <div className="absolute top-[120px] left-[-60px] w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#EDE9FE] pointer-events-none" />
        <div className="absolute top-[400px] right-[20%] w-[240px] h-[240px] rounded-full bg-[#FFF0F8] pointer-events-none" />

        <div className="relative max-w-[1236px] mx-auto z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-3 border border-[#C8007A] rounded-[10px] px-4 py-2.5 mb-6">
              <div className="w-4 h-4 rounded-full bg-[#7C3AED] flex-shrink-0" />
              <span className="text-[#4C1D95] text-sm md:text-base">
                10.000+ Temanian Aktif Se-Indonesia
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              <span className="text-[#2C1810]">Gak Mau Sendirian? </span>
              <span className="text-[#4C1D95]">Yuk Temenin Yuk</span>
            </h1>

            <p className="text-[#2C1810] text-base md:text-lg leading-relaxed max-w-xl mb-8">
              Temukan teman aktivitas, teman curhat, atau bantuan sehari-hari dari
              Temanian terverifikasi di sekitarmu.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                to="/daftar"
                className="px-8 py-4 rounded-[10px] text-white font-semibold text-base bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity"
              >
                Cari Teman Sekarang
              </Link>
              <a
                href="#layanan"
                className="px-8 py-4 rounded-[10px] border border-[#7C3AED] text-[#7C3AED] font-semibold text-base hover:bg-[#FDF4FF] transition-colors"
              >
                Lihat Layanan
              </a>
            </div>
          </div>

          <div className="relative hidden lg:block min-h-[320px]">
            {HERO_TAGS.map((tag, i) => (
              <span
                key={tag}
                className="absolute px-5 py-2.5 rounded-full bg-[#F5EBE0] border border-[#E91E8C]/30 text-[#4C1D95] font-medium text-sm shadow-sm"
                style={{
                  top: `${15 + i * 22}%`,
                  left: `${10 + (i % 2) * 35}%`,
                }}
              >
                {tag}
              </span>
            ))}
            <div className="absolute bottom-8 right-8 w-32 h-32 rounded-full bg-[#FDF4FF] border border-[#FBCFE8] flex items-center justify-center">
              <Users className="w-12 h-12 text-[#E91E8C]" />
            </div>
          </div>
        </div>

        <div className="relative max-w-[1236px] mx-auto z-10 mt-4">
          <hr className="border-[#E91E8C]/30 mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "10K+", label: "Teman Aktif" },
              { value: "8K+", label: "Sesi Selesai" },
              { value: "4.7 ★", label: "Rating Rata-rata" },
              { value: "83", label: "Kota Jangkauan" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[#4C1D95]">
                  {stat.value}
                </p>
                <p className="text-[#94A3B8] text-sm md:text-base mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layanan */}
      <section id="layanan" className="bg-[#FAF5F0] px-4 md:px-8 py-16">
        <div className="max-w-[1236px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-2">
            Layanan Kami
          </h2>
          <p className="text-[#94A3B8] text-lg mb-10">
            3 Cara TEMENIN membantumu
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-[30px] border border-[#E91E8C]/40 p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-[#FFF0F8] flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-[#E91E8C]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C1810] mb-2">
                  {service.title}
                </h3>
                <p className="text-[#94A3B8] text-sm mb-3">{service.desc}</p>
                <p className="text-2xl font-bold text-[#4C1D95] mb-4">
                  {service.price}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#FDF4FF] text-[#E91E8C] text-xs font-medium border border-[#FBCFE8]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kenapa Pilih Kami */}
      <section className="relative px-4 md:px-8 py-16 overflow-hidden">
        <div className="absolute top-0 right-[5%] w-[300px] h-[300px] rounded-full bg-[#EDE9FE] pointer-events-none opacity-60" />
        <div className="absolute bottom-0 left-[-80px] w-[300px] h-[300px] rounded-full bg-[#FFF0F8] pointer-events-none" />

        <div className="relative max-w-[1236px] mx-auto z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-2">
            Kenapa Pilih Kami?
          </h2>
          <p className="text-[#94A3B8] text-lg mb-10">
            Platform yang bisa kamu percaya
          </p>
          <div className="flex flex-col gap-4">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="bg-[#FAF5F0] rounded-[20px] border border-[#E91E8C]/30 px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#FFF0F8] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-7 h-7 text-[#E91E8C]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#2C1810] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[#94A3B8] text-sm sm:text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="bg-[#FAF5F0] px-4 md:px-8 py-16">
        <div className="max-w-[1236px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-2">
            Cara Kerja
          </h2>
          <p className="text-[#94A3B8] text-lg mb-10">Sangat mudah & simpel</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-[24px] border border-[#FBCFE8] p-6 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#E91E8C] to-[#A131CC] text-white font-bold flex items-center justify-center mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-[#2C1810] mb-2">
                  {step.title}
                </h3>
                <p className="text-[#94A3B8] text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keamanan */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-[1236px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-2">
            Keamanan
          </h2>
          <p className="text-[#94A3B8] text-lg mb-10">
            Sistem Perisai Kepercayaan
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-[#F3E8FF] p-5 shadow-sm flex items-center gap-3"
              >
                <Shield className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
                <p className="text-[#2C1810] font-medium text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="bg-[#FAF5F0] px-4 md:px-8 py-16">
        <div className="max-w-[1236px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-10">
            Kata mereka tentang TEMENIN
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-[24px] border border-[#FBCFE8] p-6 shadow-sm"
              >
                <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-xs">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[#2C1810] font-bold text-sm">{t.name}</p>
                    <p className="text-[#94A3B8] text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tentang */}
      <section className="relative px-4 md:px-8 py-16 overflow-hidden">
        <div className="absolute top-[20%] right-[-5%] w-[320px] h-[320px] rounded-full bg-[#EDE9FE] pointer-events-none opacity-50" />
        <div className="relative max-w-[1236px] mx-auto z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] leading-tight mb-6">
              Dibangun karena kami pernah merasakan kesepian
            </h2>
            <p className="text-[#64748B] text-base leading-relaxed mb-8">
              TEMENIN hadir untuk menghubungkan orang yang butuh teman — untuk
              hangout, curhat, atau bantuan aktivitas sehari-hari. Kami percaya
              setiap orang berhak merasa didampingi, dengan aman dan nyaman.
            </p>
            <Link
              to="/daftar"
              className="inline-block px-10 py-4 rounded-[10px] text-white font-semibold text-lg bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity"
            >
              Daftar Sekarang
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {["Visi Kami", "Misi Kami", "Tim Kami"].map((title) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-[#FBCFE8] px-6 py-5 shadow-sm"
              >
                <h3 className="text-[#4C1D95] font-bold text-lg mb-1">
                  {title}
                </h3>
                <p className="text-[#94A3B8] text-sm">
                  {title === "Visi Kami" &&
                    "Menjadi platform temani terpercaya di Indonesia."}
                  {title === "Misi Kami" &&
                    "Menghubungkan pengguna dengan Temanian terverifikasi secara aman."}
                  {title === "Tim Kami" &&
                    "Dibangun oleh orang-orang yang peduli kesehatan mental & sosial."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C1810] text-white px-4 md:px-8 py-12">
        <div className="max-w-[1236px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
                alt="Temenin"
                className="h-10 w-auto mb-3 brightness-0 invert opacity-90"
              />
              <p className="text-white/70 text-sm">TEMENIN</p>
            </div>
            {[
              {
                title: "Produk",
                links: ["Jasa Temenin", "Jasa Curhat", "Jasa Bantu"],
              },
              {
                title: "Perusahaan",
                links: ["Tentang Kami", "Karir", "Blog"],
              },
              {
                title: "Hubungi Kami",
                links: ["help@temenin.id", "Instagram", "Twitter"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-white/60 text-sm hover:text-white transition-colors cursor-pointer">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © 2024 TEMENIN. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-[#FACC15]">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-white/70 text-sm">4.7 rating platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
