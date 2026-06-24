import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronsUpDown,
  MessageCircleQuestion,
  PackageOpen,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import AdminNavbar, { type AdminNavKey } from "@/components/AdminNavbar";
import { useAuth } from "@/context/AuthContext";
import {
  ADMIN_REPORTS,
  ADMIN_STATS,
  ADMIN_TRANSACTIONS,
  ADMIN_USERS,
  ADMIN_USER_STATUS_STYLES,
  JASA_TRAFFIC,
  JASA_TRAFFIC_DETAIL,
  LOCATION_TRAFFIC,
  LOCATION_TRAFFIC_DETAIL,
  TRANSACTION_STATUS_STYLES,
  USERS_TRAFFIC,
  USERS_TRAFFIC_DETAIL,
} from "@/data/admin-dashboard";
import { cn } from "@/lib/utils";

const TRAFFIC_TABS = ["Users", "Providers", "Transaction"] as const;
const JASA_CATEGORY_TABS = ["Temenin", "Curhat", "Bantu Aktivitas"] as const;
const FAQ_ITEMS = [
  {
    question: "Bagaimana cara...",
    answer: "Kamu bisa buka menu...",
  },
  {
    question: "Apa yang dilakukan jika...",
    answer: "Silahkan kontak ke nomor berikut...",
  },
  {
    question: "xxx saya tidak berfungsi...",
    answer: "Silahkan kontak ke nomor berikut...",
  },
] as const;
type AdminReport = (typeof ADMIN_REPORTS)[number];
const ADMIN_VIEWS = [
  "dashboard",
  "user-traffic",
  "location-traffic",
  "jasa-traffic",
  "profil",
] as const satisfies readonly AdminNavKey[];

function getAdminView(view: string | null): AdminNavKey {
  if (view && ADMIN_VIEWS.includes(view as AdminNavKey)) {
    return view as AdminNavKey;
  }

  return "dashboard";
}

function StatCard({
  label,
  value,
  change,
  up,
}: {
  label: string;
  value: string;
  change: string;
  up: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm">
      <p className="text-[#64748B] text-sm font-medium mb-2">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <p className="text-[#2C1810] font-bold text-3xl">{value}</p>
        <div className="flex items-center gap-1.5">
          {up ? (
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[#DC2626]" />
          )}
          <span
            className={cn(
              "text-xs font-semibold",
              up ? "text-[#16A34A]" : "text-[#DC2626]",
            )}
          >
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

function SearchField() {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BDBDBD]" />
      <input
        type="search"
        placeholder="Search"
        className="h-9 w-full rounded-full border border-[#B794FF] bg-[#FFFCF9] pl-9 pr-4 text-sm text-[#2C1810] outline-none placeholder:text-[#C7C7C7] focus:border-[#7C3AED]"
      />
    </div>
  );
}

function ReportTable({
  onSelectReport,
}: {
  onSelectReport: (report: AdminReport) => void;
}) {
  return (
    <div className="rounded-xl border border-[#7C3AED] bg-[#FFFCF9] p-3">
      <div className="space-y-2 md:hidden">
        {ADMIN_REPORTS.map((row) => (
          <button
            key={row.reporter}
            type="button"
            onClick={() => onSelectReport(row)}
            className="w-full rounded-lg bg-white p-3 text-left text-sm transition-colors hover:bg-[#F8F5FF]"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium text-[#111111]">{row.reporter}</p>
              <span
                className={cn(
                  "inline-flex min-w-[72px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs",
                  ADMIN_USER_STATUS_STYLES[row.status],
                )}
              >
                {row.status}
              </span>
            </div>
            <p className="text-[#111111]">{row.report}</p>
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-[#F0E9FF] text-[#111111]">
              <th className="px-4 py-1.5 text-center font-normal">
                <span className="inline-flex items-center justify-center gap-2">
                  Pelapor Name
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </span>
              </th>
              <th className="px-4 py-1.5 text-center font-normal">Laporan</th>
              <th className="px-4 py-1.5 text-center font-normal">
                <span className="inline-flex items-center justify-center gap-2">
                  Status
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_REPORTS.map((row) => (
              <tr
                key={row.reporter}
                tabIndex={0}
                onClick={() => onSelectReport(row)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectReport(row);
                  }
                }}
                className="cursor-pointer bg-white transition-colors hover:bg-[#F8F5FF] focus:bg-[#F8F5FF] focus:outline-none"
              >
                <td className="px-4 py-1.5 text-center text-[#111111]">
                  {row.reporter}
                </td>
                <td className="px-4 py-1.5 text-center text-[#111111] underline-offset-2 hover:underline">
                  {row.report}
                </td>
                <td className="px-4 py-1.5 text-center">
                  <span
                    className={cn(
                      "inline-flex min-w-[72px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs",
                      ADMIN_USER_STATUS_STYLES[row.status],
                    )}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportDetailModal({
  report,
  onClose,
}: {
  report: AdminReport | null;
  onClose: () => void;
}) {
  if (!report) return null;

  const detailRows = [
    ["Pelapor", report.reporter],
    ["Status", report.reporterStatus],
    ["Tanggal dan Jam", report.dateTime],
    ["Jasa yang diberikan", report.service],
    ["Detail Laporan", report.detail],
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-detail-title"
    >
      <div className="relative w-full max-w-[750px] rounded-[26px] border border-[#EC2D8F] bg-white px-6 py-7 text-[#6D28D9] shadow-2xl sm:px-12">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-4 text-[#EC2D8F] transition-colors hover:text-[#BE185D]"
          aria-label="Tutup detail laporan"
        >
          <X className="h-7 w-7" />
        </button>

        <h2
          id="report-detail-title"
          className="mb-7 text-center text-lg font-bold text-[#EC2D8F]"
        >
          Detail Laporan
        </h2>

        <div className="mx-auto max-w-[560px] space-y-2 text-base sm:text-lg">
          {detailRows.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_12px_1fr] sm:gap-0"
            >
              <p>{label}</p>
              <p className="hidden sm:block">:</p>
              <p className="font-normal sm:hidden">: {value}</p>
              <p className="hidden leading-relaxed sm:block">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-full max-w-[285px] rounded-lg border border-[#EC2D8F] bg-[#F8F1E8] text-base font-bold text-[#EC2D8F] transition-colors hover:bg-[#FDE7F3]"
          >
            Proses
          </button>
        </div>
      </div>
    </div>
  );
}

function BroadcastModal({
  isOpen,
  showSuccess,
  onClose,
  onSubmit,
  onDismissSuccess,
}: {
  isOpen: boolean;
  showSuccess: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDismissSuccess: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="broadcast-title"
    >
      <div className="relative w-full max-w-[610px] rounded-[24px] border border-[#EC2D8F] bg-white px-6 py-8 shadow-2xl sm:px-11">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#EC2D8F] transition-colors hover:text-[#BE185D] sm:right-5"
          aria-label="Tutup broadcast"
        >
          <X className="h-7 w-7" />
        </button>

        <h2
          id="broadcast-title"
          className="mb-2 text-center text-lg font-bold text-[#EC2D8F]"
        >
          Broadcast
        </h2>

        <div className="mx-auto mb-10 flex h-20 w-full max-w-[305px] flex-col items-center justify-center rounded-[26px] border border-[#EC2D8F] text-[#111111]">
          <p className="text-sm font-bold leading-none">Aktif:</p>
          <p className="text-5xl leading-none">5</p>
        </div>

        {showSuccess && (
          <div className="relative mx-auto mb-3 flex min-h-[66px] w-full max-w-[560px] items-center justify-center rounded-lg border border-[#EC2D8F] bg-white px-10 text-center text-[#EC2D8F] shadow-sm">
            <p className="text-base sm:text-lg">Broadcast berhasil di dibuat</p>
            <button
              type="button"
              onClick={onDismissSuccess}
              className="absolute right-3 top-2 text-[#EC2D8F] transition-colors hover:text-[#BE185D]"
              aria-label="Tutup pesan sukses broadcast"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="mx-auto max-w-[510px]">
          <label
            htmlFor="broadcast-message"
            className="mb-3 block text-base text-[#111111] sm:text-lg"
          >
            Buat Broadcast
          </label>
          <textarea
            id="broadcast-message"
            placeholder="Type here"
            className="h-32 w-full resize-none rounded-lg bg-[#F8F1ED] px-4 py-4 text-sm text-[#2C1810] outline-none placeholder:text-xs placeholder:font-bold placeholder:text-[#8AA0BF] focus:ring-1 focus:ring-[#EC2D8F]"
          />
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onSubmit}
            className="h-10 w-full max-w-[235px] rounded-lg border border-[#EC2D8F] bg-[#F8F1E8] text-base font-bold text-[#EC2D8F] transition-colors hover:bg-[#FDE7F3]"
          >
            Buat
          </button>
        </div>
      </div>
    </div>
  );
}

function FaqModal({
  isOpen,
  showSuccess,
  onClose,
  onSubmit,
  onDismissSuccess,
}: {
  isOpen: boolean;
  showSuccess: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDismissSuccess: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-title"
    >
      <div className="relative w-full max-w-[720px] rounded-[24px] border border-[#EC2D8F] bg-white px-5 py-8 shadow-2xl sm:px-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#EC2D8F] transition-colors hover:text-[#BE185D] sm:right-5"
          aria-label="Tutup FAQ"
        >
          <X className="h-7 w-7" />
        </button>

        <h2
          id="faq-title"
          className="mb-5 text-center text-2xl font-bold text-[#EC2D8F]"
        >
          FAQ
        </h2>

        <div className="space-y-1.5 text-sm text-[#111111] sm:text-base">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="grid grid-cols-[120px_12px_1fr] gap-2 sm:grid-cols-[140px_14px_1fr]">
              <p className="font-semibold">Pertanyaan</p>
              <p>:</p>
              <p>{item.question}</p>
              <p className="font-semibold">Jawaban</p>
              <p>:</p>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="mb-4 text-lg font-semibold text-[#111111]">Tambah FAQ</h3>
          <div className="space-y-4">
            <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-[#111111] sm:grid-cols-[120px_1fr] sm:items-center">
              <span>Pertanyaan</span>
              <input
                type="text"
                placeholder="Type here"
                className="h-11 w-full rounded-lg bg-[#F8F1ED] px-4 text-sm font-normal text-[#2C1810] outline-none placeholder:font-semibold placeholder:text-[#8AA0BF] focus:ring-1 focus:ring-[#EC2D8F]"
              />
            </label>
            <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-[#111111] sm:grid-cols-[120px_1fr] sm:items-center">
              <span>Jawaban</span>
              <input
                type="text"
                placeholder="Type here"
                className="h-11 w-full rounded-lg bg-[#F8F1ED] px-4 text-sm font-normal text-[#2C1810] outline-none placeholder:font-semibold placeholder:text-[#8AA0BF] focus:ring-1 focus:ring-[#EC2D8F]"
              />
            </label>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onSubmit}
              className="h-12 w-full max-w-[305px] rounded-lg border border-[#EC2D8F] bg-[#F8F1E8] text-lg font-bold text-[#EC2D8F] transition-colors hover:bg-[#FDE7F3]"
            >
              Tambah
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="absolute left-1/2 top-1/2 z-10 w-[min(90%,560px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[#EC2D8F] bg-white px-6 py-4 text-center text-[#EC2D8F] shadow-xl">
            <button
              type="button"
              onClick={onDismissSuccess}
              className="absolute right-3 top-2 text-[#EC2D8F] transition-colors hover:text-[#BE185D]"
              aria-label="Tutup pesan sukses FAQ"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-base sm:text-lg">FAQ sudah ditambahkan</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserTrafficView({
  trafficTab,
  onTrafficTabChange,
}: {
  trafficTab: (typeof TRAFFIC_TABS)[number];
  onTrafficTabChange: (tab: (typeof TRAFFIC_TABS)[number]) => void;
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-xl border border-[#7C3AED] bg-[#FFFCF9] px-3 pt-4 pb-2 sm:px-5">
        <div className="mb-4 flex items-center gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRAFFIC_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTrafficTabChange(tab)}
              className={cn(
                "text-sm font-medium transition-colors",
                trafficTab === tab
                  ? "text-[#6D28D9] font-semibold"
                  : "text-[#8B8B8B] hover:text-[#6D28D9]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="h-[230px] sm:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={USERS_TRAFFIC_DETAIL}
              margin={{ top: 14, right: 8, left: 0, bottom: 2 }}
            >
              <CartesianGrid stroke="#F1EBFF" vertical horizontal={false} />
              <XAxis
                dataKey="marker"
                tick={{ fill: "#111111", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={0}
              />
              <YAxis hide domain={[40, 330]} />
              <Tooltip />
              <Line
                type="linear"
                dataKey="value"
                stroke="#B794FF"
                strokeWidth={1.1}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const dotKey = `user-dot-${payload.month}-${payload.value}-${cx}-${cy}`;
                  if (!payload.marker) return <g key={dotKey} />;

                  return (
                    <circle
                      key={dotKey}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="#FFFCF9"
                      stroke="#111111"
                      strokeWidth={1.8}
                    />
                  );
                }}
                activeDot={{ r: 4, fill: "#FFFCF9", stroke: "#111111" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <p className="text-[#6F6F6F] text-lg font-medium sm:text-2xl">Block</p>
        <h1 className="mb-4 text-center text-2xl font-medium text-[#4C1D95] sm:text-3xl">
          Management User
        </h1>

        <SearchField />

        <div className="rounded-xl border border-[#7C3AED] bg-[#FFFCF9] px-3 py-3">
          <div className="space-y-2 md:hidden">
            {ADMIN_USERS.map((row, index) => (
              <div
                key={`${row.name}-${row.status}-${index}`}
                className="rounded-lg bg-white p-3 text-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-[#111111]">{row.name}</p>
                  <span
                    className={cn(
                      "inline-flex min-w-[72px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs",
                      ADMIN_USER_STATUS_STYLES[row.status],
                    )}
                  >
                    {row.status}
                  </span>
                </div>
                <p className="text-xs text-[#111111]">Detail</p>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-[#F0E9FF] text-[#111111]">
                  <th className="w-[60%] px-4 py-1.5 text-center font-normal">
                    <span className="inline-flex items-center justify-center gap-2">
                      User Name
                      <ChevronsUpDown className="h-3.5 w-3.5" />
                    </span>
                  </th>
                  <th className="px-4 py-1.5 text-center font-normal">
                    <span className="inline-flex items-center justify-center gap-2">
                      Status
                      <ChevronsUpDown className="h-3.5 w-3.5" />
                    </span>
                  </th>
                  <th className="w-[120px] px-4 py-1.5 text-right font-normal">
                    <span className="sr-only">Detail</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_USERS.map((row, index) => (
                  <tr key={`${row.name}-${row.status}-${index}`}>
                    <td className="px-4 py-2.5 text-center text-[#111111]">
                      {row.name}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-[72px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs",
                          ADMIN_USER_STATUS_STYLES[row.status],
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-[#111111]">
                      Detail
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function LocationTrafficView() {
  return (
    <div className="space-y-6 sm:space-y-11">
      <section className="rounded-xl border border-[#7C3AED] bg-[#FFFCF9] px-3 py-5 sm:px-8 sm:py-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:min-h-[300px] sm:grid-cols-5 sm:gap-x-8">
          {LOCATION_TRAFFIC_DETAIL.map((item) => (
            <div
              key={item.province}
              className="relative flex min-h-[190px] flex-col items-center justify-end gap-4 sm:min-h-[284px] sm:gap-9"
            >
              <div className="relative flex h-[160px] w-full items-end justify-center sm:h-[250px]">
                <div
                  className={cn(
                    "w-8 rounded-[10px] sm:w-9",
                    item.active ? "bg-[#6D28D9]" : "bg-[#F1F1F1]",
                  )}
                  style={{ height: `clamp(72px, ${item.height}px, 100%)` }}
                />
                {item.active && (
                  <div className="absolute left-1/2 top-0 z-10 min-w-[132px] -translate-x-1/2 rounded-md bg-[#FFFCF9]/90 p-1 text-[10px] leading-tight text-[#111111] shadow-sm sm:left-[calc(50%+30px)] sm:min-w-[150px] sm:translate-x-0 sm:bg-transparent sm:p-0 sm:text-xs sm:shadow-none">
                    <p className="font-bold">{item.province}</p>
                    <p className="grid grid-cols-[78px_8px_auto] sm:grid-cols-[92px_8px_auto]">
                      <span>Jumlah pengguna</span>
                      <span>:</span>
                      <span>{item.userCount}</span>
                    </p>
                    <p className="grid grid-cols-[78px_8px_auto] sm:grid-cols-[92px_8px_auto]">
                      <span>Persentage</span>
                      <span>:</span>
                      <span>{item.percentage}</span>
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-[#111111]">{item.province}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[790px] rounded-xl border border-[#7C3AED] bg-[#FFFCF9] px-3 py-3">
        <div className="space-y-2 md:hidden">
          {LOCATION_TRAFFIC_DETAIL.map((item) => (
            <div key={item.province} className="rounded-lg bg-white p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-medium text-[#111111]">{item.province}</p>
                <p className="text-[#111111]">{item.users}</p>
              </div>
              <p className="text-xs text-[#64748B]">
                Jumlah Provider: {item.providers}
              </p>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="bg-[#F0E9FF] text-[#111111]">
                <th className="px-4 py-1.5 text-center font-normal">
                  Provinsi
                </th>
                <th className="px-4 py-1.5 text-center font-normal">
                  <span className="inline-flex items-center justify-center gap-2">
                    Jumlah Provider
                    <ChevronsUpDown className="h-3.5 w-3.5" />
                  </span>
                </th>
                <th className="px-4 py-1.5 text-center font-normal">
                  <span className="inline-flex items-center justify-center gap-2">
                    Jumlah User
                    <ChevronsUpDown className="h-3.5 w-3.5" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {LOCATION_TRAFFIC_DETAIL.map((item) => (
                <tr key={item.province}>
                  <td className="px-4 py-2.5 text-center text-[#111111]">
                    {item.province}
                  </td>
                  <td className="px-4 py-2.5 text-center text-[#111111]">
                    {item.providers}
                  </td>
                  <td className="px-4 py-2.5 text-center text-[#111111]">
                    {item.users}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function JasaTrafficView({
  onSelectReport,
}: {
  onSelectReport: (report: AdminReport) => void;
}) {
  const [jasaCategory, setJasaCategory] =
    useState<(typeof JASA_CATEGORY_TABS)[number]>("Bantu Aktivitas");

  return (
    <div className="space-y-6 sm:space-y-7">
      <section className="rounded-xl bg-white px-3 pt-5 pb-2 sm:px-5">
        <div className="mb-5 flex items-center gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-6">
          {JASA_CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setJasaCategory(tab)}
              className={cn(
                "text-sm font-medium transition-colors",
                jasaCategory === tab
                  ? "text-[#6D28D9] font-semibold"
                  : "text-[#8AA0BF] hover:text-[#6D28D9]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mb-3 hidden items-center gap-6 opacity-0 sm:mb-5 sm:flex">
          {TRAFFIC_TABS.map((tab) => (
            <span key={tab} className="text-sm">
              {tab}
            </span>
          ))}
        </div>

        <div className="h-[230px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={JASA_TRAFFIC_DETAIL}
              margin={{ top: 4, right: 8, left: 0, bottom: 2 }}
            >
              <CartesianGrid stroke="#F1EBFF" vertical horizontal={false} />
              <XAxis
                dataKey="marker"
                tick={{ fill: "#111111", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={0}
              />
              <YAxis hide domain={[40, 330]} />
              <Tooltip />
              <Line
                type="linear"
                dataKey="value"
                stroke="#B794FF"
                strokeWidth={1.1}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const dotKey = `jasa-dot-${payload.month}-${payload.value}-${cx}-${cy}`;
                  if (!payload.marker) return <g key={dotKey} />;

                  return (
                    <circle
                      key={dotKey}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="#FFFFFF"
                      stroke="#111111"
                      strokeWidth={1.8}
                    />
                  );
                }}
                activeDot={{ r: 4, fill: "#FFFFFF", stroke: "#111111" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h1 className="mb-4 text-center text-2xl font-medium text-[#4C1D95] sm:text-3xl">
          Management Laporan
        </h1>

        <SearchField />
        <ReportTable onSelectReport={onSelectReport} />
      </section>
    </div>
  );
}

function ProfileView({
  onSelectReport,
  onOpenBroadcast,
  onOpenFaq,
}: {
  onSelectReport: (report: AdminReport) => void;
  onOpenBroadcast: () => void;
  onOpenFaq: () => void;
}) {
  return (
    <div className="space-y-7 sm:space-y-9">
      <section className="grid grid-cols-1 items-center gap-5 md:grid-cols-[140px_1fr] md:gap-6">
        <div className="flex justify-center md:justify-start">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#FB7AB5] via-[#B563B6] to-[#243B82] sm:h-32 sm:w-32">
            <div className="relative h-[72px] w-[72px] rounded-full border-[3px] border-white sm:h-24 sm:w-24">
              <div className="absolute left-1/2 top-[13px] h-9 w-9 -translate-x-1/2 rounded-full border-[3px] border-white sm:top-[18px] sm:h-12 sm:w-12" />
              <div className="absolute bottom-[-5px] left-1/2 h-12 w-[72px] -translate-x-1/2 rounded-t-full border-[3px] border-white border-b-0 sm:h-16 sm:w-24" />
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-5">
          <div className="h-9 rounded-lg bg-white" />
          <div className="h-9 rounded-lg bg-white" />
        </div>
      </section>

      <section className="text-center">
        <h1 className="mb-5 text-2xl font-medium text-[#4C1D95] sm:text-3xl">
          Management Content
        </h1>
        <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12">
          <button
            type="button"
            onClick={onOpenBroadcast}
            className="flex flex-col items-center gap-1 text-[#111111]"
          >
            <PackageOpen className="h-11 w-11 stroke-[2.4]" />
            <span className="text-sm font-bold">Broadcast</span>
          </button>
          <button
            type="button"
            onClick={onOpenFaq}
            className="flex flex-col items-center gap-1 text-[#111111]"
          >
            <MessageCircleQuestion className="h-11 w-11 stroke-[2.4]" />
            <span className="text-sm font-bold">FAQ</span>
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-center text-2xl font-medium text-[#4C1D95] sm:text-3xl">
          Log Activity
        </h2>

        <SearchField />
        <ReportTable onSelectReport={onSelectReport} />
      </section>
    </div>
  );
}

export default function DashboardAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [trafficTab, setTrafficTab] =
    useState<(typeof TRAFFIC_TABS)[number]>("Users");
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(
    null,
  );
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [showBroadcastSuccess, setShowBroadcastSuccess] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [showFaqSuccess, setShowFaqSuccess] = useState(false);
  const activePage = getAdminView(searchParams.get("view"));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] text-[#94A3B8]">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/masuk" replace />;
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to={user.role === "penyedia" ? "/dashboard-penyedia" : "/dashboard"}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] font-['Poppins',sans-serif] flex flex-col">
      <AdminNavbar activePage={activePage} />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
          {activePage === "user-traffic" ? (
            <UserTrafficView
              trafficTab={trafficTab}
              onTrafficTabChange={setTrafficTab}
            />
          ) : activePage === "location-traffic" ? (
            <LocationTrafficView />
          ) : activePage === "jasa-traffic" ? (
            <JasaTrafficView onSelectReport={setSelectedReport} />
          ) : activePage === "profil" ? (
            <ProfileView
              onSelectReport={setSelectedReport}
              onOpenBroadcast={() => {
                setShowBroadcastSuccess(false);
                setIsBroadcastOpen(true);
              }}
              onOpenFaq={() => {
                setShowFaqSuccess(false);
                setIsFaqOpen(true);
              }}
            />
          ) : (
            <>
          <p className="mb-4 text-xs font-medium text-[#94A3B8]">
            dashboard-overview
          </p>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {ADMIN_STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">
            <div className="rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm xl:col-span-1">
              <p className="text-[#94A3B8] text-xs font-medium mb-1">Block</p>
              <h2 className="text-[#2C1810] font-bold text-base mb-4">
                Users and Transactions Traffic
              </h2>
              <div className="flex gap-4 mb-4 border-b border-[#F3E8FF] pb-3">
                {TRAFFIC_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setTrafficTab(tab)}
                    className={cn(
                      "text-sm font-medium pb-1 border-b-2 transition-colors",
                      trafficTab === tab
                        ? "text-[#7C3AED] border-[#7C3AED]"
                        : "text-[#94A3B8] border-transparent hover:text-[#64748B]",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="h-[210px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={USERS_TRAFFIC}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      dot={{ fill: "#7C3AED", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm">
              <p className="text-[#94A3B8] text-xs font-medium mb-1">Block</p>
              <h2 className="text-[#2C1810] font-bold text-base mb-4">
                Location Traffic
              </h2>
              <div className="h-[220px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LOCATION_TRAFFIC}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                    <XAxis
                      dataKey="region"
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      fill="#E9D5FF"
                      activeBar={{ fill: "#7C3AED" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm">
              <p className="text-[#94A3B8] text-xs font-medium mb-1">Block</p>
              <h2 className="text-[#2C1810] font-bold text-base mb-4">
                Jasa Traffic
              </h2>
              <div className="h-[220px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={JASA_TRAFFIC}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      dot={{ fill: "#7C3AED", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E9D5FF] bg-white p-4 shadow-sm sm:p-6">
            <p className="text-[#94A3B8] text-xs font-medium mb-1">Block</p>
            <h2 className="text-[#2C1810] font-bold text-lg mb-5">Transaction</h2>
            <div className="space-y-2 md:hidden">
              {ADMIN_TRANSACTIONS.map((row, index) => (
                <div
                  key={`${row.provider}-${row.user}-${index}`}
                  className="rounded-lg border border-[#F3E8FF] p-3 text-sm"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium text-[#2C1810]">{row.provider}</p>
                    <span
                      className={cn(
                        "inline-flex px-3 py-1 rounded-full text-xs font-semibold",
                        TRANSACTION_STATUS_STYLES[row.status],
                      )}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="text-[#64748B]">{row.user}</p>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-[#F3E8FF]">
                    <th className="text-left py-3 px-2 text-[#64748B] text-sm font-semibold">
                      Provider Name
                    </th>
                    <th className="text-left py-3 px-2 text-[#64748B] text-sm font-semibold">
                      User Name
                    </th>
                    <th className="text-left py-3 px-2 text-[#64748B] text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_TRANSACTIONS.map((row, index) => (
                    <tr
                      key={`${row.provider}-${row.user}-${index}`}
                      className="border-b border-[#F8FAFC] last:border-0"
                    >
                      <td className="py-4 px-2 text-[#2C1810] text-sm font-medium">
                        {row.provider}
                      </td>
                      <td className="py-4 px-2 text-[#64748B] text-sm">
                        {row.user}
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={cn(
                            "inline-flex px-3 py-1 rounded-full text-xs font-semibold",
                            TRANSACTION_STATUS_STYLES[row.status],
                          )}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
        </div>
      </main>

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
      <BroadcastModal
        isOpen={isBroadcastOpen}
        showSuccess={showBroadcastSuccess}
        onClose={() => {
          setIsBroadcastOpen(false);
          setShowBroadcastSuccess(false);
        }}
        onSubmit={() => setShowBroadcastSuccess(true)}
        onDismissSuccess={() => setShowBroadcastSuccess(false)}
      />
      <FaqModal
        isOpen={isFaqOpen}
        showSuccess={showFaqSuccess}
        onClose={() => {
          setIsFaqOpen(false);
          setShowFaqSuccess(false);
        }}
        onSubmit={() => setShowFaqSuccess(true)}
        onDismissSuccess={() => setShowFaqSuccess(false)}
      />
    </div>
  );
}
