export const ADMIN_STATS = [
  { label: "Views", value: "7,265", change: "+11.01%", up: true },
  { label: "Visits", value: "3,671", change: "-0.03%", up: false },
  { label: "New Users", value: "256", change: "+15.03%", up: true },
  { label: "Active Users", value: "2,318", change: "-6.08%", up: false },
] as const;

export const TRAFFIC_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

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

export const ADMIN_TRANSACTIONS = [
  { provider: "Provider 1", user: "User 1", status: "Completes" as const },
  { provider: "Provider 1", user: "User 1", status: "Pending" as const },
  { provider: "Provider 3", user: "User 3", status: "Approved" as const },
  { provider: "Provider 4", user: "User 4", status: "In Progress" as const },
  { provider: "Provider 5", user: "User 5", status: "Rejected" as const },
];

export type AdminTransactionStatus =
  (typeof ADMIN_TRANSACTIONS)[number]["status"];

export const TRANSACTION_STATUS_STYLES: Record<
  AdminTransactionStatus,
  string
> = {
  Completes: "bg-[#DCFCE7] text-[#16A34A]",
  Pending: "bg-[#FFEDD5] text-[#EA580C]",
  Approved: "bg-[#DBEAFE] text-[#2563EB]",
  "In Progress": "bg-[#EDE9FE] text-[#7C3AED]",
  Rejected: "bg-[#F3F4F6] text-[#6B7280]",
};

export const ADMIN_USERS = [
  { name: "User 1", status: "Rejected" as const },
  { name: "User 1", status: "Approved" as const },
  { name: "User 1", status: "Pending" as const },
  { name: "User 1", status: "Approved" as const },
  { name: "User 1", status: "Approved" as const },
];

export type AdminUserStatus = (typeof ADMIN_USERS)[number]["status"];

export const ADMIN_USER_STATUS_STYLES: Record<AdminUserStatus, string> = {
  Rejected: "bg-[#E8E3E1] text-[#2C1810] border-[#D8D0CC]",
  Approved: "bg-[#DBEAFE] text-[#0085FF] border-[#BFDBFE]",
  Pending: "bg-[#FEF3C7] text-[#F5B700] border-[#FDE68A]",
};
