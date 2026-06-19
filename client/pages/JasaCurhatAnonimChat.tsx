import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Lock,
  Send,
} from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { CurhatAnonimAvatar } from "@/components/CurhatAnonimAvatar";
import { useAuth } from "@/context/AuthContext";
import { getListenerById } from "@/data/curhat-listeners";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  sender: "user" | "listener";
  text: string;
  time: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    sender: "listener",
    text: "Hai! 👋 Aku siap dengerin kamu. Ingat identitasmu sepenuhnya anonim, ceritain apa saja pelan-pelan 🌸",
    time: "14.00",
  },
  {
    id: "2",
    sender: "user",
    text: "Aku lagi bingung sama situasi keluarga...",
    time: "13.47",
  },
  {
    id: "3",
    sender: "listener",
    text: "Aku dengerin kamu. Mau cerita lebih? Tidak ada yang akan menghakimi di sini",
    time: "13.45",
  },
];

const SESSION_SECONDS = 23 * 60 + 45;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function nowTimeLabel(): string {
  const now = new Date();
  return `${now.getHours()}.${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function JasaCurhatAnonimChat() {
  const navigate = useNavigate();
  const { listenerId } = useParams<{ listenerId: string }>();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_SECONDS);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const listener = listenerId ? getListenerById(listenerId) : undefined;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  if (!listener) {
    return <Navigate to="/jasa-curhat/anonim" replace />;
  }

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "user",
        text,
        time: nowTimeLabel(),
      },
    ]);
    setDraft("");

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: "listener",
          text: "Terima kasih sudah berbagi. Aku di sini untuk mendengarkanmu 🌸",
          time: nowTimeLabel(),
        },
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AppNavbar activePage="jasa" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <div className="flex items-start gap-4 mb-5">
            <Link
              to="/jasa-curhat/anonim"
              className="w-10 h-10 rounded-lg border border-[#E5D5C5] bg-white flex items-center justify-center text-[#2C1810] hover:bg-[#F5EBE0] transition-colors flex-shrink-0 mt-1"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[#2C1810] font-bold text-2xl sm:text-3xl mb-1">
                Curhat Anonim
              </h1>
              <p className="text-[#94A3B8] text-sm sm:text-base">
                Curhat dengan mode Anonim
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E9D5FF] p-4 sm:p-5 mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <CurhatAnonimAvatar online={listener.status === "online"} />
              <div className="min-w-0">
                <h2 className="text-[#2C1810] font-bold text-base sm:text-lg truncate">
                  {listener.alias}
                </h2>
                <p className="text-[#64748B] text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
                  Online sekarang
                  <span className="text-[#CBD5E1]">•</span>
                  Terverifikasi
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold flex-shrink-0">
              Anonim
            </span>
          </div>

          <div className="rounded-2xl border border-[#C4B5FD] bg-[#F5F3FF] px-4 py-3 sm:px-5 sm:py-4 mb-3 flex items-start sm:items-center justify-between gap-3">
            <div className="flex gap-3 items-start min-w-0">
              <Lock className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
              <p className="text-[#4C1D95] text-xs sm:text-sm leading-relaxed">
                Identitasmu{" "}
                <span className="font-bold">tidak pernah dikirim</span> ke
                pendengar • Chat terlindungi & aman • Percakapan dihapus
                otomatis dalam 7 hari
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[#7C3AED] font-bold text-sm flex-shrink-0">
              <Clock className="w-4 h-4" />
              {formatCountdown(remainingSeconds)}
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs sm:text-sm">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              Kamu tampil sebagai &ldquo;Pengguna Anonim&rdquo; bagi pendengar
              ini
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4 sm:p-5 mb-5">
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-[#E91E8C] to-[#7C3AED] text-white rounded-br-md"
                        : "bg-[#4C1D95] text-white rounded-bl-md",
                    )}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1.5 text-right",
                        msg.sender === "user"
                          ? "text-white/75"
                          : "text-white/60",
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ceritakan apa yang ada di pikiranmu..."
                className="flex-1 h-12 px-4 bg-[#F8F9FA] rounded-xl border border-[#E9D5FF] text-sm text-[#2C1810] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
              />
              <button
                type="button"
                onClick={handleSend}
                className="w-12 h-12 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Kirim pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/pesanan")}
              className="flex-1 bg-white border-2 border-[#2C1810] hover:bg-[#F5EBE0] text-[#2C1810] py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-[#16A34A]" />
              Akhiri & Konfirmasi Selesai
            </button>
            <button
              type="button"
              className="px-5 py-3.5 rounded-xl border-2 border-[#DC2626] text-[#DC2626] font-bold text-sm uppercase hover:bg-[#FEF2F2] transition-colors"
            >
              sos
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
