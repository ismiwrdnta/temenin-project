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
import JasaTemenin from "./pages/JasaTemenin";
import JasaTemeninPilih from "./pages/JasaTemeninPilih";
import JasaTemeninCari from "./pages/JasaTemeninCari";
import JasaTemeninPesan from "./pages/JasaTemeninPesan";
import JasaCurhatPilih from "./pages/JasaCurhatPilih";
import JasaCurhatReguler from "./pages/JasaCurhatReguler";
import JasaCurhatPesan from "./pages/JasaCurhatPesan";
import JasaCurhatAnonim from "./pages/JasaCurhatAnonim";
import JasaCurhatAnonimChat from "./pages/JasaCurhatAnonimChat";
import JasaBantu from "./pages/JasaBantu";
import JasaBantuAmbilRapor from "./pages/JasaBantuAmbilRapor";
import JasaBantuPilihHelper from "./pages/JasaBantuPilihHelper";
import JasaBantuPembayaran from "./pages/JasaBantuPembayaran";
import JasaBantuAntriMewakili from "./pages/JasaBantuAntriMewakili";
import JasaBantuBelanjaTitip from "./pages/JasaBantuBelanjaTitip";
import JasaBantuBelanjaTitipPembayaran from "./pages/JasaBantuBelanjaTitipPembayaran";
import JasaBantuPermintaanMenunggu from "./pages/JasaBantuPermintaanMenunggu";
import Pesanan from "./pages/Pesanan";
import DetailPesanan from "./pages/DetailPesanan";
import BeriUlasan from "./pages/BeriUlasan";
import DashboardPenyedia from "./pages/DashboardPenyedia";
import ProfilPengguna from "./pages/ProfilPengguna";
import DashboardAdmin from "./pages/DashboardAdmin";
import ProfilPenyedia from "./pages/ProfilPenyedia";
import PilihLayananProvider from "./pages/PilihLayananProvider";
import Notifikasi from "./pages/Notifikasi";
import WalletPenyedia from "./pages/WalletPenyedia";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthShell } from "@/components/GoogleOAuthShell";
import { OrderProvider } from "@/context/OrderContext";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationToast from "@/components/NotificationToast";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GoogleOAuthShell>
        <AuthProvider>
        <NotificationProvider>
        <OrderProvider>
        <NotificationToast />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/daftar" element={<Daftar />} />
          <Route path="/otp" element={<OtpVerifikasi />} />
          <Route path="/masuk" element={<Masuk />} />
          <Route path="/daftar-provider" element={<DaftarProvider />} />
          <Route path="/dashboard" element={<DashboardPengguna />} />
          <Route path="/dashboard-penyedia" element={<DashboardPenyedia />} />
          <Route path="/profil" element={<ProfilPengguna />} />
          <Route path="/provider/:providerId/pilih-layanan" element={<PilihLayananProvider />} />
          <Route path="/notifikasi" element={<Notifikasi />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/profil-penyedia" element={<ProfilPenyedia />} />
          <Route path="/wallet-penyedia" element={<WalletPenyedia />} />
          <Route path="/pencarian" element={<Pencarian />} />
          <Route path="/jasa-temenin" element={<JasaTemenin />} />
          <Route path="/jasa-temenin/pilih" element={<JasaTemeninPilih />} />
          <Route path="/jasa-temenin/cari/:mode" element={<JasaTemeninCari />} />
          <Route
            path="/jasa-temenin/pesan/:mode/:companionId"
            element={<JasaTemeninPesan />}
          />
          <Route path="/jasa-curhat/pilih" element={<JasaCurhatPilih />} />
          <Route path="/jasa-curhat/reguler" element={<JasaCurhatReguler />} />
          <Route
            path="/jasa-curhat/pesan/:mode/:providerId"
            element={<JasaCurhatPesan />}
          />
          <Route path="/jasa-curhat/anonim" element={<JasaCurhatAnonim />} />
          <Route
            path="/jasa-curhat/anonim/:listenerId"
            element={<JasaCurhatAnonimChat />}
          />
          <Route path="/jasa-bantu" element={<JasaBantu />} />
          <Route
            path="/jasa-bantu/ambil-rapor"
            element={<JasaBantuAmbilRapor />}
          />
          <Route
            path="/jasa-bantu/ambil-rapor/helper"
            element={<JasaBantuPilihHelper />}
          />
          <Route
            path="/jasa-bantu/ambil-rapor/pembayaran"
            element={<JasaBantuPembayaran />}
          />
          <Route
            path="/jasa-bantu/antri-mewakili"
            element={<JasaBantuAntriMewakili />}
          />
          <Route
            path="/jasa-bantu/antri-mewakili/pembayaran"
            element={<JasaBantuPembayaran />}
          />
          <Route
            path="/jasa-bantu/belanja-titip"
            element={<JasaBantuBelanjaTitip />}
          />
          <Route
            path="/jasa-bantu/belanja-titip/pembayaran"
            element={<JasaBantuBelanjaTitipPembayaran />}
          />
          <Route
            path="/jasa-bantu/permintaan/:id"
            element={<JasaBantuPermintaanMenunggu />}
          />
          <Route path="/pesanan" element={<Pesanan />} />
          <Route path="/pesanan/:id" element={<DetailPesanan />} />
          <Route path="/pesanan/:id/ulasan" element={<BeriUlasan />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </OrderProvider>
        </NotificationProvider>
        </AuthProvider>
        </GoogleOAuthShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
