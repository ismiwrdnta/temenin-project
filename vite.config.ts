import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { createServer } from "./server";
import { attachSocketIO } from "./server/socket";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared", "index.html"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Attach Socket.io LEBIH DULU, sebelum Express middleware dipasang.
      // Ini penting: kalau Express middleware dipasang duluan, request ke
      // /socket.io/* bisa "tertangkap" duluan oleh Express (yang tidak
      // punya handler untuk path itu) sebelum sempat diproses Socket.io.
      if (server.httpServer) {
        attachSocketIO(server.httpServer, app);
        console.log("🔌 Socket.io attached (dev mode)");
      } else {
        console.warn("⚠️ server.httpServer tidak tersedia — Socket.io tidak terpasang di dev mode");
      }

      // Baru pasang Express app sebagai middleware SETELAH Socket.io attach
      server.middlewares.use(app);
    },
  };
}
