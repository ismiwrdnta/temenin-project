import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ProviderNavbar from "@/components/ProviderNavbar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const SERVICE_OPTIONS = [
  "Jasa Temenin",
  "Jasa Curhat",
  "Jasa Bantu Aktivitas",
];

const INTEREST_OPTIONS = ["Olahraga", "Cafe", "Musik", "Travel", "Kuliner"];

const PROVINCES = ["Sumatera Barat", "DKI Jakarta", "Jawa Barat"];
const CITIES: Record<string, string[]> = {
  "Sumatera Barat": ["Padang Panjang", "Padang", "Bukittinggi"],
  "DKI Jakarta": ["Jakarta Selatan", "Jakarta Pusat"],
  "Jawa Barat": ["Bandung", "Bogor"],
};
const DISTRICTS: Record<string, string[]> = {
  "Padang Panjang": ["Padang Panjang Timur", "Padang Panjang Barat"],
  Padang: ["Koto Tangah", "Padang Utara"],
  Bandung: ["Coblong", "Bandung Wetan"],
};

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="w-full py-3 px-5 rounded-xl text-white font-bold text-base sm:text-lg bg-gradient-to-r from-[#E91E8C] to-[#A131CC]">
      {title}
    </div>
  );
}

function TagSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option],
    );
  };

  return (
    <div className="relative">
      <label className="block text-[#2C1810] font-semibold text-sm sm:text-base mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full min-h-[52px] bg-[#F5EBE0] border border-[#2C1810] rounded-xl px-4 py-3 flex items-center justify-between gap-2 text-left"
      >
        <div className="flex flex-wrap gap-2 flex-1">
          {selected.length > 0 ? (
            selected.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg bg-white border border-[#E9D5FF] text-[#2C1810] text-sm font-medium"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[#94A3B8] text-sm">Pilih...</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-[#7C3AED] flex-shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#FBCFE8] rounded-xl shadow-lg py-2 max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-[#FDF4FF] transition-colors",
                selected.includes(option)
                  ? "text-[#7C3AED] font-semibold"
                  : "text-[#2C1810]",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilPenyedia() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "081234567890",
    password: "",
    services: ["Jasa Temenin", "Jasa Curhat"],
    interests: ["Olahraga", "Cafe"],
    province: "Sumatera Barat",
    city: "Padang Panjang",
    district: "Padang Panjang Timur",
  });

  const [saved, setSaved] = useState(false);

  if (user && user.role !== "penyedia") {
    return <Navigate to="/dashboard" replace />;
  }

  const cities = CITIES[form.province] ?? [];
  const districts = DISTRICTS[form.city] ?? [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-[#EDE9FE] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#EDE9FE] rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[40%] left-[15%] w-[25%] h-[25%] bg-[#FFF0F8] rounded-full blur-3xl opacity-50" />
      </div>

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <ProviderNavbar activePage="profil" />

          <form onSubmit={handleSave} className="mt-8 max-w-5xl mx-auto space-y-8">
            {/* Informasi Umum */}
            <section>
              <SectionHeader title="Informasi Umum" />
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">
                <div className="aspect-square max-w-[220px] mx-auto lg:mx-0 w-full rounded-2xl border-2 border-[#E91E8C] bg-[#FAFAFA] flex items-center justify-center">
                  <span className="text-[#94A3B8] text-sm font-medium text-center px-4">
                    Profile picture
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#2C1810] font-semibold text-sm sm:text-base mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full bg-[#F5EBE0] border border-[#2C1810] rounded-xl px-4 py-3.5 text-[#2C1810] text-sm sm:text-base outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#2C1810] font-semibold text-sm sm:text-base mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full bg-[#F5EBE0] border border-[#2C1810] rounded-xl px-4 py-3.5 text-[#2C1810] text-sm sm:text-base outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#2C1810] font-semibold text-sm sm:text-base mb-2">
                      No HP
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full bg-[#F5EBE0] border border-[#2C1810] rounded-xl px-4 py-3.5 text-[#2C1810] text-sm sm:text-base outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#2C1810] font-semibold text-sm sm:text-base mb-2">
                      Password (Min. 8 Karakter)
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full bg-[#F5EBE0] border border-[#2C1810] rounded-xl px-4 py-3.5 text-[#2C1810] text-sm sm:text-base outline-none focus:border-[#7C3AED] transition-colors placeholder:text-[#94A3B8]"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Detail Layanan */}
            <section>
              <SectionHeader title="Detail Layanan" />
              <div className="mt-4 space-y-5">
                <TagSelect
                  label="Pilihan Jasa"
                  options={SERVICE_OPTIONS}
                  selected={form.services}
                  onChange={(services) => setForm({ ...form, services })}
                />

                <TagSelect
                  label="Preferensi dan Minat"
                  options={INTEREST_OPTIONS}
                  selected={form.interests}
                  onChange={(interests) => setForm({ ...form, interests })}
                />

                <div>
                  <label className="block text-[#2C1810] font-semibold text-sm sm:text-base mb-2">
                    Lokasi
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative">
                      <select
                        value={form.province}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            province: e.target.value,
                            city: CITIES[e.target.value]?.[0] ?? "",
                            district: "",
                          })
                        }
                        className="w-full appearance-none bg-[#F5EBE0] border border-[#2C1810] rounded-xl px-4 py-3.5 text-[#2C1810] text-sm outline-none focus:border-[#7C3AED] pr-10"
                      >
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7C3AED] pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        value={form.city}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            city: e.target.value,
                            district: DISTRICTS[e.target.value]?.[0] ?? "",
                          })
                        }
                        className="w-full appearance-none bg-[#F5EBE0] border border-[#2C1810] rounded-xl px-4 py-3.5 text-[#2C1810] text-sm outline-none focus:border-[#7C3AED] pr-10"
                      >
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7C3AED] pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        value={form.district}
                        onChange={(e) =>
                          setForm({ ...form, district: e.target.value })
                        }
                        className="w-full appearance-none bg-[#F5EBE0] border border-[#2C1810] rounded-xl px-4 py-3.5 text-[#2C1810] text-sm outline-none focus:border-[#7C3AED] pr-10"
                      >
                        {(districts.length > 0
                          ? districts
                          : [form.district]
                        ).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7C3AED] pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {saved && (
              <p className="text-center text-[#16A34A] text-sm font-medium">
                Perubahan berhasil disimpan!
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 pb-8">
              <button
                type="button"
                onClick={() => navigate("/dashboard-penyedia")}
                className="px-10 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-10 py-3.5 rounded-xl text-white font-semibold text-sm sm:text-base bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
