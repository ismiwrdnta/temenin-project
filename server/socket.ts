import type { Server as HttpServer } from "http";
import type { Http2SecureServer } from "http2";
import { Server as SocketIOServer } from "socket.io";
import type { Express } from "express";

/**
 * Attach Socket.io ke instance http.Server yang sudah ada, dan simpan
 * referensinya ke Express app supaya route biasa (req.app.get("io"))
 * bisa emit event tanpa perlu import socket.io langsung di tiap route.
 *
 * Dipanggil dari DUA tempat:
 * - vite.config.ts (mode dev)   → lewat server.httpServer milik Vite
 * - node-build.ts  (mode prod)  → lewat http.Server hasil app.listen()
 *
 * Parameter dilonggarkan jadi union karena Vite's server.httpServer bisa
 * berupa http.Server ATAU http2.Http2SecureServer (kalau HTTP/2 aktif).
 * Socket.io sendiri menerima keduanya saat runtime — ini cuma menyamakan
 * level ketelitian tipe TypeScript, bukan perubahan perilaku.
 */
export function attachSocketIO(
  httpServer: HttpServer | Http2SecureServer,
  app: Express,
) {
  // Socket.io's constructor type expects http.Server specifically, tapi
  // mendukung http2.Http2SecureServer juga saat runtime. Cast eksplisit
  // di sini supaya tidak perlu melonggarkan tipe publik fungsi ini lebih jauh.
  const io = new SocketIOServer(httpServer as HttpServer, {
    cors: { origin: "*", credentials: true },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("join_room", (bookingId: string) => {
      socket.join(bookingId);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
