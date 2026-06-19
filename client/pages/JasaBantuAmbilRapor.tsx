import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Download,
  Home,
  Lock,
  MapPin,
  Search,
  Smartphone,
  Upload,
} from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import LocationPickerMap, {
  type PickedLocation,
} from "@/components/LocationPickerMap";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/data/orders";
import {
  type AmbilRaporRequest,
  isAmbilRaporRequestComplete,
} from "@/lib/ambil-rapor-request";
import { cn } from "@/lib/utils";

const BASE_PRICE = 50_000;
const DELIVERY_HOME_EXTRA = 15_000;

const CARA_KERJA = [
  {
    step: 1,
    text: "Isi detail sekolah & jadwal — nama sekolah, kelas, dan tanggal pembagian rapor",
  },
  {
    step: 2,
    text: "Upload surat kuasa — template kami sediakan, tinggal tanda tangan & upload",
  },
  {
    step: 3,
    text: "Helper berangkat & ambil rapor — lacak status secara real-time di aplikasi",
  },
  {
    step: 4,
    text: "Rapor dikirim foto / diantar ke rumah — helper kirim foto via chat atau antar fisik",
  },
] as const;

type DeliveryMethod = "foto" | "antar";

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-2">
      {children}
    </label>
  );
}

function FormInput({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#2C1810] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#5EEAD4]"
    />
  );
}

export default function JasaBantuAmbilRapor() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated, isLoading } = useAuth();

  const saved = location.state as AmbilRaporRequest | null;

  const [schoolName, setSchoolName] = useState(saved?.schoolName ?? "");
  const [studentInfo, setStudentInfo] = useState(saved?.studentInfo ?? "");
  const [reportDate, setReportDate] = useState(saved?.reportDate ?? "");
  const [schoolAddress, setSchoolAddress] = useState(saved?.schoolAddress ?? "");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    saved?.deliveryMethod ?? "foto",
  );
  const [notes, setNotes] = useState(saved?.notes ?? "");
  const [powerOfAttorneyFile, setPowerOfAttorneyFile] = useState<File | null>(
    null,
  );
  const [powerOfAttorneyFileName, setPowerOfAttorneyFileName] = useState(
    saved?.powerOfAttorneyFileName ?? "",
  );
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState("");

  const totalPrice = useMemo(() => {
    return deliveryMethod === "antar"
      ? BASE_PRICE + DELIVERY_HOME_EXTRA
      : BASE_PRICE;
  }, [deliveryMethod]);

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

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) return;
    setPowerOfAttorneyFile(file);
    setPowerOfAttorneyFileName(file.name);
    setFormError("");
  };

  const handleFindHelper = () => {
    const request: AmbilRaporRequest = {
      schoolName: schoolName.trim(),
      studentInfo: studentInfo.trim(),
      reportDate,
      schoolAddress: schoolAddress.trim(),
      deliveryMethod,
      notes: notes.trim(),
      totalPrice,
      powerOfAttorneyFileName:
        powerOfAttorneyFile?.name ?? powerOfAttorneyFileName,
    };

    if (!isAmbilRaporRequestComplete(request)) {
      setFormError(
        "Lengkapi semua field wajib dan upload surat kuasa sebelum mencari helper.",
      );
      return;
    }

    navigate("/jasa-bantu/ambil-rapor/helper", { state: request });
  };

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickedLocation(next);
        setFormError("");
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          <div className="flex items-start gap-4 mb-6">
            <Link
              to="/jasa-bantu"
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Ambil Rapor
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Rp 50rb/aktivitas
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#93C5FD] bg-[#EFF6FF] px-5 py-4 sm:px-6 sm:py-5 mb-6">
            <h2 className="text-[#1E40AF] font-bold text-base mb-4">
              Cara Kerja
            </h2>
            <ol className="space-y-3">
              {CARA_KERJA.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-3 text-[#1E3A8A] text-sm leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 mb-6 shadow-sm">
            <h2 className="text-[#2C1810] font-bold text-base sm:text-lg mb-5">
              Detail Permintaan
            </h2>

            <div className="space-y-5">
              <div>
                <FormLabel>Nama Sekolah</FormLabel>
                <FormInput
                  placeholder="Contoh: SDN 01 Menteng"
                  value={schoolName}
                  onChange={setSchoolName}
                />
              </div>

              <div>
                <FormLabel>Nama Siswa & Kelas</FormLabel>
                <FormInput
                  placeholder="Contoh: Budi Santoso - Kelas 5A"
                  value={studentInfo}
                  onChange={setStudentInfo}
                />
              </div>

              <div>
                <FormLabel>Tanggal Pembagian Rapor</FormLabel>
                <div className="relative">
                  <FormInput
                    type="date"
                    placeholder="dd/mm/yyyy"
                    value={reportDate}
                    onChange={setReportDate}
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>

              <div>
                <FormLabel>Alamat Sekolah</FormLabel>
                <FormInput
                  placeholder="Masukkan alamat lengkap sekolah"
                  value={schoolAddress}
                  onChange={setSchoolAddress}
                />
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[#64748B] text-xs font-medium">
                      Pilih lokasi sekolah di peta (klik untuk menandai)
                    </p>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#5EEAD4] bg-white text-[#0D9488] text-xs font-semibold hover:bg-[#F0FDFA] transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Gunakan lokasiku
                    </button>
                  </div>
                  <LocationPickerMap
                    value={pickedLocation}
                    onChange={(next) => {
                      setPickedLocation(next);
                      setFormError("");
                    }}
                    markerLabel="Sekolah"
                  />
                  {pickedLocation && (
                    <p className="text-[#94A3B8] text-xs mt-2">
                      Koordinat: {pickedLocation.lat.toFixed(6)},{" "}
                      {pickedLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <FormLabel>Metode Pengiriman Rapor</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("foto")}
                    className={cn(
                      "h-14 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-semibold transition-colors",
                      deliveryMethod === "foto"
                        ? "border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]"
                        : "border-[#E5E7EB] bg-white text-[#64748B] hover:border-[#5EEAD4]",
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                    Foto via chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("antar")}
                    className={cn(
                      "h-14 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-semibold transition-colors",
                      deliveryMethod === "antar"
                        ? "border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]"
                        : "border-[#E5E7EB] bg-white text-[#64748B] hover:border-[#5EEAD4]",
                    )}
                  >
                    <Home className="w-4 h-4" />
                    Antar ke Rumah +Rp15rb
                  </button>
                </div>
              </div>

              <div>
                <FormLabel>Upload Surat Kuasa *WAJIB</FormLabel>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFile(e.dataTransfer.files[0]);
                  }}
                  className={cn(
                    "rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
                    isDragging
                      ? "border-[#0D9488] bg-[#F0FDFA]"
                      : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#5EEAD4]",
                  )}
                >
                  <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-[#64748B] text-sm mb-1">
                    {(powerOfAttorneyFile?.name ?? powerOfAttorneyFileName) ||
                      "Klik atau drag & drop file"}
                  </p>
                  <p className="text-[#94A3B8] text-xs mb-4">
                    pdf, jpg, png — Max 5 MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#5EEAD4] bg-white text-[#0D9488] text-sm font-semibold hover:bg-[#F0FDFA] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Template Surat Kuasa
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
              </div>

              <div>
                <FormLabel>Catatan Tambahan</FormLabel>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Rapor ada 2 anak, nama anak kedua..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#2C1810] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#5EEAD4] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#5EEAD4] bg-[#F0FDFA] p-5 sm:p-6 mb-6">
            <h2 className="text-[#0F766E] font-bold text-base mb-4">
              Ringkasan Biaya
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#64748B]">Jasa Ambil Rapor</span>
                <span className="text-[#2C1810] font-medium">
                  {formatRupiah(BASE_PRICE)}
                </span>
              </div>
              {deliveryMethod === "antar" && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#64748B]">Antar ke Rumah</span>
                  <span className="text-[#2C1810] font-medium">
                    {formatRupiah(DELIVERY_HOME_EXTRA)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Dana Titipan Aman
                </span>
                <span className="text-[#0D9488] text-xs font-medium">
                  Ditahan hingga selesai
                </span>
              </div>
              <div className="border-t border-dashed border-[#5EEAD4] pt-3 flex items-center justify-between gap-4">
                <span className="text-[#2C1810] font-bold">Total</span>
                <span className="text-[#0D9488] font-bold text-lg">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {formError && (
            <p className="text-[#DC2626] text-sm mb-4">{formError}</p>
          )}

          <button
            type="button"
            onClick={handleFindHelper}
            className="w-full py-4 rounded-xl border-2 border-[#2C1810] bg-white text-[#2C1810] font-semibold text-base hover:bg-[#F5EBE0] transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Cari Helper Terdekat
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
