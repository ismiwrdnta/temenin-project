import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import {
  findChatSessionByBookingForUser,
  createMessage,
} from "../repositories/chat";

const sendSchema = z.object({
  content: z.string().max(2000).optional(),
  message_type: z.enum(["text", "location", "image"]).default("text"),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
});

export const handleSendChatMessage: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data pesan tidak valid." });
    return;
  }

  const { content, message_type, location_lat, location_lng } = parsed.data;

  if (message_type === "text" && !content) {
    res.status(400).json({ error: "Pesan tidak boleh kosong." });
    return;
  }

  const bookingId = req.params.bookingId as string;

  try {
    const session = await findChatSessionByBookingForUser(bookingId, userId);
    if (!session || !session.is_active) {
      res.status(404).json({ error: "Sesi chat tidak aktif." });
      return;
    }

    const message = await createMessage({
      sessionId: session.id,
      senderId: userId,
      messageType: message_type,
      content,
      locationLat: location_lat,
      locationLng: location_lng,
    });

    // Emit lewat Socket.io kalau tersedia di app (lihat catatan di WIRING_GUIDE)
    const io = (req.app.get("io") as
      | { to: (room: string) => { emit: (event: string, data: unknown) => void } }
      | undefined);
    if (io) {
      io.to(bookingId).emit("receive_message", message);
    }

    res.status(201).json({ data: message });
  } catch (error) {
    console.error("Send chat message error:", error);
    res.status(500).json({ error: "Gagal mengirim pesan." });
  }
};
