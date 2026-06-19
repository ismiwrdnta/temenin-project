import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import { StarRating } from "@/components/StarRating";
import { useOrders } from "@/context/OrderContext";
import { cn } from "@/lib/utils";

const ASPECTS = [
  { key: "punctuality", label: "Ketepatan Waktu" },
  { key: "friendliness", label: "Keramahan" },
  { key: "expectation", label: "Sesuai Ekspektasi" },
  { key: "comfort", label: "Keamanan & Kenyamanan" },
] as const;

const SESSION_TAGS = [
  { id: "tepat-waktu", label: "Tepat Waktu", emoji: "⏰" },
  { id: "ramah", label: "Ramah & Asik", emoji: "😊" },
  { id: "sesuai", label: "Sesuai ekspektasi", emoji: "✅" },
  { id: "pendengar", label: "Pendengar yang baik", emoji: "👂" },
  { id: "order-lagi", label: "Akan order lagi", emoji: "🔄" },
  { id: "aman", label: "Terverifikasi & aman", emoji: "🛡️" },
];

const MIN_COMMENT_LENGTH = 10;

export default function BeriUlasan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, submitReview } = useOrders();
  const orderId = Number(id);
  const order = Number.isFinite(orderId) ? getOrderById(orderId) : undefined;

  const [overallRating, setOverallRating] = useState(0);
  const [aspectRatings, setAspectRatings] = useState<Record<string, number>>(
    {},
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  if (!order) {
    return <Navigate to="/pesanan" replace />;
  }

  if (order.status !== "selesai" || order.reviewStatus === "sent") {
    return <Navigate to={`/pesanan/${order.id}`} replace />;
  }

  const canSubmit =
    overallRating > 0 && comment.trim().length >= MIN_COMMENT_LENGTH;

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !order) return;
    submitReview(order.id, overallRating);
    navigate("/pesanan", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF8F5] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#F3E8FF] rounded-full blur-3xl opacity-50" />
      </div>

      <AppNavbar activePage="pesanan" />

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          <Link
            to={`/pesanan/${order.id}`}
            className="inline-flex items-center gap-2 text-[#7C3AED] hover:text-[#6D28D9] text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <div className="flex flex-wrap gap-3 mb-6">
            {(
              [
                { key: "semua", label: "Semua", to: "/pesanan" },
                { key: "aktif", label: "Aktif", to: "/pesanan?filter=aktif" },
                {
                  key: "selesai",
                  label: "Selesai",
                  to: "/pesanan?filter=selesai",
                },
                {
                  key: "dibatalkan",
                  label: "Dibatalkan",
                  to: "/pesanan?filter=dibatalkan",
                },
              ] as const
            ).map((tab) => (
              <Link
                key={tab.key}
                to={tab.to}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                  tab.key === "selesai"
                    ? "bg-[#E91E8C] text-white shadow-sm"
                    : "bg-[#FDF4FF] text-[#94A3B8] border border-[#FBCFE8] hover:bg-[#FCE7F3] hover:text-[#7C3AED]",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto space-y-4"
          >
            {/* Provider card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm flex-shrink-0">
                {order.initials}
              </div>
              <div>
                <h2 className="text-[#4C1D95] font-bold text-base">
                  {order.providerName}
                </h2>
                <p className="text-[#94A3B8] text-sm mt-0.5">
                  {order.service} • {order.duration} • {order.datetime}
                </p>
              </div>
            </div>

            {/* Overall rating */}
            <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
              <h3 className="text-[#2C1810] font-bold text-base">
                Rating Keseluruhan
              </h3>
              <p className="text-[#94A3B8] text-xs mt-0.5 mb-4">Wajib diisi</p>
              <StarRating
                value={overallRating}
                onChange={setOverallRating}
                size="lg"
                label="Rating keseluruhan"
              />
            </div>

            {/* Aspect ratings */}
            <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
              <h3 className="text-[#2C1810] font-bold text-base mb-4">
                Rating per Aspek{" "}
                <span className="text-[#94A3B8] font-normal text-sm">
                  (opsional)
                </span>
              </h3>
              <div className="space-y-4">
                {ASPECTS.map((aspect) => (
                  <div
                    key={aspect.key}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <span className="text-[#64748B] text-sm">
                      {aspect.label}
                    </span>
                    <StarRating
                      value={aspectRatings[aspect.key] ?? 0}
                      onChange={(v) =>
                        setAspectRatings((prev) => ({
                          ...prev,
                          [aspect.key]: v,
                        }))
                      }
                      size="sm"
                      label={aspect.label}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
              <h3 className="text-[#2C1810] font-bold text-base mb-4">
                Pilih yang menggambarkan sesi ini
              </h3>
              <div className="flex flex-wrap gap-2">
                {SESSION_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                        selected
                          ? "bg-[#EFF6FF] border-[#3B82F6] text-[#2563EB]"
                          : "bg-[#FDF4FF] border-[#FBCFE8] text-[#64748B] hover:border-[#E91E8C] hover:text-[#E91E8C]",
                      )}
                    >
                      {tag.label} {tag.emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
              <h3 className="text-[#2C1810] font-bold text-base mb-3">
                Komentar{" "}
                <span className="text-[#E91E8C] font-normal text-sm">
                  *wajib (min. 10 karakter)
                </span>
              </h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Ceritakan pengalamanmu bersama ${order.providerName}... (min. 10 karakter)`}
                rows={5}
                className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border border-[#F3E8FF] text-sm text-[#2C1810] placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-[#94A3B8]">
                <span>
                  {comment.trim().length} / min. {MIN_COMMENT_LENGTH} karakter
                </span>
                <span>Ulasanmu bersifat publik</span>
              </div>
            </div>

            {/* Photo upload */}
            <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
              <h3 className="text-[#2C1810] font-bold text-base mb-4">
                Tambah Foto{" "}
                <span className="text-[#94A3B8] font-normal text-sm">
                  (opsional)
                </span>
              </h3>
              <button
                type="button"
                className="w-24 h-24 rounded-xl border-2 border-dashed border-[#E9D5FF] bg-[#FAFAFA] flex flex-col items-center justify-center gap-1 text-[#94A3B8] hover:border-[#E91E8C] hover:text-[#E91E8C] transition-colors"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs font-medium">tambah</span>
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2 pb-8">
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full py-3 rounded-xl font-medium text-sm transition-colors border",
                  canSubmit
                    ? "bg-white border-[#E91E8C] text-[#E91E8C] hover:bg-[#FDF4FF]"
                    : "bg-[#FAFAFA] border-[#E9D5FF] text-[#CBD5E1] cursor-not-allowed",
                )}
              >
                Kirim Ulasan
              </button>
              <Link
                to="/pesanan"
                className="block w-full py-3 rounded-xl font-medium text-sm text-center bg-white border border-[#E9D5FF] text-[#64748B] hover:bg-[#FDF4FF] transition-colors"
              >
                Lewati untuk sekarang
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
