import type { LucideIcon } from "lucide-react";
import { Clock, GraduationCap, ShoppingBag } from "lucide-react";

export type BantuCategory = {
  id: string;
  title: string;
  price: string;
  priceUnit: string;
  description: string;
  tags: { label: string; variant: "accent" | "muted" }[];
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  popular?: boolean;
};

export const BANTU_CATEGORIES: BantuCategory[] = [
  {
    id: "ambil-rapor",
    title: "Ambil Rapor",
    price: "Rp 50rb",
    priceUnit: "/aktivitas",
    description:
      "Helper mengambil rapor atas nama kamu sebagai wali murid — lengkap dengan surat kuasa yang kami bantu siapkan formatnya",
    tags: [
      { label: "Butuh surat kuasa", variant: "accent" },
      { label: "~2 Jam", variant: "muted" },
    ],
    icon: GraduationCap,
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    popular: true,
  },
  {
    id: "antri-mewakili",
    title: "Antri Mewakili",
    price: "Rp 45rb",
    priceUnit: "/jam",
    description:
      "Helper antri di tempat umum mewakili kamu — kantor pemerintahan, klinik, bank, dll. Kamu tinggal datang saat nomor antrianmu dipanggil.",
    tags: [
      { label: "Update posisi antrian", variant: "accent" },
      { label: "Per jam", variant: "muted" },
    ],
    icon: Clock,
    iconBg: "bg-[#FFF0F8]",
    iconColor: "text-[#E91E8C]",
  },
  {
    id: "belanja-titip",
    title: "Belanja / Titip Beli",
    price: "Rp 35rb",
    priceUnit: "/pesanan",
    description:
      "Titip beli barang di toko/pasar tertentu yang tidak tersedia di ojek online. Harga barang dibayar terpisah langsung ke helper.",
    tags: [
      { label: "Bukti struk wajib", variant: "accent" },
      { label: "Radius 5 km", variant: "muted" },
    ],
    icon: ShoppingBag,
    iconBg: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
  },
];
