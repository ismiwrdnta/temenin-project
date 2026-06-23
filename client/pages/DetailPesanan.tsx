import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Lock,
  Send,
  X,
} from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import ProviderNavbar from "@/components/ProviderNavbar";
import { useAuth } from "@/context/AuthContext";
import { normalizeName } from "@/lib/provider-link";
import { useOrders } from "@/context/OrderContext";
import {
  STATUS_CONFIG,
  formatRupiah,
  type ChatMessage,
  type Order,
} from "@/data/orders";
import {
  completeBooking,
  getBooking,
  getChatHistory,
  isUuid,
  mapBookingToOrder,
  sendChatMessage,
} from "@/lib/bookingApi";
import { cn } from "@/lib/utils";

function PendingBanner({ order }: { order: Order }) {
  if (order.status !== "pending") return null;

  return (
    <div className="bg-[#FEFCE8] border border-[#FACC15] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[#CA8A04] font-bold text-base">
            Menunggu Konfirmasi Penyedia
          </h2>
          <p className="text-[#64748B] text-sm mt-1">
            Pesananmu sedang ditinjau oleh {order.providerName}. Chat akan aktif
            setelah penyedia menerima pesanan.
          </p>
        </div>
        <span className="self-start sm:self-center text-xs font-semibold px-3 py-1 rounded-full bg-[#FEF9C3] text-[#CA8A04] whitespace-nowrap">
          Menunggu
        </span>
      </div>
      <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-2.5">
        <svg className="w-4 h-4 text-[#16A34A] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-[#16A34A] text-xs font-medium">
          Pembayaran <span className="font-bold">{order.paymentMethod === "Belum dibayar" ? "belum dikonfirmasi" : "sudah dikonfirmasi"}</span> — halaman ini otomatis update
        </p>
      </div>
    </div>
  );
}

function SessionBanner({ order }: { order: Order }) {
  if (order.status !== "berlangsung") return null;

  return (
    <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 className="text-[#EA580C] font-bold text-base">
          Sesi Sedang Berlangsung
        </h2>
        <p className="text-[#64748B] text-sm mt-1">
          {order.datetimeRange}
          {order.remainingTime && (
            <span> • Sisa waktu: {order.remainingTime}</span>
          )}
        </p>
      </div>
      <span className="self-start sm:self-center text-xs font-semibold px-3 py-1 rounded-full bg-[#FFEDD5] text-[#EA580C]">
        Berlangsung
      </span>
    </div>
  );
}

function ProviderCard({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-base flex-shrink-0">
            {order.initials}
          </div>
          <div>
            <h2 className="text-[#4C1D95] font-bold text-lg">
              {order.providerName}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {order.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#FDF4FF] text-[#E91E8C] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#FBCFE8]"
                >
                  {tag}
                </span>
              ))}
              {order.verified && (
                <span className="bg-[#DCFCE7] text-[#16A34A] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="#2C1810"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span className="font-bold text-[#2C1810]">{order.rating}</span>
              <span className="text-[#94A3B8]">
                ({order.reviewCount} Ulasan)
              </span>
            </div>
          </div>
        </div>

        <div className="sm:text-right flex-shrink-0">
          <p className="text-[#94A3B8] text-xs">Total dibayar</p>
          <p className="text-[#2C1810] font-bold text-xl">
            {formatRupiah(order.price)}
          </p>
          <p className="text-[#94A3B8] text-sm mt-0.5">{order.duration}</p>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ order }: { order: Order }) {
  const rows = [
    { label: "Kategori Jasa", value: order.service },
    { label: "Durasi", value: order.duration },
    { label: "Tanggal & Waktu", value: order.datetimeRange },
    { label: "Tarif", value: order.hourlyRate },
    { label: "Metode Bayar", value: order.paymentMethod },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-5">
        <ClipboardList className="w-5 h-5 text-[#7C3AED]" />
        <h3 className="text-[#2C1810] font-bold text-base">Ringkasan Pesanan</h3>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="text-[#94A3B8]">{row.label}</span>
            <span className="text-[#2C1810] font-medium text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-[#E9D5FF] mt-4 pt-4 flex items-center justify-between">
        <span className="text-[#2C1810] font-bold text-sm">Total</span>
        <span className="text-[#2C1810] font-bold text-base">
          {formatRupiah(order.price)}
        </span>
      </div>
    </div>
  );
}

function EscrowBanner({ order }: { order: Order }) {
  if (order.status === "dibatalkan") return null;

  return (
    <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex gap-3">
      <Lock className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
      <p className="text-[#1E40AF] text-sm leading-relaxed">
        <span className="font-semibold">Dana Aman.</span>{" "}
        {formatRupiah(order.price)} ditahan di platform TEMENIN. Dana akan
        otomatis cair ke provider setelah kamu konfirmasi sesi selesai, atau
        dalam 24 jam jika tidak ada konfirmasi.
      </p>
    </div>
  );
}

const MOCK_REPLIES: Record<string, string[]> = {
  default: [
    "Halo! Senang bisa chat denganmu 😊",
    "Aku siap mendengarkan, ceritakan saja apa yang ada di pikiranmu.",
    "Aku di sini ya, nggak kemana-mana 💙",
    "Hmm, aku mengerti perasaanmu. Lanjutkan saja ceritanya.",
    "Terima kasih sudah mau berbagi. Itu pasti tidak mudah.",
    "Aku dengar kamu. Kamu sudah sangat berani dengan menceritakan ini 🌟",
    "Bagaimana perasaanmu sekarang setelah bercerita?",
  ],
};

function getRandomReply(): string {
  const replies = MOCK_REPLIES.default;
  return replies[Math.floor(Math.random() * replies.length)];
}

function LiveChat({
  order,
  onSendMessage,
}: {
  order: Order;
  onSendMessage: (text: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLegacyOrder = typeof order.id === "number";

  // Show chat for both pending AND berlangsung (curhat starts chat immediately)
  const isCurhat = order.service.toLowerCase().includes("curhat");
  const showChat = order.status === "berlangsung" || (isCurhat && order.status === "pending");

  if (!showChat) return null;

  // Merge API messages + local messages (dedup by text+time)
  const apiMessages: ChatMessage[] = order.chatMessages ?? [];
  const merged: ChatMessage[] = [...apiMessages];
  localMessages.forEach((lm) => {
    const exists = apiMessages.some(
      (am) => am.text === lm.text && am.sender === lm.sender,
    );
    if (!exists) merged.push(lm);
  });
  merged.sort((a, b) => Number(a.id) - Number(b.id));

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [merged.length, isTyping]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || isSending) return;
    setMessage("");
    setIsSending(true);

    // Optimistic local message
    const now = new Date();
    const timeLabel = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const tempMsg: ChatMessage = { id: Date.now(), sender: "user", text, time: timeLabel };
    setLocalMessages((prev) => [...prev, tempMsg]);

    try {
      await onSendMessage(text);
    } catch {
      // noop — optimistic message already shown
    } finally {
      setIsSending(false);
    }

    // Mock provider reply for legacy / curhat pending orders
    if (isLegacyOrder || order.status === "pending") {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1000));
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      setLocalMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "provider", text: getRandomReply(), time: replyTime },
      ]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-[#2C1810] font-bold text-base">Live Chat</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#16A34A] text-xs font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 max-h-[340px] overflow-y-auto p-5 scroll-smooth">
        {merged.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#94A3B8] text-sm">Mulai percakapan dengan provider 👋</p>
          </div>
        )}
        {merged.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.sender === "user" ? "justify-end" : "justify-start",
            )}
          >
            {msg.sender !== "user" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0 self-end">
                {order.initials.slice(0, 2)}
              </div>
            )}
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                msg.sender === "user"
                  ? "bg-gradient-to-br from-[#E91E8C] to-[#A131CC] text-white rounded-br-sm"
                  : "bg-[#F8F9FA] text-[#2C1810] border border-gray-100 rounded-bl-sm",
              )}
            >
              <p className="leading-relaxed">{msg.text}</p>
              <p
                className={cn(
                  "text-[10px] mt-1",
                  msg.sender === "user" ? "text-white/70" : "text-[#94A3B8]",
                )}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center text-white text-[10px] font-bold mr-2 flex-shrink-0 self-end">
              {order.initials.slice(0, 2)}
            </div>
            <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Ketik pesan..."
          disabled={isSending}
          className="flex-1 h-11 px-4 bg-[#F8F9FA] rounded-xl border border-[#F3E8FF] text-sm text-[#2C1810] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/30 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!message.trim() || isSending}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#A131CC] hover:opacity-90 text-white flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40"
          aria-label="Kirim pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function DetailActions({
  order,
  onConfirmComplete,
}: {
  order: Order;
  onConfirmComplete: (id: string | number) => void;
}) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    onConfirmComplete(order.id);
    navigate(`/pesanan/${order.id}/ulasan`);
  };

  if (order.status === "berlangsung") {
    return (
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-white border border-[#E9D5FF] hover:bg-[#FDF4FF] text-[#4C1D95] py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Check className="w-4 h-4 text-[#16A34A]" />
            Konfirmasi Sesi Selesai
          </button>
          <button
            type="button"
            className="px-5 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] py-3 rounded-xl font-bold text-sm transition-colors border border-[#FECACA]"
          >
            SOS
          </button>
        </div>
        <button
          type="button"
          className="w-full bg-white border border-[#FECACA] hover:bg-[#FEF2F2] text-[#DC2626] py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Batalkan Pesanan
        </button>
      </div>
    );
  }

  if (order.status === "selesai" && order.reviewStatus === "pending") {
    return (
      <Link
        to={`/pesanan/${order.id}/ulasan`}
        className="block w-full bg-white border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FDF4FF] py-3 rounded-xl font-medium text-sm transition-colors text-center"
      >
        ★ Beri Ulasan
      </Link>
    );
  }

  if (order.status === "dibatalkan") {
    return (
      <button
        type="button"
        className="w-full bg-white border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FDF4FF] py-3 rounded-xl font-medium text-sm transition-colors"
      >
        Rincian Pembatalan
      </button>
    );
  }

  return null;
}

function StatusTimeline({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
      <h3 className="text-[#2C1810] font-bold text-base mb-5">
        Riwayat Status
      </h3>

      <div className="space-y-0">
        {order.statusHistory.map((item, index) => {
          const isLast = index === order.statusHistory.length - 1;

          return (
            <div key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0 mt-1.5",
                    item.state === "done" && "bg-[#22C55E]",
                    item.state === "active" && "bg-[#FACC15]",
                    item.state === "pending" && "bg-[#E2E8F0]",
                  )}
                />
                {!isLast && (
                  <span className="w-0.5 flex-1 bg-[#E9D5FF] min-h-[32px] my-1" />
                )}
              </div>
              <div className={cn("pb-5", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-medium",
                    item.state === "active"
                      ? "text-[#EA580C]"
                      : "text-[#2C1810]",
                  )}
                >
                  {item.label}
                </p>
                <p className="text-[#94A3B8] text-xs mt-0.5">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DetailPesanan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOrderById, completeSession, addChatMessage } = useOrders();
  const [apiOrder, setApiOrder] = useState<Order | null>(null);
  const [providerUserId, setProviderUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id && isUuid(id)));
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isApiBooking = Boolean(id && isUuid(id));
  const legacyOrderId = id && !isApiBooking ? Number(id) : NaN;
  const legacyOrder = Number.isFinite(legacyOrderId)
    ? getOrderById(legacyOrderId)
    : undefined;
  const order = isApiBooking ? apiOrder : legacyOrder;

  useEffect(() => {
    if (!id || !isUuid(id)) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const booking = await getBooking(id);
        if (cancelled) return;

        let chatMessages: ChatMessage[] | undefined;
        if (
          booking.status === "confirmed" ||
          booking.status === "in_progress" ||
          booking.status === "completed"
        ) {
          try {
            const chat = await getChatHistory(id);
            chatMessages = chat.messages.map((m) => ({
              id: m.id,
              sender:
                m.sender_id === user?.id
                  ? ("user" as const)
                  : ("provider" as const),
              text: m.content ?? "",
              time: new Date(m.created_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }));
          } catch {
            chatMessages = [];
          }
        }

        const mapped = mapBookingToOrder(booking);
        if (chatMessages) mapped.chatMessages = chatMessages;
        setProviderUserId(booking.provider_user_id ?? null);
        setApiOrder(mapped);
      } catch {
        if (!cancelled) setApiOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  // Auto-refresh every 10s so user sees provider accept without manual reload
  useEffect(() => {
    if (!id || !isUuid(id)) return;
    pollingRef.current = setInterval(() => {
      // Only poll if status is still pending (waiting_confirmation)
      if (apiOrder?.status === "pending" || apiOrder?.status === "berlangsung") {
        refreshApiOrder();
      }
    }, 10_000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, apiOrder?.status]);

  async function refreshApiOrder() {
    if (!id || !isUuid(id)) return;
    const booking = await getBooking(id);
    const mapped = mapBookingToOrder(booking);
    if (mapped.status === "berlangsung") {
      try {
        const chat = await getChatHistory(id);
        mapped.chatMessages = chat.messages.map((m) => ({
          id: m.id,
          sender:
            m.sender_id === user?.id
              ? ("user" as const)
              : ("provider" as const),
          text: m.content ?? "",
          time: new Date(m.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
      } catch {
        mapped.chatMessages = [];
      }
    }
    setApiOrder(mapped);
  }

  async function handleComplete(idToComplete: string | number) {
    if (typeof idToComplete === "string" && isUuid(idToComplete)) {
      await completeBooking(idToComplete);
      navigate(`/pesanan/${idToComplete}/ulasan`);
      return;
    }
    completeSession(Number(idToComplete));
    navigate(`/pesanan/${idToComplete}/ulasan`);
  }

  async function handleSendMessage(text: string) {
    if (!id || !isUuid(id)) {
      if (legacyOrder) addChatMessage(Number(legacyOrder.id), text);
      return;
    }
    await sendChatMessage(id, text);
    await refreshApiOrder();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F5] text-[#94A3B8]">
        Memuat pesanan...
      </div>
    );
  }

  if (!order) {
    return <Navigate to="/pesanan" replace />;
  }

  const isProviderView =
    user?.role === "penyedia" &&
    (isApiBooking
      ? providerUserId === user.id
      : order.companionId === user.companionId ||
        normalizeName(order.providerName) === normalizeName(user.name));

  if (user?.role === "penyedia" && !isProviderView) {
    return <Navigate to="/dashboard-penyedia" replace />;
  }

  const status = STATUS_CONFIG[order.status];
  const backPath = isProviderView ? "/dashboard-penyedia" : "/pesanan";

  return (
    <div className="min-h-screen w-full bg-[#FFF8F5] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#F3E8FF] rounded-full blur-3xl opacity-50" />
      </div>

      {isProviderView ? (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-6">
          <ProviderNavbar activePage="dashboard" />
        </div>
      ) : (
        <AppNavbar activePage="pesanan" />
      )}

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-[#7C3AED] hover:text-[#6D28D9] text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isProviderView ? "Kembali ke Dashboard" : "Kembali ke Pesanan"}
          </Link>

          <div className="flex flex-wrap gap-3 mb-6">
            {(["semua", "aktif", "selesai", "dibatalkan"] as const).map(
              (tab) => {
                const labels = {
                  semua: "Semua",
                  aktif: "Aktif",
                  selesai: "Selesai",
                  dibatalkan: "Dibatalkan",
                };
                const isActive =
                  tab === "aktif"
                    ? order.status === "berlangsung" ||
                      order.status === "pending"
                    : tab === "selesai"
                      ? order.status === "selesai"
                      : tab === "dibatalkan"
                        ? order.status === "dibatalkan"
                        : false;

                return (
                  <Link
                    key={tab}
                    to={
                      tab === "semua"
                        ? "/pesanan"
                        : `/pesanan?filter=${tab}`
                    }
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#E91E8C] text-white shadow-sm"
                        : "bg-[#FDF4FF] text-[#94A3B8] border border-[#FBCFE8] hover:bg-[#FCE7F3] hover:text-[#7C3AED]",
                    )}
                  >
                    {labels[tab]}
                  </Link>
                );
              },
            )}
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <PendingBanner order={order} />
            <SessionBanner order={order} />

            {!order.remainingTime && order.status !== "berlangsung" && (
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <span className="text-[#64748B] text-sm">Status pesanan</span>
                <span
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full",
                    status.className,
                  )}
                >
                  {status.label}
                </span>
              </div>
            )}

            <ProviderCard order={order} />
            <OrderSummary order={order} />
            <EscrowBanner order={order} />
            <LiveChat
              order={order}
              onSendMessage={handleSendMessage}
            />
            {!isProviderView && (
              <DetailActions
                order={order}
                onConfirmComplete={handleComplete}
              />
            )}
            <StatusTimeline order={order} />
          </div>
        </div>
      </main>
    </div>
  );
}
