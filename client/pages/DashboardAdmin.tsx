import { useState } from "react";
import { Navigate } from "react-router-dom";
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
import { TrendingDown, TrendingUp } from "lucide-react";
import AdminNavbar from "@/components/AdminNavbar";
import { useAuth } from "@/context/AuthContext";
import {
  ADMIN_STATS,
  ADMIN_TRANSACTIONS,
  JASA_TRAFFIC,
  LOCATION_TRAFFIC,
  TRANSACTION_STATUS_STYLES,
  USERS_TRAFFIC,
} from "@/data/admin-dashboard";
import { cn } from "@/lib/utils";

const TRAFFIC_TABS = ["Users", "Providers", "Transaction"] as const;

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

export default function DashboardAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [trafficTab, setTrafficTab] =
    useState<(typeof TRAFFIC_TABS)[number]>("Users");

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
      <AdminNavbar activePage="dashboard" />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          <p className="text-[#94A3B8] text-xs font-medium mb-4">
            dashboard-overview
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {ADMIN_STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
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
              <div className="h-[220px]">
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
              <div className="h-[260px]">
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
              <div className="h-[260px]">
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

          <div className="rounded-2xl border border-[#E9D5FF] bg-white p-5 sm:p-6 shadow-sm">
            <p className="text-[#94A3B8] text-xs font-medium mb-1">Block</p>
            <h2 className="text-[#2C1810] font-bold text-lg mb-5">Transaction</h2>
            <div className="overflow-x-auto">
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
        </div>
      </main>
    </div>
  );
}
