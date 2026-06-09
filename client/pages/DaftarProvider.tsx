import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function DaftarProvider() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-['Poppins',sans-serif] relative overflow-hidden flex flex-col items-center px-4 py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute top-[-80px] right-[-60px] w-[220px] h-[220px] md:w-[380px] md:h-[380px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute top-[200px] left-[-80px] w-[220px] h-[220px] md:w-[380px] md:h-[380px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute bottom-[80px] right-[30%] w-[200px] h-[200px] md:w-[360px] md:h-[360px] rounded-full bg-[#FFF0F8]" />
      <div className="pointer-events-none absolute bottom-[-60px] left-[-40px] w-[200px] h-[200px] md:w-[340px] md:h-[340px] rounded-full bg-[#EDE9FE]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[706px] flex flex-col items-center">
        {/* Logo */}
        <Link to="/">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/204a9c97054fe9fbe2b19613c323c412af8bb108?width=300"
            alt="Temenin Logo"
            className="h-28 md:h-36 w-auto mb-4"
          />
        </Link>

        {/* Subtitle */}
        <p className="text-[#2C1810] text-base md:text-lg font-normal text-center mb-8">
          Isi preferensi jasa yang kamu tawarkan
        </p>

        {/* Steps */}
        <div className="w-full flex flex-col gap-5 mb-8">

          {/* Step 1: Pilihan Jasa */}
          <div className="w-full">
            <p className="text-black text-lg md:text-2xl font-normal mb-3">Pilihan Jasa</p>
            <div className="relative w-full">
              <select className="w-full appearance-none bg-[#F5EBE0] border border-black rounded-xl px-5 py-4 md:py-5 text-black/50 text-base md:text-lg outline-none focus:border-[#7C3AED] transition-colors cursor-pointer">
                <option value="" disabled selected>Pilih Jasa</option>
                <option value="jasa-temenin">Jasa Temenin</option>
                <option value="jasa-curhat">Jasa Curhat</option>
                <option value="jasa-bantu-aktivitas">Jasa Bantu Aktivitas</option>
              </select>
              {/* Purple triangle indicator */}
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 18L6 10h16L14 18z" fill="#7C3AED"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 2: Preferensi dan Minat */}
          <div className="w-full">
            <p className="text-black text-lg md:text-2xl font-normal mb-3">Preferensi dan Minat</p>
            <div className="relative w-full">
              <select className="w-full appearance-none bg-[#F5EBE0] border border-black rounded-xl px-5 py-4 md:py-5 text-black/50 text-base md:text-lg outline-none focus:border-[#7C3AED] transition-colors cursor-pointer">
                <option value="" disabled selected>Pilih Preferensi dan Minat</option>
                <option value="olahraga">Olahraga</option>
                <option value="musik">Musik</option>
                <option value="kuliner">Kuliner</option>
                <option value="seni">Seni</option>
                <option value="teknologi">Teknologi</option>
                <option value="pendidikan">Pendidikan</option>
              </select>
              {/* Purple triangle indicator */}
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 18L6 10h16L14 18z" fill="#7C3AED"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 3: Lokasi */}
          <div className="w-full">
            <p className="text-black text-lg md:text-2xl font-normal mb-3">Lokasi</p>
            {/* 3-column segmented input */}
            <div className="w-full grid grid-cols-3 rounded-xl overflow-hidden border border-black bg-[#F5EBE0]">
              {/* Provinsi */}
              <div className="relative border-r border-black">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex justify-center">
                  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18L0 0h24L12 18z" fill="#7C3AED"/>
                  </svg>
                </div>
                <select className="w-full appearance-none bg-transparent px-3 py-4 md:py-5 text-black/50 text-sm md:text-base outline-none cursor-pointer">
                  <option value="" disabled selected>Provinsi</option>
                  <option value="jakarta">DKI Jakarta</option>
                  <option value="jabar">Jawa Barat</option>
                  <option value="jateng">Jawa Tengah</option>
                  <option value="jatim">Jawa Timur</option>
                  <option value="bali">Bali</option>
                </select>
              </div>

              {/* Kota */}
              <div className="relative border-r border-black">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex justify-center">
                  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18L0 0h24L12 18z" fill="#7C3AED"/>
                  </svg>
                </div>
                <select className="w-full appearance-none bg-transparent px-3 py-4 md:py-5 text-black/50 text-sm md:text-base outline-none cursor-pointer">
                  <option value="" disabled selected>Kota</option>
                  <option value="jakarta-pusat">Jakarta Pusat</option>
                  <option value="jakarta-selatan">Jakarta Selatan</option>
                  <option value="bandung">Bandung</option>
                  <option value="surabaya">Surabaya</option>
                </select>
              </div>

              {/* Kecamatan */}
              <div className="relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex justify-center">
                  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18L0 0h24L12 18z" fill="#7C3AED"/>
                  </svg>
                </div>
                <select className="w-full appearance-none bg-transparent px-3 py-4 md:py-5 text-black/50 text-sm md:text-base outline-none cursor-pointer">
                  <option value="" disabled selected>Kecamatan</option>
                  <option value="menteng">Menteng</option>
                  <option value="kebayoran">Kebayoran Baru</option>
                  <option value="tebet">Tebet</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/daftar")}
            className="py-4 rounded-xl text-white font-semibold text-base md:text-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
          >
            Kembali
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate("/daftar");
                return;
              }
              navigate("/dashboard-penyedia");
            }}
            className="py-4 rounded-xl text-white font-semibold text-base md:text-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
