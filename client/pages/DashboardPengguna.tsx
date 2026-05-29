import { useState } from "react";
import { Link } from "react-router-dom";

// --- Mock Data ---
// Ubah nilai-nilai di bawah ini untuk mengetes state kosong (0)
const MOCK_USER_DATA = {
  name: "Diah Ayu Lestari",
  initials: "DA",
  balance: 20750, // Ubah ke 0 untuk test saldo kosong
  stats: {
    active: 1,    // Ubah ke 0
    completed: 18, // Ubah ke 0
    rating: 4.9,   // Ubah ke 0
    curhat: 3      // Ubah ke 0
  }
};

const MOCK_ACTIVE_ORDERS = [
  {
    id: 1,
    name: "Rafi Ananda",
    initials: "RA",
    service: "Jasa Temenin",
    duration: "2 jam",
    time: "Hari ini, 14:00 - 16:00",
    isNew: true
  }
]; // Ubah menjadi [] untuk mengetes state pesanan aktif kosong

const MOCK_NEARBY_USERS = [
  {
    id: 1,
    name: "Rafi Ananda",
    initials: "RA",
    tags: ["Temenin", "Curhat"],
    rating: 4.88,
    reviews: 83,
    price: "70rb/Jam",
    distance: "1.2 km"
  },
  {
    id: 2,
    name: "Sari Dewi",
    initials: "RA", // Mengikuti desain figma yang menggunakan inisial sama untuk contoh
    tags: ["Curhat", "Bantu"],
    rating: 4.88,
    reviews: 61,
    price: "70rb/Jam",
    distance: "0.8 km"
  },
  {
    id: 3,
    name: "Bimo Pratama",
    initials: "RA",
    tags: ["Temenin", "Bantu"],
    rating: 4.75,
    reviews: 45,
    price: "65rb/Jam",
    distance: "2.1 km"
  }
];

export default function DashboardPengguna() {
  // Menggunakan state agar reaktif jika nanti dihubungkan dengan API
  const [userData] = useState(MOCK_USER_DATA);
  const [activeOrders] = useState(MOCK_ACTIVE_ORDERS);
  const [nearbyUsers] = useState(MOCK_NEARBY_USERS);

  // Format mata uang Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0).replace("Rp", "Rp ");
  };

  return (
    <div className="min-h-screen bg-[#E5E5E5] font-['Poppins',sans-serif] pb-20">
      {/* Main Container - Menyesuaikan background abu-abu dari figma */}
      <div className="max-w-[1440px] mx-auto bg-[#E5E5E5] min-h-screen flex justify-center pt-8 px-4">
        
        {/* Content Wrapper - Background putih untuk area konten utama */}
        <div className="w-full max-w-[900px] bg-[#F8F9FA] rounded-3xl p-8 shadow-sm relative overflow-hidden">
          
          {/* Decorative Background Elements (Opsional, meniru figma) */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FDF4FF] rounded-full blur-3xl opacity-60"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F3E8FF] rounded-full blur-3xl opacity-60"></div>
          </div>

          <div className="relative z-10">
            {/* Navbar */}
            <header className="w-full bg-[#FFF0F8] rounded-full px-6 py-3 flex items-center justify-between mb-10 shadow-sm">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
                  alt="Temenin Logo"
                  className="h-8 w-auto"
                />
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/dashboard" className="text-[#7C3AED] font-semibold text-sm">Beranda</Link>
                <Link to="#" className="text-[#D8B4E2] hover:text-[#7C3AED] font-medium text-sm transition-colors">Pencarian</Link>
                <Link to="#" className="text-[#D8B4E2] hover:text-[#7C3AED] font-medium text-sm transition-colors">Jasa Temenin</Link>
                <Link to="#" className="text-[#D8B4E2] hover:text-[#7C3AED] font-medium text-sm transition-colors">Pesanan</Link>
                <Link to="#" className="text-[#D8B4E2] hover:text-[#7C3AED] font-medium text-sm transition-colors">Profil</Link>
              </nav>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] text-[#2C1810] leading-tight">Selamat datang,</p>
                  <p className="text-xs font-bold text-[#4C1D95] leading-tight">{userData.name}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm border border-[#F9A8D4]">
                  {userData.initials}
                </div>
              </div>
            </header>

            {/* Action Buttons Section */}
            <div className="mb-8">
              <h2 className="text-[#2C1810] font-semibold text-base mb-4">Apa yang kamu butuhkan hari ini?</h2>
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#E91E8C] hover:bg-[#D81B60] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
                  Cari Temanian
                </button>
                <button className="bg-transparent border border-[#E91E8C] text-[#E91E8C] hover:bg-[#FDF4FF] px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
                  Curhat Anonim
                </button>
              </div>
            </div>

            {/* Saldo Card */}
            <div className="bg-[#F3E8FF] rounded-2xl p-6 mb-8 shadow-sm border border-[#E9D5FF]">
              <p className="text-[#4C1D95] text-sm font-medium mb-1">Saldo TEMENIN</p>
              <h3 className="text-3xl font-bold text-[#2C1810] mb-4">{formatRupiah(userData.balance)}</h3>
              <button className="bg-white text-[#4C1D95] border border-[#E9D5FF] hover:bg-gray-50 px-4 py-1.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 shadow-sm w-fit">
                <span className="text-lg leading-none">+</span> Top Up
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100">
                <span className="text-3xl font-bold text-[#4C1D95] mb-2">{userData.stats.active || 0}</span>
                <span className="text-[#94A3B8] text-xs font-medium text-center">Pesanan aktif</span>
              </div>
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100">
                <span className="text-3xl font-bold text-[#4C1D95] mb-2">{userData.stats.completed || 0}</span>
                <span className="text-[#94A3B8] text-xs font-medium text-center">Sesi selesai</span>
              </div>
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100">
                <span className="text-3xl font-bold text-[#4C1D95] mb-2">{userData.stats.rating || 0}</span>
                <span className="text-[#94A3B8] text-xs font-medium text-center">Rating diberikan</span>
              </div>
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100">
                <span className="text-3xl font-bold text-[#4C1D95] mb-2">{userData.stats.curhat || 0}</span>
                <span className="text-[#94A3B8] text-xs font-medium text-center">Sesi Temenin Curhat</span>
              </div>
            </div>

            {/* Pesanan Aktif Section */}
            <div className="mb-10">
              <h3 className="text-[#2C1810] font-bold text-base mb-4">Pesanan Aktif</h3>
              
              {activeOrders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 relative overflow-hidden">
                      {/* Pink Left Border Indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E91E8C]"></div>
                      
                      <div className="flex items-center gap-4 pl-2">
                        <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm">
                          {order.initials}
                        </div>
                        <div>
                          <h4 className="text-[#4C1D95] font-bold text-base">{order.name}</h4>
                          <p className="text-[#94A3B8] text-xs mt-0.5">{order.service} • {order.duration}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-[#F59E0B] text-xs font-medium">{order.time}</p>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <button className="bg-[#E91E8C] hover:bg-[#D81B60] text-white px-5 py-2 rounded-xl font-medium text-xs transition-colors">
                        Lihat Detail
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full py-8 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm">
                  <p className="text-[#94A3B8] font-medium text-sm">Belum ada pesanan aktif saat ini.</p>
                </div>
              )}
            </div>

            {/* Temanian Terdekat Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#2C1810] font-bold text-base">Temanian Terdekat</h3>
                <Link to="#" className="text-[#E91E8C] text-sm font-medium hover:underline">Lihat Semua</Link>
              </div>
              
              {nearbyUsers.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {nearbyUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm">
                          {user.initials}
                        </div>
                        <div>
                          <h4 className="text-[#4C1D95] font-bold text-base">{user.name}</h4>
                          
                          {/* Tags */}
                          <div className="flex gap-2 mt-1.5 mb-1.5">
                            {user.tags.map((tag, index) => (
                              <span key={index} className="bg-[#FDF4FF] text-[#E91E8C] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#FBCFE8]">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          {/* Rating & Price */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="#2C1810" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                              </svg>
                              <span className="font-bold text-[#2C1810]">{user.rating}</span>
                              <span className="text-[#94A3B8]">({user.reviews})</span>
                            </div>
                            <span className="text-[#94A3B8]">-</span>
                            <span className="font-bold text-[#4C1D95]">{user.price}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Distance */}
                      <div className="text-[#94A3B8] text-xs font-medium">
                        {user.distance}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full py-8 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm">
                  <p className="text-[#94A3B8] font-medium text-sm">Belum ada Temanian dalam jarak terdekat.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
