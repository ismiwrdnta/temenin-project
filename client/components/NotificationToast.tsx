/**
 * NotificationToast
 * ──────────────────
 * Tampil di pojok kanan atas layar untuk provider:
 * - Request pesanan baru (booking toast)
 * - Peringatan pelanggaran dari SOS user (violation toast)
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, CheckCircle2, X, XCircle } from "lucide-react";
import { formatRupiah } from "@/data/orders";
import {
  useNotifications,
  type Notification,
  type ViolationNotification,
} from "@/context/NotificationContext";
import { confirmBooking } from "@/lib/bookingApi";
import { cn } from "@/lib/utils";

// ─── Booking Toast ────────────────────────────────────────────────────────────

function BookingToast({ notif, onDismiss }: { notif: Notification; onDismiss: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(onDismiss, 10_000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  async function handleAccept() {
    if (typeof notif.orderId !== "string") return;
    try {
      await confirmBooking(notif.orderId, { action: "accept" });
    } catch {
      // noop
    }
    onDismiss();
    navigate(`/pesanan/${notif.orderId}`);
  }

  async function handleReject() {
    if (typeof notif.orderId !== "string") return;
    try {
      await confirmBooking(notif.orderId, {
        action: "reject",
        reason: "Ditolak oleh provider",
      });
    } catch {
      // noop
    }
    onDismiss();
  }

  return (
    <div
      className={cn(
        "w-[340px] bg-white rounded-2xl shadow-xl border border-[#E9D5FF]",
        "animate-in slide-in-from-right-5 duration-300",
        "overflow-hidden",
      )}
    >
      <div className="h-1 bg-gradient-to-r from-[#E91E8C] to-[#7C3AED]" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[#2C1810] font-bold text-sm leading-tight">
                Request Pesanan Baru!
              </p>
              <p className="text-[#94A3B8] text-xs mt-0.5">Segera konfirmasi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="w-6 h-6 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#94A3B8] hover:bg-[#F3E8FF] hover:text-[#7C3AED] transition-colors flex-shrink-0"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-[#FAFAFA] rounded-xl p-3 mb-3 space-y-1">
          <p className="text-[#2C1810] font-semibold text-sm">{notif.userName}</p>
          <p className="text-[#64748B] text-xs">{notif.service}</p>
          <p className="text-[#E91E8C] font-bold text-sm">
            {formatRupiah(notif.price)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleAccept()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terima
          </button>
          <button
            type="button"
            onClick={() => void handleReject()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] text-xs font-bold transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Tolak
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Violation Toast ──────────────────────────────────────────────────────────

const VIOLATION_CONFIG: Record<string, { accent: string; bar: string; icon: string; sub: string }> = {
  violation_warning: {
    accent: "from-[#D97706] to-[#EA580C]",
    bar: "bg-gradient-to-r from-[#D97706] to-[#EA580C]",
    icon: "⚠️",
    sub: "Peringatan",
  },
  violation_suspension: {
    accent: "from-[#EA580C] to-[#DC2626]",
    bar: "bg-gradient-to-r from-[#EA580C] to-[#DC2626]",
    icon: "🚫",
    sub: "Skorsing",
  },
  violation_ban: {
    accent: "from-[#DC2626] to-[#991B1B]",
    bar: "bg-gradient-to-r from-[#DC2626] to-[#991B1B]",
    icon: "🔴",
    sub: "Pembekuan Permanen",
  },
};

function ViolationToast({
  notif,
  onDismiss,
}: {
  notif: ViolationNotification;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 15_000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const cfg = VIOLATION_CONFIG[notif.type] ?? VIOLATION_CONFIG.violation_warning;

  return (
    <div
      className={cn(
        "w-[340px] bg-white rounded-2xl shadow-xl border border-[#FEE2E2]",
        "animate-in slide-in-from-right-5 duration-300",
        "overflow-hidden",
      )}
    >
      <div className={cn("h-1", cfg.bar)} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-base",
                cfg.accent,
              )}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[#2C1810] font-bold text-sm leading-tight">
                {notif.title}
              </p>
              <p className="text-[#94A3B8] text-xs mt-0.5">{cfg.sub}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="w-6 h-6 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors flex-shrink-0"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-[#FEF2F2] rounded-xl p-3 mb-3">
          <p className="text-[#DC2626] text-xs leading-relaxed">{notif.body}</p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] text-xs font-semibold transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────

export default function NotificationToast() {
  const { notifications, violationNotifications, dismissNotification, dismissViolationNotification } =
    useNotifications();

  const hasAny = notifications.length > 0 || violationNotifications.length > 0;
  if (!hasAny) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {violationNotifications.map((notif) => (
        <div key={notif.id} className="pointer-events-auto">
          <ViolationToast
            notif={notif}
            onDismiss={() => dismissViolationNotification(notif.id)}
          />
        </div>
      ))}
      {notifications.map((notif) => (
        <div key={notif.id} className="pointer-events-auto">
          <BookingToast
            notif={notif}
            onDismiss={() => dismissNotification(notif.id)}
          />
        </div>
      ))}
    </div>
  );
}
