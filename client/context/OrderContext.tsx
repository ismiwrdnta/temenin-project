import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Companion, TemeninMode } from "@/data/temenin-companions";
import type { BantuHelper } from "@/data/bantu-helpers";
import type { AntriHelper } from "@/data/antri-helpers";
import type { AmbilRaporRequest } from "@/lib/ambil-rapor-request";
import type { AntriMewakiliRequest } from "@/lib/antri-mewakili-request";
import type { ChatMessage, Order } from "@/data/orders";
import {
  createAmbilRaporOrder as buildAmbilRaporOrder,
  createAntriMewakiliOrder as buildAntriMewakiliOrder,
  createOrderFromBooking,
} from "@/lib/order-factory";
import { resolveCompanionId } from "@/lib/provider-link";

const ORDERS_KEY = "temenin_orders";

type CreateOrderInput = {
  companion: Companion;
  mode: TemeninMode;
  durationHours: number;
  customer: {
    name: string;
    location?: string;
  };
};

type CreateAmbilRaporOrderInput = {
  helper: BantuHelper;
  request: AmbilRaporRequest;
  paymentMethod: string;
  customer: {
    name: string;
    location?: string;
  };
};

type CreateAntriMewakiliOrderInput = {
  helper: AntriHelper;
  request: AntriMewakiliRequest;
  paymentMethod: string;
  customer: {
    name: string;
    location?: string;
  };
};

type OrderContextValue = {
  orders: Order[];
  getOrderById: (id: number) => Order | undefined;
  createOrder: (input: CreateOrderInput) => Order;
  createAmbilRaporOrder: (input: CreateAmbilRaporOrderInput) => Order;
  createAntriMewakiliOrder: (input: CreateAntriMewakiliOrderInput) => Order;
  acceptOrder: (id: number) => void;
  rejectOrder: (id: number) => void;
  addChatMessage: (orderId: number, text: string) => void;
  completeSession: (id: number) => void;
  submitReview: (id: number, rating?: number) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

function normalizeOrder(order: Order): Order | null {
  if (!order?.id || !order.providerName) return null;

  const companionId =
    order.companionId ?? resolveCompanionId(order.providerName) ?? 0;

  if (!companionId) return null;

  return {
    ...order,
    companionId,
    userName: order.userName ?? "Pengguna",
    userInitials: order.userInitials ?? "PG",
    userLocation: order.userLocation ?? "Bandung, Jawa Barat",
    status: order.status ?? "pending",
    statusHistory: order.statusHistory ?? [],
  };
}

function loadOrders(): Order[] {
  try {
    const raw =
      localStorage.getItem(ORDERS_KEY) ?? sessionStorage.getItem(ORDERS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Order[];
    const normalized = parsed
      .map((order) => normalizeOrder(order))
      .filter((order): order is Order => order !== null);

    if (normalized.length > 0) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(normalized));
      sessionStorage.removeItem(ORDERS_KEY);
    }

    return normalized;
  } catch {
    return [];
  }
}

function formatMessageTime(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function buildCompletedOrder(order: Order): Order {
  const updatedHistory = order.statusHistory.map((item) =>
    item.state === "active" ? { ...item, state: "done" as const } : item,
  );

  const hasCompletedStep = updatedHistory.some(
    (item) => item.label.toLowerCase() === "sesi selesai",
  );

  return {
    ...order,
    status: "selesai",
    reviewStatus: "pending",
    remainingTime: undefined,
    statusHistory: hasCompletedStep
      ? updatedHistory
      : [
          ...updatedHistory,
          {
            id: updatedHistory.length + 1,
            label: "Sesi selesai",
            time: "Baru saja",
            state: "done" as const,
          },
        ],
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const getOrderById = useCallback(
    (id: number) => orders.find((order) => order.id === id),
    [orders],
  );

  const createOrder = useCallback((input: CreateOrderInput) => {
    const orderId = Date.now();
    const order = createOrderFromBooking({ ...input, orderId });
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const createAmbilRaporOrder = useCallback(
    (input: CreateAmbilRaporOrderInput) => {
      const orderId = Date.now();
      const order = buildAmbilRaporOrder({ ...input, orderId });
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [],
  );

  const createAntriMewakiliOrder = useCallback(
    (input: CreateAntriMewakiliOrderInput) => {
      const orderId = Date.now();
      const order = buildAntriMewakiliOrder({ ...input, orderId });
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [],
  );

  const acceptOrder = useCallback((id: number) => {
    const timeLabel = formatMessageTime(new Date());

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id || order.status !== "pending") return order;

        const updatedHistory = order.statusHistory.map((item) =>
          item.state === "active" ? { ...item, state: "done" as const } : item,
        );

        return {
          ...order,
          status: "berlangsung",
          remainingTime: order.duration.replace("Jam", "j 00m"),
          chatMessages: [
            {
              id: 1,
              sender: "provider",
              text: `Hai ${order.userName.split(" ")[0]}! Pesananmu sudah aku terima. Siap ketemu ya 😊`,
              time: timeLabel,
            },
          ],
          statusHistory: [
            ...updatedHistory,
            {
              id: updatedHistory.length + 1,
              label: `Dikonfirmasi oleh ${order.providerName}`,
              time: `Hari ini, ${timeLabel}`,
              state: "done",
            },
            {
              id: updatedHistory.length + 2,
              label: "Sesi berlangsung",
              time: `${order.datetimeRange} — menunggu konfirmasi selesai`,
              state: "active",
            },
          ],
        };
      }),
    );
  }, []);

  const rejectOrder = useCallback((id: number) => {
    const timeLabel = formatMessageTime(new Date());

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id || order.status !== "pending") return order;

        const updatedHistory = order.statusHistory.map((item) =>
          item.state === "active" ? { ...item, state: "done" as const } : item,
        );

        return {
          ...order,
          status: "dibatalkan",
          chatMessages: undefined,
          statusHistory: [
            ...updatedHistory,
            {
              id: updatedHistory.length + 1,
              label: `Ditolak oleh ${order.providerName}`,
              time: `Hari ini, ${timeLabel}`,
              state: "done",
            },
            {
              id: updatedHistory.length + 2,
              label: "Dana dikembalikan",
              time: `Hari ini, ${timeLabel}`,
              state: "active",
            },
          ],
        };
      }),
    );
  }, []);

  const addChatMessage = useCallback((orderId: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const messages = order.chatMessages ?? [];
        const newMessage: ChatMessage = {
          id: messages.length + 1,
          sender: "user",
          text: trimmed,
          time: formatMessageTime(new Date()),
        };
        return { ...order, chatMessages: [...messages, newMessage] };
      }),
    );
  }, []);

  const completeSession = useCallback((id: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id && order.status === "berlangsung"
          ? buildCompletedOrder(order)
          : order,
      ),
    );
  }, []);

  const submitReview = useCallback((id: number, rating?: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              reviewStatus: "sent" as const,
              reviewRating: rating ?? order.reviewRating,
              statusHistory: [
                ...order.statusHistory.filter(
                  (item) => item.label.toLowerCase() !== "ulasan dikirim",
                ),
                {
                  id: order.statusHistory.length + 1,
                  label: "Ulasan dikirim",
                  time: "Baru saja",
                  state: "done" as const,
                },
              ],
            }
          : order,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      orders,
      getOrderById,
      createOrder,
      createAmbilRaporOrder,
      createAntriMewakiliOrder,
      acceptOrder,
      rejectOrder,
      addChatMessage,
      completeSession,
      submitReview,
    }),
    [
      orders,
      getOrderById,
      createOrder,
      createAmbilRaporOrder,
      createAntriMewakiliOrder,
      acceptOrder,
      rejectOrder,
      addChatMessage,
      completeSession,
      submitReview,
    ],
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
}
