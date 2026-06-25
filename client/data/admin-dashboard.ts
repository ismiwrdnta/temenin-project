// A01 — Dashboard Stats: total pengguna, transaksi, pendapatan, laporan aktif
export const ADMIN_STATS = [
  { label: "Total Pengguna", value: "1,248", change: "+8.2%", up: true },
  { label: "Total Transaksi", value: "3,671", change: "+12.5%", up: true },
  { label: "Total Pendapatan", value: "Rp28,4 Jt", change: "+15.03%", up: true },
  { label: "Laporan Aktif", value: "12", change: "-6.08%", up: false },
] as const;

export const USERS_TRAFFIC = [
  { month: "Jan", value: 120 },
  { month: "Feb", value: 180 },
  { month: "Mar", value: 150 },
  { month: "Apr", value: 220 },
  { month: "May", value: 280 },
  { month: "Jun", value: 320 },
];

export const USERS_TRAFFIC_DETAIL = [
  { month: "Jan", value: 142 },
  { month: "Jan", value: 165, marker: "Jan" },
  { month: "Jan", value: 86 },
  { month: "Feb", value: 112 },
  { month: "Feb", value: 92, marker: "Feb" },
  { month: "Feb", value: 166 },
  { month: "Mar", value: 154, marker: "Mar" },
  { month: "Mar", value: 176 },
  { month: "Apr", value: 258 },
  { month: "Apr", value: 247, marker: "Apr" },
  { month: "Apr", value: 296 },
  { month: "May", value: 222 },
  { month: "May", value: 238, marker: "May" },
  { month: "May", value: 186 },
  { month: "Jun", value: 224 },
  { month: "Jun", value: 238, marker: "Jun" },
];

export const LOCATION_TRAFFIC = [
  { region: "Sumatera", value: 45 },
  { region: "Jawa", value: 62 },
  { region: "Kalimantan", value: 38 },
  { region: "Sulawesi", value: 78 },
  { region: "Papua", value: 28 },
];

export const LOCATION_TRAFFIC_DETAIL = [
  {
    province: "Jawa",
    providers: "xxx",
    users: "xxx",
    userCount: 286,
    percentage: "45%",
    height: 126,
  },
  {
    province: "Sumatera",
    providers: "xxx",
    users: "xxx",
    userCount: 318,
    percentage: "50%",
    height: 220,
  },
  {
    province: "Sulawesi",
    providers: "xxx",
    users: "xxx",
    userCount: 214,
    percentage: "34%",
    height: 94,
  },
  {
    province: "Kalimantan",
    providers: "111",
    users: "245",
    userCount: 356,
    percentage: "56%",
    height: 250,
    active: true,
  },
  {
    province: "Papua",
    providers: "xxx",
    users: "xxx",
    userCount: 266,
    percentage: "42%",
    height: 156,
  },
];

export const JASA_TRAFFIC = [
  { month: "Jan", value: 90 },
  { month: "Feb", value: 110 },
  { month: "Mar", value: 130 },
  { month: "Apr", value: 125 },
  { month: "May", value: 160 },
  { month: "Jun", value: 190 },
];

export const JASA_TRAFFIC_DETAIL = [
  { month: "Jan", value: 142 },
  { month: "Jan", value: 165, marker: "Jan" },
  { month: "Jan", value: 86 },
  { month: "Feb", value: 112 },
  { month: "Feb", value: 92, marker: "Feb" },
  { month: "Feb", value: 166 },
  { month: "Mar", value: 154, marker: "Mar" },
  { month: "Mar", value: 176 },
  { month: "Apr", value: 258 },
  { month: "Apr", value: 247, marker: "Apr" },
  { month: "Apr", value: 296 },
  { month: "May", value: 222 },
  { month: "May", value: 238, marker: "May" },
  { month: "May", value: 186 },
  { month: "Jun", value: 224 },
  { month: "Jun", value: 238, marker: "Jun" },
];

// A02 — Manajemen User: daftar user, filter, blokir/aktifkan
export const ADMIN_USERS = [
  { name: "User Test", email: "test@temenin.id", status: "Aktif" as const },
  { name: "Pengguna Dua", email: "user2@example.com", status: "Aktif" as const },
  { name: "Pengguna Tiga", email: "user3@example.com", status: "Diblokir" as const },
  { name: "Pengguna Empat", email: "user4@example.com", status: "Aktif" as const },
  { name: "Pengguna Lima", email: "user5@example.com", status: "Aktif" as const },
];

export type AdminUserAccountStatus = (typeof ADMIN_USERS)[number]["status"];

export const ADMIN_USER_ACCOUNT_STATUS_STYLES: Record<AdminUserAccountStatus, string> = {
  Aktif: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
  Diblokir: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
};

// A03 — Verifikasi Provider: antrian verifikasi KTP & selfie
export const ADMIN_VERIFIKASI_QUEUE = [
  {
    name: "Calon Provider A",
    email: "calon_a@mail.com",
    submittedAt: "20 Jun 2026",
    ktpStatus: "Menunggu" as const,
    selfieStatus: "Menunggu" as const,
  },
  {
    name: "Calon Provider B",
    email: "calon_b@mail.com",
    submittedAt: "22 Jun 2026",
    ktpStatus: "Menunggu" as const,
    selfieStatus: "Menunggu" as const,
  },
];

export type VerifikasiDocStatus = "Menunggu" | "Terverifikasi" | "Ditolak";

export const VERIFIKASI_DOC_STATUS_STYLES: Record<VerifikasiDocStatus, string> = {
  Menunggu: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  Terverifikasi: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
  Ditolak: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
};

// A04 — Manajemen Provider: daftar provider, status, rating, suspend/aktifkan
export const ADMIN_PROVIDERS = [
  { name: "Rafi Ananda", email: "rafi@mail.com", rating: "4.88", totalOrders: 83, status: "Aktif" as const },
  { name: "Risna", email: "risna@mail.com", rating: "4.88", totalOrders: 61, status: "Aktif" as const },
  { name: "Bimo Pratama", email: "bimo@mail.com", rating: "4.75", totalOrders: 45, status: "Aktif" as const },
  { name: "Ismi Wardanita", email: "ismi@mail.com", rating: "4.88", totalOrders: 61, status: "Aktif" as const },
  { name: "Ima", email: "ima_provider@mail.com", rating: "4.75", totalOrders: 45, status: "Suspended" as const },
];

export type AdminProviderStatus = (typeof ADMIN_PROVIDERS)[number]["status"];

export const ADMIN_PROVIDER_STATUS_STYLES: Record<AdminProviderStatus, string> = {
  Aktif: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
  Suspended: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
};

// A05 — Manajemen Transaksi: semua transaksi, status escrow, refund
export const ADMIN_TRANSACTIONS = [
  {
    provider: "Rafi Ananda",
    user: "User Test",
    service: "Jasa Temenin",
    amount: "Rp70.000",
    status: "Selesai" as const,
  },
  {
    provider: "Risna",
    user: "Pengguna Dua",
    service: "Jasa Curhat",
    amount: "Rp70.000",
    status: "Escrow" as const,
  },
  {
    provider: "Bimo Pratama",
    user: "Pengguna Tiga",
    service: "Jasa Bantu",
    amount: "Rp65.000",
    status: "Selesai" as const,
  },
  {
    provider: "Ismi Wardanita",
    user: "Pengguna Empat",
    service: "Jasa Curhat",
    amount: "Rp70.000",
    status: "Refund" as const,
  },
  {
    provider: "Ima",
    user: "Pengguna Lima",
    service: "Jasa Temenin",
    amount: "Rp65.000",
    status: "Dibatalkan" as const,
  },
];

export type AdminTransactionStatus = (typeof ADMIN_TRANSACTIONS)[number]["status"];

export const TRANSACTION_STATUS_STYLES: Record<AdminTransactionStatus, string> = {
  Selesai: "bg-[#DCFCE7] text-[#16A34A]",
  Escrow: "bg-[#EDE9FE] text-[#7C3AED]",
  Refund: "bg-[#FFEDD5] text-[#EA580C]",
  Dibatalkan: "bg-[#F3F4F6] text-[#6B7280]",
};

// A06 — Manajemen Laporan: laporan dari user/provider, tindak lanjut
export const ADMIN_REPORTS = [
  {
    reporter: "Pelapor 1",
    report: "Detail disini",
    status: "Rejected" as const,
    reporterStatus: "Provider",
    dateTime: "Jumat, 05 April 2026 - 14.30",
    service: "Jasa Temenin",
    detail:
      "Transaksi sudah selesai dilakukan, tapi komisi saya belum masuk setelah 3 hari diselesaikan",
  },
  {
    reporter: "Pelapor 2",
    report: "Detail disini",
    status: "Approved" as const,
    reporterStatus: "Provider",
    dateTime: "Jumat, 05 April 2026 - 14.30",
    service: "Jasa Temenin",
    detail:
      "Transaksi sudah selesai dilakukan, tapi komisi saya belum masuk setelah 3 hari diselesaikan",
  },
  {
    reporter: "Pelapor 3",
    report: "Detail disini",
    status: "Pending" as const,
    reporterStatus: "Provider",
    dateTime: "Jumat, 05 April 2026 - 14.30",
    service: "Jasa Temenin",
    detail:
      "Transaksi sudah selesai dilakukan, tapi komisi saya belum masuk setelah 3 hari diselesaikan",
  },
  {
    reporter: "Pelapor 4",
    report: "Detail disini",
    status: "Approved" as const,
    reporterStatus: "Provider",
    dateTime: "Jumat, 05 April 2026 - 14.30",
    service: "Jasa Temenin",
    detail:
      "Transaksi sudah selesai dilakukan, tapi komisi saya belum masuk setelah 3 hari diselesaikan",
  },
  {
    reporter: "Pelapor 5",
    report: "Detail disini",
    status: "Approved" as const,
    reporterStatus: "Provider",
    dateTime: "Jumat, 05 April 2026 - 14.30",
    service: "Jasa Temenin",
    detail:
      "Transaksi sudah selesai dilakukan, tapi komisi saya belum masuk setelah 3 hari diselesaikan",
  },
];

export type AdminReportStatus = (typeof ADMIN_REPORTS)[number]["status"];

export const ADMIN_REPORT_STATUS_STYLES: Record<AdminReportStatus, string> = {
  Rejected: "bg-[#E8E3E1] text-[#2C1810] border-[#D8D0CC]",
  Approved: "bg-[#DBEAFE] text-[#0085FF] border-[#BFDBFE]",
  Pending: "bg-[#FEF3C7] text-[#F5B700] border-[#FDE68A]",
};

// A08 — Log Aktivitas: riwayat aksi admin dan log sistem
export const ADMIN_ACTIVITY_LOGS = [
  {
    admin: "Admin 1",
    action: "Memverifikasi provider Rafi Ananda",
    time: "05 Apr 2026 - 14.30",
  },
  {
    admin: "Admin 1",
    action: "Memblokir user Pengguna Tiga",
    time: "04 Apr 2026 - 10.15",
  },
  {
    admin: "Admin 1",
    action: "Menolak laporan Pelapor 1",
    time: "03 Apr 2026 - 09.00",
  },
  {
    admin: "Admin 1",
    action: "Mengirim broadcast ke semua pengguna",
    time: "02 Apr 2026 - 16.45",
  },
  {
    admin: "Admin 1",
    action: "Menambah FAQ baru",
    time: "01 Apr 2026 - 11.30",
  },
];
