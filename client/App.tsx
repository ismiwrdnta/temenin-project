import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Daftar from "./pages/Daftar";
import OtpVerifikasi from "./pages/OtpVerifikasi";
import Masuk from "./pages/Masuk";
import DaftarProvider from "./pages/DaftarProvider";
import DashboardPengguna from "./pages/DashboardPengguna";
import Pencarian from "./pages/Pencarian";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/daftar" element={<Daftar />} />
          <Route path="/otp" element={<OtpVerifikasi />} />
          <Route path="/masuk" element={<Masuk />} />
          <Route path="/daftar-provider" element={<DaftarProvider />} />
          <Route path="/dashboard" element={<DashboardPengguna />} />
          <Route path="/pencarian" element={<Pencarian />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
