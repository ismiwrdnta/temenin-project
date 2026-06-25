/**
 * NotificationContext
 * ────────────────────
 * Polling-based notification system for providers.
 * - Polls /api/bookings every 8 seconds for new pending bookings
 * - Polls /api/notifications/unread every 10 seconds for violation warnings
 * - Triggers a toast notification when new events arrive
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { listBookings, mapBookingToOrder } from "@/lib/bookingApi";
import { getStoredToken } from "@/lib/authApi";
import type { Order } from "@/data/orders";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  orderId: string | number;
  userName: string;
  service: string;
  price: number;
  timestamp: number;
}

export interface ViolationNotification {
  id: string;
  type: "violation_warning" | "violation_suspension" | "violation_ban" | string;
  title: string;
  body: string;
  created_at: string;
}

interface NotificationCtx {
  notifications: Notification[];
  violationNotifications: ViolationNotification[];
  pendingOrders: Order[];
  dismissNotification: (id: string) => void;
  dismissViolationNotification: (id: string) => void;
  dismissAll: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationCtx>({
  notifications: [],
  violationNotifications: [],
  pendingOrders: [],
  dismissNotification: () => {},
  dismissViolationNotification: () => {},
  dismissAll: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [violationNotifications, setViolationNotifications] = useState<ViolationNotification[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  const knownPendingIds = useRef<Set<string>>(new Set());
  const isProvider = isAuthenticated && user?.role === "penyedia";

  // ── Poll pending bookings ──────────────────────────────────────────────────
  const poll = useCallback(async () => {
    if (!isProvider) return;
    try {
      const data = await listBookings();
      const orders = data.map(mapBookingToOrder);
      const pending = orders.filter((o) => o.status === "pending");
      setPendingOrders(pending);

      const newOrders = pending.filter(
        (o) => !knownPendingIds.current.has(String(o.id)),
      );

      if (newOrders.length > 0) {
        const newNotifs: Notification[] = newOrders.map((o) => ({
          id: `notif-${String(o.id)}-${Date.now()}`,
          orderId: o.id,
          userName: o.userName,
          service: o.service,
          price: o.providerEarnings ?? o.price,
          timestamp: Date.now(),
        }));
        setNotifications((prev) => [...prev, ...newNotifs]);
        newOrders.forEach((o) => knownPendingIds.current.add(String(o.id)));
      }

      const pendingIds = new Set(pending.map((o) => String(o.id)));
      knownPendingIds.current.forEach((id) => {
        if (!pendingIds.has(id)) knownPendingIds.current.delete(id);
      });
    } catch {
      // silent
    }
  }, [isProvider]);

  // ── Poll violation notifications ──────────────────────────────────────────
  const pollViolations = useCallback(async () => {
    if (!isProvider) return;
    try {
      const token = getStoredToken();
      const res = await fetch("/api/notifications/unread", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const data = (await res.json()) as { data: ViolationNotification[] };
      if (data.data.length > 0) {
        setViolationNotifications((prev) => [...prev, ...data.data]);
      }
    } catch {
      // silent
    }
  }, [isProvider]);

  useEffect(() => {
    if (!isProvider) return;
    void poll();
    void pollViolations();
    const bookingInterval = setInterval(() => void poll(), 8_000);
    const violationInterval = setInterval(() => void pollViolations(), 10_000);
    return () => {
      clearInterval(bookingInterval);
      clearInterval(violationInterval);
    };
  }, [isProvider, poll, pollViolations]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissViolationNotification = useCallback((id: string) => {
    setViolationNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
    setViolationNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        violationNotifications,
        pendingOrders,
        dismissNotification,
        dismissViolationNotification,
        dismissAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
