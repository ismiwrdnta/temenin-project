import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_ORDERS, type Order } from "@/data/orders";

type OrderContextValue = {
  orders: Order[];
  getOrderById: (id: number) => Order | undefined;
  completeSession: (id: number) => void;
  submitReview: (id: number) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

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
    chatMessages: undefined,
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
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const getOrderById = useCallback(
    (id: number) => orders.find((order) => order.id === id),
    [orders],
  );

  const completeSession = useCallback((id: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id && order.status === "berlangsung"
          ? buildCompletedOrder(order)
          : order,
      ),
    );
  }, []);

  const submitReview = useCallback((id: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              reviewStatus: "sent" as const,
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
    () => ({ orders, getOrderById, completeSession, submitReview }),
    [orders, getOrderById, completeSession, submitReview],
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
