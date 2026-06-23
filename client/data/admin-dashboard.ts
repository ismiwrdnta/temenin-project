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

export const LOCATION_TRAFFIC = [
  { region: "Sumatera", value: 45 },
  { region: "Jawa", value: 62 },
  { region: "Kalimantan", value: 38 },
  { region: "Sulawesi", value: 78 },
  { region: "Papua", value: 28 },
];

export const JASA_TRAFFIC = [
  { month: "Jan", value: 90 },
  { month: "Feb", value: 110 },
  { month: "Mar", value: 130 },
  { month: "Apr", value: 125 },
  { month: "May", value: 160 },
  { month: "Jun", value: 190 },
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
