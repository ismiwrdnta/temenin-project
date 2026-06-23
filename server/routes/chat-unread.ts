import type { RequestHandler } from "express";
import { isDatabaseConfigured } from "../db/pool";
import { countUnread } from "../repositories/chat";

export const handleGetUnreadCount: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const bookingId = req.params.bookingId as string;

  try {
    const unreadCount = await countUnread(bookingId, userId);
    res.json({ data: { unread_count: unreadCount } });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Gagal mengambil jumlah pesan." });
  }
};
