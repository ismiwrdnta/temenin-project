import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getStoredToken } from "@/lib/authApi";

type ServiceCategory = "temenin" | "curhat" | "bantu_aktivitas";

const SERVICE_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: "temenin", label: "Jasa Temenin" },
  { value: "curhat", label: "Jasa Curhat" },
  { value: "bantu_aktivitas", label: "Jasa Bantu Aktivitas" },
];

const INTEREST_OPTIONS = [
  "Olahraga",
  "Musik",
  "Kuliner",
  "Seni",
  "Teknologi",
  "Pendidikan",
];

const PROVINCE_OPTIONS = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Bali",
];

const CITY_OPTIONS: Record<string, string[]> = {
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat"],
  "Jawa Barat": ["Bandung", "Bogor", "Depok"],
  "Jawa Tengah": ["Semarang", "Solo", "Magelang"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo"],
  Bali: ["Denpasar", "Badung", "Gianyar"],
};

const DISTRICT_OPTIONS: Record<string, string[]> = {
  "Jakarta Pusat": ["Menteng", "Gambir", "Tanah Abang"],
  "Jakarta Selatan": ["Kebayoran Baru", "Tebet", "Pasar Minggu"],
  Bandung: ["Coblong", "Cicendo", "Sukajadi"],
  Surabaya: ["Gubeng", "Wonokromo", "Tegalsari"],
};

export default function DaftarProvider() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState<ServiceCategory | "">("");
  const [interest, setInterest] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cityOptions = province ? (CITY_OPTIONS[province] ?? []) : [];
  const districtOptions = city ? (DISTRICT_OPTIONS[city] ?? ["Lainnya"]) : [];

  async function handleSubmit() {
    if (!isAuthenticated) {
      navigate("/daftar");
      return;
    }

    if (!service) {
      setServerError("Pilih jenis jasa yang kamu tawarkan.");
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    try {
      const token = getStoredToken();
      const areaParts = [province, city, district].filter(Boolean);
      const res = await fetch("/api/providers/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          categories: [service],
          area_description: areaParts.join(", "),
          bio: interest ? `Minat: ${interest}` : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Gagal menyimpan profil provider.");
      }

      navigate("/dashboard-penyedia");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Gagal menyimpan profil provider.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-['Poppins',sans-serif] relative overflow-hidden flex flex-col items-center px-4 py-10">
      <div className="pointer-events-none absolute top-[-80px] right-[-60px] w-[220px] h-[220px] md:w-[380px] md:h-[380px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute top-[200px] left-[-80px] w-[220px] h-[220px] md:w-[380px] md:h-[380px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute bottom-[80px] right-[30%] w-[200px] h-[200px] md:w-[360px] md:h-[360px] rounded-full bg-[#FFF0F8]" />
      <div className="pointer-events-none absolute bottom-[-60px] left-[-40px] w-[200px] h-[200px] md:w-[340px] md:h-[340px] rounded-full bg-[#EDE9FE]" />

      <div className="relative z-10 w-full max-w-[706px] flex flex-col items-center">
        <Link to="/">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/204a9c97054fe9fbe2b19613c323c412af8bb108?width=300"
            alt="Temenin Logo"
            className="h-28 md:h-36 w-auto mb-4"
          />
        </Link>

        <p className="text-[#2C1810] text-base md:text-lg font-normal text-center mb-8">
          Isi preferensi jasa yang kamu tawarkan
        </p>

        {serverError && (
          <div className="w-full px-4 py-3 mb-5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
            {serverError}
          </div>
        )}

        <div className="w-full flex flex-col gap-5 mb-8">
          <div className="w-full">
            <p className="text-black text-lg md:text-2xl font-normal mb-3">Pilihan Jasa</p>
            <div className="relative w-full">
              <select
                value={service}
                onChange={(e) => setService(e.target.value as ServiceCategory | "")}
                className="w-full appearance-none bg-[#F5EBE0] border border-black rounded-xl px-5 py-4 md:py-5 text-black text-base md:text-lg outline-none focus:border-[#7C3AED] transition-colors cursor-pointer"
              >
                <option value="" disabled>
                  Pilih Jasa
                </option>
                {SERVICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 18L6 10h16L14 18z" fill="#7C3AED"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full">
            <p className="text-black text-lg md:text-2xl font-normal mb-3">Preferensi dan Minat</p>
            <div className="relative w-full">
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full appearance-none bg-[#F5EBE0] border border-black rounded-xl px-5 py-4 md:py-5 text-black text-base md:text-lg outline-none focus:border-[#7C3AED] transition-colors cursor-pointer"
              >
                <option value="" disabled>
                  Pilih Preferensi dan Minat
                </option>
                {INTEREST_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 18L6 10h16L14 18z" fill="#7C3AED"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full">
            <p className="text-black text-lg md:text-2xl font-normal mb-3">Lokasi</p>
            <div className="w-full grid grid-cols-3 rounded-xl overflow-hidden border border-black bg-[#F5EBE0]">
              <div className="relative border-r border-black">
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setCity("");
                    setDistrict("");
                  }}
                  className="w-full appearance-none bg-transparent px-3 py-4 md:py-5 text-black text-sm md:text-base outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Provinsi
                  </option>
                  {PROVINCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative border-r border-black">
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict("");
                  }}
                  disabled={!province}
                  className="w-full appearance-none bg-transparent px-3 py-4 md:py-5 text-black text-sm md:text-base outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>
                    Kota
                  </option>
                  {cityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!city}
                  className="w-full appearance-none bg-transparent px-3 py-4 md:py-5 text-black text-sm md:text-base outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>
                    Kecamatan
                  </option>
                  {districtOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/daftar")}
            className="py-4 rounded-xl text-white font-semibold text-base md:text-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
          >
            Kembali
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="py-4 rounded-xl text-white font-semibold text-base md:text-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
          >
            {isSubmitting ? "Menyimpan..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
