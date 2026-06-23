import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import LocationPickerMap, {
  type PickedLocation,
} from "@/components/LocationPickerMap";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/data/orders";
import { cn } from "@/lib/utils";

const BASE_PRICE = 35_000;

const CARA_KERJA = [
  {
    step: 1,
    text: "Isi nama toko & daftar barang yang ingin dibeli beserta estimasi harga",
  },
  {
    step: 2,
    text: "Helper berangkat ke toko & foto barang sebelum membeli untuk konfirmasi",
  },
  {
    step: 3,
    text: "Harga barang dibayar langsung ke helper via transfer / tunai",
  },
  {
    step: 4,
    text: "Helper kirim barang ke alamatmu beserta struk bukti pembelian",
  },
] as const;

interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  estimatePrice: string;
}

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
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#2C1810] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#4ADE80]"
    />
  );
}

export default function JasaBantuBelanjaTitip() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: "1", name: "", qty: "1", estimatePrice: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null);
  const [formError, setFormError] = useState("");

  const totalEstimate = items.reduce((sum, item) => {
    return sum + (parseFloat(item.estimatePrice.replace(/\D/g, "")) || 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/masuk" replace />;
  if (user.role === "penyedia") return <Navigate to="/dashboard-penyedia" replace />;

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", qty: "1", estimatePrice: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof ShoppingItem,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  };

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickedLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setFormError("");
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleSubmit = () => {
    if (!storeName.trim()) {
      setFormError("Nama toko wajib diisi.");
      return;
    }
    if (items.some((i) => !i.name.trim())) {
      setFormError("Isi nama barang pada semua item belanjaan.");
      return;
    }
    if (!deliveryAddress.trim()) {
      setFormError("Alamat pengiriman wajib diisi.");
      return;
    }

    setFormError("");

    // Navigate ke pembayaran dengan membawa state
    navigate("/jasa-bantu/belanja-titip/pembayaran", {
      state: {
        service: "belanja-titip",
        storeName: storeName.trim(),
        storeAddress: storeAddress.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items,
        notes: notes.trim(),
        totalPrice: BASE_PRICE,
        totalEstimate,
        pickedLocation,
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
          {/* Header */}
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
                Belanja / Titip Beli
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Rp 35rb/pesanan · Radius 5 km
              </p>
            </div>
          </div>

          {/* Cara Kerja */}
          <div className="rounded-2xl border-2 border-[#86EFAC] bg-[#F0FDF4] px-5 py-4 sm:px-6 sm:py-5 mb-6">
            <h2 className="text-[#15803D] font-bold text-base mb-4">
              Cara Kerja
            </h2>
            <ol className="space-y-3">
              {CARA_KERJA.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-3 text-[#166534] text-sm leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-full bg-[#16A34A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 mb-6 shadow-sm space-y-6">
            <h2 className="text-[#2C1810] font-bold text-base sm:text-lg">
              Detail Permintaan
            </h2>

            {/* Nama Toko */}
            <div>
              <FormLabel>Nama Toko / Pasar</FormLabel>
              <FormInput
                placeholder="Contoh: Pasar Tradisional Ujungberung"
                value={storeName}
                onChange={setStoreName}
              />
            </div>

            {/* Alamat Toko */}
            <div>
              <FormLabel>Alamat Toko (opsional)</FormLabel>
              <FormInput
                placeholder="Contoh: Jl. AH Nasution No. 123, Bandung"
                value={storeAddress}
                onChange={setStoreAddress}
              />
            </div>

            {/* Daftar Belanjaan */}
            <div>
              <FormLabel>Daftar Barang yang Dibeli</FormLabel>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex gap-2 items-start bg-[#F8FAFC] rounded-xl p-3 border border-[#E5E7EB]"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">
                      {idx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_80px_110px] gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                        placeholder="Nama barang"
                        className="h-10 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#2C1810] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(item.id, "qty", e.target.value)
                        }
                        placeholder="Qty"
                        className="h-10 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#2C1810] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-xs">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.estimatePrice}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "estimatePrice",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          placeholder="Estimasi harga"
                          className="w-full h-10 pl-7 pr-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#2C1810] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="w-8 h-8 rounded-lg border border-[#FEE2E2] bg-white text-[#EF4444] flex items-center justify-center hover:bg-[#FEF2F2] disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 mt-1"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  className="w-full h-10 rounded-xl border-2 border-dashed border-[#86EFAC] text-[#16A34A] text-sm font-medium hover:bg-[#F0FDF4] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Barang
                </button>
              </div>
              {totalEstimate > 0 && (
                <p className="text-[#64748B] text-xs mt-2">
                  Total estimasi harga barang:{" "}
                  <span className="font-semibold text-[#16A34A]">
                    {formatRupiah(totalEstimate)}
                  </span>{" "}
                  (dibayar terpisah ke helper)
                </p>
              )}
            </div>

            {/* Alamat Pengiriman */}
            <div>
              <FormLabel>Alamat Pengiriman Barang</FormLabel>
              <FormInput
                placeholder="Alamat rumah / kantor kamu"
                value={deliveryAddress}
                onChange={setDeliveryAddress}
              />
              <div className="mt-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-[#64748B] text-xs font-medium">
                    Tandai lokasi pengiriman di peta
                  </p>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#86EFAC] bg-white text-[#16A34A] text-xs font-semibold hover:bg-[#F0FDF4] transition-colors"
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
                  markerLabel="Kirim"
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <FormLabel>
                <MessageSquare className="w-3 h-3 inline mr-1" />
                Catatan Tambahan (opsional)
              </FormLabel>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: kalau barang habis, pilih brand alternatif..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#2C1810] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#4ADE80] resize-none"
              />
            </div>
          </div>

          {/* Ringkasan Biaya */}
          <div className="rounded-2xl border border-[#86EFAC] bg-[#F0FDF4] p-5 sm:p-6 mb-6">
            <h2 className="text-[#15803D] font-bold text-base mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Ringkasan Biaya
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Jasa Belanja / Titip Beli
                </span>
                <span className="text-[#2C1810] font-medium">
                  {formatRupiah(BASE_PRICE)}
                </span>
              </div>
              {totalEstimate > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#64748B]">
                    Estimasi harga barang *
                  </span>
                  <span className="text-[#64748B]">
                    ~{formatRupiah(totalEstimate)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Dana Titipan Aman
                </span>
                <span className="text-[#16A34A] text-xs font-medium">
                  Ditahan hingga selesai
                </span>
              </div>
              <div className="border-t border-dashed border-[#86EFAC] pt-3 flex items-center justify-between gap-4">
                <span className="text-[#2C1810] font-bold">
                  Total Dibayar Sekarang
                </span>
                <span className="text-[#16A34A] font-bold text-lg">
                  {formatRupiah(BASE_PRICE)}
                </span>
              </div>
            </div>
            {totalEstimate > 0 && (
              <p className="text-[#64748B] text-[11px] mt-3 leading-relaxed">
                * Harga barang dibayar terpisah langsung ke helper setelah
                konfirmasi via chat.
              </p>
            )}
          </div>

          {formError && (
            <p className="text-[#DC2626] text-sm mb-4 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
              {formError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-[#16A34A]/20 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Lanjut ke Pembayaran
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
