import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import {
  ensureChatSession,
  findMessages,
  markMessagesAsRead,
} from "../repositories/chat";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().optional(),
});

export const handleGetChatHistory: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Parameter tidak valid." });
    return;
  }

  const bookingId = req.params.bookingId as string;

  try {
    const session = await ensureChatSession(bookingId, userId);
    if (!session) {
      res.status(404).json({ error: "Sesi chat tidak ditemukan." });
      return;
    }

    const messages = await findMessages(session.id, {
      limit: parsed.data.limit,
      before: parsed.data.before,
    });
    await markMessagesAsRead(session.id, userId);

    res.json({ data: { session, messages } });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ error: "Gagal mengambil riwayat chat." });
  }
};
