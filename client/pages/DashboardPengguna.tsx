import { useState } from "react";
import { Link } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { cn } from "@/lib/utils";

const MOCK_USER_DATA = {
  name: "Diah Ayu Lestari",
  initials: "DA",
  balance: 0,
  stats: {
    active: 0,
    completed: 0,
    rating: 0,
    curhat: 0,
  },
};

const MOCK_ACTIVE_ORDERS: ActiveOrder[] = [];
const MOCK_NEARBY_USERS: NearbyUser[] = [];

type ActiveOrder = {
  id: number;
  name: string;
  initials: string;
  service: string;
  duration: string;
  time: string;
  isNew?: boolean;
};

type NearbyUser = {
  id: number;
  name: string;
  initials: string;
  tags: string[];
  rating: number;
  reviews: number;
  price: string;
  distance: string;
};

function EmptyStateCard({
  message,
  hint,
  action,
}: {
  message: string;
  hint?: string;
  action?: { label: string; onClick?: () => void };
}) {
  return (
    <div className="w-full py-10 lg:py-12 px-6 bg-white rounded-2xl border border-dashed border-[#E9D5FF] flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-3">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D8B4E2"
          strokeWidth="1.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-[#64748B] font-medium text-sm max-w-xs">{message}</p>
      {hint && (
        <p className="text-[#94A3B8] text-xs mt-1.5 max-w-sm">{hint}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 bg-[#E91E8C] hover:bg-[#D81B60] text-white px-5 py-2 rounded-xl font-medium text-xs transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  emptyLabel,
  formatValue,
}: {
  value: number;
  label: string;
  emptyLabel: string;
  formatValue?: (v: number) => string;
}) {
  const isEmpty = !value || value <= 0;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 lg:p-6 flex flex-col items-center justify-center shadow-sm border min-h-[120px]",
        isEmpty ? "border-dashed border-[#E9D5FF]" : "border-gray-100",
      )}
    >
      {isEmpty ? (
        <>
          <span className="text-sm font-semibold text-[#94A3B8] mb-1.5 text-center leading-snug">
            {emptyLabel}
          </span>
          <span className="text-[#CBD5E1] text-xs font-medium text-center">
            {label}
          </span>
        </>
      ) : (
        <>
          <span className="text-3xl lg:text-4xl font-bold text-[#4C1D95] mb-2">
            {formatValue ? formatValue(value) : value}
          </span>
          <span className="text-[#94A3B8] text-xs font-medium text-center">
            {label}
          </span>
        </>
      )}
    </div>
  );
}

export default function DashboardPengguna() {
  const [userData] = useState(MOCK_USER_DATA);
  const [activeOrders] = useState(MOCK_ACTIVE_ORDERS);
  const [nearbyUsers] = useState(MOCK_NEARBY_USERS);

  const hasBalance = userData.balance > 0;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "Rp ");
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] font-['Poppins',sans-serif] flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FDF4FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#F3E8FF] rounded-full blur-3xl opacity-50" />
      </div>

      <AppNavbar
        activePage="beranda"
        userName={userData.name}
        userInitials={userData.initials}
      />

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          <section className="mb-8 lg:mb-10">
            <h1 className="text-[#2C1810] font-bold text-xl lg:text-2xl mb-1">
              Halo, {userData.name.split(" ")[0]}!
            </h1>
            <p className="text-[#94A3B8] text-sm mb-5">
              Apa yang kamu butuhkan hari ini?
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/pencarian"
                className="bg-[#E91E8C] hover:bg-[#D81B60] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm inline-block"
              >
                Cari Temanian
              </Link>
              <button className="bg-transparent border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FDF4FF] px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
                Curhat Anonim
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 lg:mb-10">
            {/* Saldo */}
            <div
              className={cn(
                "lg:col-span-4 rounded-2xl p-6 lg:p-8 shadow-sm border flex flex-col justify-between min-h-[160px]",
                hasBalance
                  ? "bg-[#F3E8FF] border-[#E9D5FF]"
                  : "bg-[#FAFAFA] border-dashed border-[#E9D5FF]",
              )}
            >
              <div>
                <p className="text-[#4C1D95] text-sm font-medium mb-1">
                  Saldo TEMENIN
                </p>
                {hasBalance ? (
                  <h3 className="text-3xl lg:text-4xl font-bold text-[#2C1810]">
                    {formatRupiah(userData.balance)}
                  </h3>
                ) : (
                  <>
                    <h3 className="text-xl lg:text-2xl font-semibold text-[#94A3B8]">
                      Belum terisi
                    </h3>
                    <p className="text-[#94A3B8] text-xs mt-2 leading-relaxed">
                      Isi saldo dulu untuk mulai pesan jasa Temenin.
                    </p>
                  </>
                )}
              </div>
              <button
                className={cn(
                  "mt-6 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 shadow-sm w-fit",
                  hasBalance
                    ? "bg-white text-[#4C1D95] border border-[#E9D5FF] hover:bg-gray-50"
                    : "bg-[#E91E8C] hover:bg-[#D81B60] text-white border-0",
                )}
              >
                <span className="text-lg leading-none">+</span>
                {hasBalance ? "Top Up" : "Isi Saldo"}
              </button>
            </div>

            {/* Stats */}
            <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                value={userData.stats.active}
                label="Pesanan aktif"
                emptyLabel="Belum ada pesanan"
              />
              <StatCard
                value={userData.stats.completed}
                label="Sesi selesai"
                emptyLabel="Belum ada sesi"
              />
              <StatCard
                value={userData.stats.rating}
                label="Rating diberikan"
                emptyLabel="Belum ada rating"
                formatValue={(v) => v.toFixed(1)}
              />
              <StatCard
                value={userData.stats.curhat}
                label="Sesi Temenin Curhat"
                emptyLabel="Belum ada sesi"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10">
            <div>
              <h3 className="text-[#2C1810] font-bold text-base lg:text-lg mb-4">
                Pesanan Aktif
              </h3>

              {activeOrders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm border border-gray-100 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E91E8C]" />

                      <div className="flex items-center gap-4 pl-2">
                        <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm flex-shrink-0">
                          {order.initials}
                        </div>
                        <div>
                          <h4 className="text-[#4C1D95] font-bold text-base">
                            {order.name}
                          </h4>
                          <p className="text-[#94A3B8] text-xs mt-0.5">
                            {order.service} • {order.duration}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-[#F59E0B] text-xs font-medium">
                              {order.time}
                            </p>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="#F59E0B"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <button className="bg-[#E91E8C] hover:bg-[#D81B60] text-white px-5 py-2 rounded-xl font-medium text-xs transition-colors sm:ml-auto w-full sm:w-auto">
                        Lihat Detail
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStateCard
                  message="Belum ada pesanan aktif"
                  hint="Pesan jasa Temenin untuk melihat pesanan yang sedang berjalan di sini."
                  action={{ label: "Cari Temanian" }}
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#2C1810] font-bold text-base lg:text-lg">
                  Temanian Terdekat
                </h3>
                {nearbyUsers.length > 0 && (
                  <Link
                    to="#"
                    className="text-[#E91E8C] text-sm font-medium hover:underline"
                  >
                    Lihat Semua
                  </Link>
                )}
              </div>

              {nearbyUsers.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {nearbyUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm flex-shrink-0">
                          {user.initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[#4C1D95] font-bold text-base">
                            {user.name}
                          </h4>

                          <div className="flex flex-wrap gap-2 mt-1.5 mb-1.5">
                            {user.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-[#FDF4FF] text-[#E91E8C] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#FBCFE8]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <div className="flex items-center gap-1">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="#2C1810"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                              </svg>
                              <span className="font-bold text-[#2C1810]">
                                {user.rating}
                              </span>
                              <span className="text-[#94A3B8]">
                                ({user.reviews})
                              </span>
                            </div>
                            <span className="text-[#94A3B8]">-</span>
                            <span className="font-bold text-[#4C1D95]">
                              {user.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[#94A3B8] text-xs font-medium sm:text-right flex-shrink-0">
                        {user.distance}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStateCard
                  message="Belum ada Temanian terdekat"
                  hint="Aktifkan lokasi atau cari Temanian untuk melihat rekomendasi di sekitarmu."
                  action={{ label: "Cari Temanian" }}
                />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
