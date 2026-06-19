import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Info,
  Lock,
  MapPin,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import LocationPickerMap, {
  type PickedLocation,
} from "@/components/LocationPickerMap";
import { useAuth } from "@/context/AuthContext";
import { ANTRI_HELPERS, type AntriHelper } from "@/data/antri-helpers";
import { formatRupiah } from "@/data/orders";
import {
  ANTRI_DURATION_OPTIONS,
  ANTRI_HOURLY_RATE,
  calculateAntriPricing,
  formatAntriDateTime,
  isAntriRequestComplete,
  type AntriDurationHours,
} from "@/lib/antri-mewakili-request";
import { cn } from "@/lib/utils";

const STEPS = ["Lokasi", "Detail", "Pilih Helper", "Konfirmasi"] as const;

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-2">
      {children}
    </label>
  );
}

function Stepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < activeStep;
        const isActive = stepNumber === activeStep;

        return (
          <div key={step} className="flex items-center flex-1 min-w-[72px]">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                  isDone
                    ? "bg-[#22C55E] border-[#22C55E] text-white"
                    : isActive
                      ? "bg-[#E91E8C] border-[#E91E8C] text-white"
                      : "bg-white border-[#E5E7EB] text-[#94A3B8]",
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-semibold text-center",
                  isActive ? "text-[#E91E8C]" : "text-[#94A3B8]",
                )}
              >
                {step}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 sm:mx-2 mb-6",
                  stepNumber < activeStep ? "bg-[#22C55E]" : "bg-[#E5E7EB]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function QueueVisualization() {
  const positions = [
    "bg-[#CBD5E1]",
    "bg-[#CBD5E1]",
    "bg-[#E91E8C]",
    "bg-[#CBD5E1]",
    "bg-[#CBD5E1]",
    "border-2 border-dashed border-[#E91E8C] bg-white",
    "bg-[#CBD5E1]",
    "bg-[#CBD5E1]",
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] px-4 py-3 text-center">
        <p className="text-[#7C3AED] font-bold text-2xl">~45 menit</p>
        <p className="text-[#64748B] text-xs mt-1">
          rata-rata waktu tunggu di lokasi ini hari kerja pukul 07.30
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap py-2">
        {positions.map((style, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={cn("w-8 h-8 rounded-full", style)} />
            {i === 2 && (
              <span className="text-[10px] font-semibold text-[#E91E8C]">
                Helper
              </span>
            )}
            {i === 5 && (
              <span className="text-[10px] font-semibold text-[#E91E8C]">
                A-047 Kamu
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-3 flex gap-2">
        <Info className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
        <p className="text-[#1E40AF] text-xs leading-relaxed">
          Helper mengirim update posisi antrian setiap 5 menit. Kamu akan
          mendapat notifikasi saat tersisa 5 orang lagi di depanmu.
        </p>
      </div>
    </div>
  );
}

function AntriHelperCard({
  helper,
  selected,
  onSelect,
}: {
  helper: AntriHelper;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border-2 p-4 sm:p-5 text-left transition-all bg-white",
        selected
          ? "border-[#E91E8C] ring-2 ring-[#E91E8C]/20 shadow-md"
          : "border-[#E5E7EB] hover:border-[#FBCFE8]",
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0",
            helper.avatarBg,
          )}
        >
          {helper.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[#2C1810] font-bold">{helper.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold">
                  Verified
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#CCFBF1] text-[#0D9488] text-xs font-semibold">
                  {helper.completedQueues} antrian selesai
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[#E91E8C] font-bold">{helper.price}/jam</p>
              {helper.available && (
                <p className="text-[#16A34A] text-xs font-semibold mt-1">
                  Tersedia
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 text-sm text-[#64748B]">
            <span>
              <span className="font-bold text-[#2C1810]">
                {helper.rating.toFixed(2)}
              </span>{" "}
              ({helper.reviews} Ulasan)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {helper.distanceKm} km
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function JasaBantuAntriMewakili() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [location, setLocation] = useState("");
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(
    null,
  );
  const [queueDate, setQueueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationHours, setDurationHours] = useState<AntriDurationHours>(2);
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedHelperId, setSelectedHelperId] = useState(
    ANTRI_HELPERS[0]?.id ?? 1,
  );
  const [formError, setFormError] = useState("");

  const pricing = useMemo(
    () => calculateAntriPricing(durationHours),
    [durationHours],
  );

  const selectedHelper = ANTRI_HELPERS.find((h) => h.id === selectedHelperId);

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

  const handleOrder = () => {
    const request = {
      location: location.trim(),
      queueDate,
      startTime,
      durationHours,
      purpose: purpose.trim(),
      notes: notes.trim(),
      ...pricing,
    };

    if (!isAntriRequestComplete(request) || !selectedHelper) {
      setFormError("Lengkapi semua field wajib dan pilih helper terlebih dahulu.");
      return;
    }

    navigate("/jasa-bantu/antri-mewakili/pembayaran", {
      state: {
        service: "antri-mewakili",
        request,
        helperId: selectedHelper.id,
      },
    });
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
                Antri Mewakili
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Helper antri di tempat umum mewakilimu — kamu tinggal datang
                saat nomor dipanggil.
              </p>
            </div>
          </div>

          <Stepper activeStep={2} />

          <div className="rounded-2xl border border-[#5EEAD4] bg-[#F0FDFA] px-5 py-4 mb-6 flex gap-3">
            <Clock className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#0F766E] font-bold text-sm mb-1">
                Hemat Waktu dengan TEMENIN
              </p>
              <p className="text-[#0F766E] text-sm leading-relaxed">
                Helper akan antri di tempatmu, update posisi antrian secara
                real-time. Kamu bisa melakukan hal lain dan datang tepat waktu!
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 mb-6 shadow-sm">
            <h2 className="text-[#2C1810] font-bold text-base mb-5">
              Lokasi & Detail Antrian
            </h2>
            <div className="space-y-5">
              <div>
                <FormLabel>Tempat Antrian</FormLabel>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Kantor BPJS Kesehatan Buah Batu Bandung"
                  className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                />
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[#64748B] text-xs font-medium">
                      Pilih lokasi tempat antrian di peta (klik untuk menandai)
                    </p>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FBCFE8] bg-white text-[#E91E8C] text-xs font-semibold hover:bg-[#FFF0F8] transition-colors"
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
                    markerLabel="Antrian"
                  />
                  {pickedLocation && (
                    <p className="text-[#94A3B8] text-xs mt-2">
                      Koordinat: {pickedLocation.lat.toFixed(6)},{" "}
                      {pickedLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormLabel>Tanggal Antrian</FormLabel>
                  <input
                    type="date"
                    value={queueDate}
                    onChange={(e) => setQueueDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                  />
                </div>
                <div>
                  <FormLabel>Jam Mulai Antrian</FormLabel>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                  />
                </div>
              </div>
              <div>
                <FormLabel>Perkiraan Lama Antrian</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {ANTRI_DURATION_OPTIONS.map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setDurationHours(hours)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors",
                        durationHours === hours
                          ? "border-[#E91E8C] bg-[#FFF0F8] text-[#E91E8C]"
                          : "border-[#E5E7EB] bg-white text-[#64748B]",
                      )}
                    >
                      {hours} Jam
                    </button>
                  ))}
                </div>
                <p className="text-[#64748B] text-xs">
                  Estimasi: {formatRupiah(ANTRI_HOURLY_RATE)} x {durationHours}{" "}
                  jam = {formatRupiah(pricing.basePrice)}
                </p>
              </div>
              <div>
                <FormLabel>Keperluan Antrian</FormLabel>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Contoh: Perpanjang BPJS"
                  className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                />
              </div>
              <div>
                <FormLabel>Catatan Khusus Untuk Helper</FormLabel>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Bawa KTP asli, nomor antrian online A-047"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 mb-6 shadow-sm">
            <h2 className="text-[#2C1810] font-bold text-xs uppercase tracking-wide mb-4">
              Estimasi Kondisi Antrian
            </h2>
            <QueueVisualization />
          </div>

          <div className="mb-6">
            <h2 className="text-[#2C1810] font-bold text-base mb-4">
              Pilih Helper Terdekat
            </h2>
            <div className="flex flex-col gap-3">
              {ANTRI_HELPERS.map((helper) => (
                <AntriHelperCard
                  key={helper.id}
                  helper={helper}
                  selected={selectedHelperId === helper.id}
                  onSelect={() => setSelectedHelperId(helper.id)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#FBCFE8] bg-[#FFF0F8] p-5 sm:p-6 mb-6">
            <h2 className="text-[#2C1810] font-bold text-xs uppercase tracking-wide mb-4">
              Ringkasan Pesanan
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Layanan</span>
                <span className="text-[#2C1810] font-medium">Antri Mewakili</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Helper</span>
                <span className="text-[#2C1810] font-medium text-right">
                  {selectedHelper?.name ?? "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Lokasi</span>
                <span className="text-[#2C1810] font-medium text-right max-w-[55%] truncate">
                  {location || "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Tanggal & Jam</span>
                <span className="text-[#2C1810] font-medium text-right">
                  {formatAntriDateTime(queueDate, startTime)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Estimasi Durasi</span>
                <span className="text-[#2C1810] font-medium">
                  {durationHours} jam
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-dashed border-[#FBCFE8]">
                <span className="text-[#64748B]">Tarif</span>
                <span className="text-[#2C1810] font-medium">
                  {formatRupiah(ANTRI_HOURLY_RATE)} x {durationHours} jam ={" "}
                  {formatRupiah(pricing.basePrice)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B]">Komisi Platform (10%)</span>
                <span className="text-[#2C1810] font-medium">
                  {formatRupiah(pricing.commission)}
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-[#FBCFE8]">
                <span className="text-[#2C1810] font-bold">Total</span>
                <span className="text-[#E91E8C] font-bold text-xl">
                  {formatRupiah(pricing.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#FDE68A] bg-[#FEF3C7] px-4 py-3 mb-6 flex gap-3">
            <Lock className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
            <p className="text-[#92400E] text-xs sm:text-sm leading-relaxed">
              <span className="font-semibold">Dana Titipan Aman.</span> Pembayaran
              ditahan platform hingga aktivitas selesai dikonfirmasi. Refund 100%
              jika helper tidak datang.
            </p>
          </div>

          {formError && (
            <p className="text-[#DC2626] text-sm mb-4">{formError}</p>
          )}

          <button
            type="button"
            onClick={handleOrder}
            className="w-full py-4 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-[#E91E8C] to-[#A131CC] hover:opacity-90 transition-opacity"
          >
            Pesan Sekarang
          </button>
        </div>
      </main>
    </div>
  );
}
