import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="font-['Poppins',sans-serif] bg-[#FFFCF9] overflow-x-hidden">
      {/* Navbar */}
      <nav className="px-4 md:px-8 py-4">
        <div className="max-w-[1236px] mx-auto bg-[#FCE7F3] rounded-[30px] px-6 py-4 flex items-center justify-between">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
            alt="Temenin Logo"
            className="h-12 w-auto"
          />
          <div className="flex items-center gap-3">
            <Link to="/masuk" className="px-6 py-2.5 rounded-[10px] border border-[#E91E8C] bg-[#F5EBE0] text-[#E91E8C] font-semibold text-base md:text-lg hover:bg-[#fce7f3] transition-colors">
              Masuk
            </Link>
            <Link to="/daftar" className="px-6 py-2.5 rounded-[10px] border border-[#7C3AED] text-white font-semibold text-base md:text-lg" style={{background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)'}}>
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 md:px-8 pt-8 pb-16 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[5%] w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#EDE9FE] -z-0 pointer-events-none" />
        <div className="absolute top-[120px] left-[-60px] w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#EDE9FE] -z-0 pointer-events-none" />
        <div className="absolute top-[400px] right-[40%] w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#FFF0F8] -z-0 pointer-events-none" />

        <div className="relative max-w-[1236px] mx-auto z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 border border-[#C8007A] rounded-[10px] px-4 py-2.5 mb-6">
            <div className="w-4 h-4 rounded-full bg-[#7C3AED] flex-shrink-0" />
            <span className="text-[#4C1D95] text-sm md:text-base font-normal">
              10.000+ Temanian Aktif Se-Indonesia
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[160%] mb-4 max-w-2xl">
            <span className="text-[#2C1810]">Gak Mau Sendirian? </span>
            <br />
            <span className="text-[#2C1810]">Yuk </span>
            <span className="text-[#4C1D95]">Temenin </span>
            <span className="text-[#2C1810]">Yuk</span>
          </h1>

          {/* Description */}
          <p className="text-[#2C1810] text-base md:text-lg font-normal leading-[160%] max-w-2xl mb-8">
            Temukan teman aktivitas, teman curhat, atau bantuan sehari-hari dari
            Temanian terverifikasi di sekitarmu
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-16">
            <Link
              to="/daftar"
              className="px-8 py-4 rounded-[10px] border border-[#7C3AED] text-white font-semibold text-base md:text-lg"
              style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
            >
              Cari Temanian Sekarang
            </Link>
            <Link to="/daftar" className="px-8 py-4 rounded-[10px] border border-[#E91E8C] bg-[#F5EBE0] text-[#E91E8C] font-semibold text-base md:text-lg hover:bg-[#fce7f3] transition-colors">
              Jadi Provider
            </Link>
          </div>

          {/* Divider */}
          <hr className="border-[#E91E8C] mb-10" />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#4C1D95]">10K+</p>
              <p className="text-[#94A3B8] text-base md:text-lg font-normal mt-1">Temanian Aktif</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#4C1D95]">5K+</p>
              <p className="text-[#94A3B8] text-base md:text-lg font-normal mt-1">Sesi Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#4C1D95]">4,7 ★</p>
              <p className="text-[#94A3B8] text-base md:text-lg font-normal mt-1">2rb+ ulasan</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#4C1D95]">98 Kota</p>
              <p className="text-[#94A3B8] text-base md:text-lg font-normal mt-1">Se-Indonesia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Kami */}
      <section className="bg-[#FAF5F0] px-4 md:px-8 py-16">
        <div className="max-w-[1236px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-10">Layanan Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-[30px] border border-[#E91E8C] p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F8] flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm0 4a4 4 0 110 8 4 4 0 010-8zm0 17.2c-3.33 0-6.28-1.7-8-4.3.04-2.65 5.33-4.1 8-4.1s7.96 1.45 8 4.1c-1.72 2.6-4.67 4.3-8 4.3z" fill="#E91E8C"/>
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-black mb-2">Jasa Temenin</h3>
              <p className="text-[#94A3B8] text-base mb-2">Hangout, Nonton, Olahraga bareng</p>
              <p className="text-2xl md:text-3xl font-bold text-[#4C1D95]">50-75rb/jam</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[30px] border border-[#E91E8C] p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F8] flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M26 4H6C4.9 4 4 4.9 4 6v16c0 1.1.9 2 2 2h4v4l5.33-4H26c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2 14H8v-2h16v2zm0-4H8v-2h16v2zm0-4H8V8h16v2z" fill="#E91E8C"/>
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-black mb-2">Jasa Curhat</h3>
              <p className="text-[#94A3B8] text-base mb-2">Didengar tanpa dihakimi</p>
              <p className="text-2xl md:text-3xl font-bold text-[#4C1D95]">25-50rb/jam</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[30px] border border-[#E91E8C] p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F8] flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M24 6H8C6.9 6 6 6.9 6 8v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 14H10v-2h12v2zm0-4H10v-2h12v2zm0-4H10v-2h12v2z" fill="#E91E8C"/>
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-black mb-2">Jasa Bantu Aktivitas</h3>
              <p className="text-[#94A3B8] text-base mb-2">Antar dokumen, ambil rapor</p>
              <p className="text-2xl md:text-3xl font-bold text-[#4C1D95]">40rb/aktivitas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kenapa TEMENIN? */}
      <section className="relative px-4 md:px-8 py-16 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-[5%] w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#EDE9FE] -z-0 pointer-events-none" />
        <div className="absolute top-[200px] left-[-60px] w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#EDE9FE] -z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-[30%] w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-[#FFF0F8] -z-0 pointer-events-none" />

        <div className="relative max-w-[1236px] mx-auto z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-10">Kenapa TEMENIN?</h2>

          <div className="flex flex-col gap-6">
            {/* Feature 1 */}
            <div className="bg-[#FAF5F0] rounded-[20px] border border-[#E91E8C] px-8 py-8 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF0F8] flex items-center justify-center flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2C7.37 2 2 7.37 2 14s5.37 12 12 12 12-5.37 12-12S20.63 2 14 2zm-1 17l-5-5 1.41-1.41L13 16.17l7.59-7.59L22 10l-9 9z" fill="#E91E8C"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#2C1810] mb-1">Sistem Escrow Aman</h3>
                <p className="text-[#94A3B8] text-base md:text-lg">Dana kamu tersimpan aman, hanya cair ke provider setelah sesi selesai</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAF5F0] rounded-[20px] border border-[#E91E8C] px-8 py-8 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF0F8] flex items-center justify-center flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2C7.37 2 2 7.37 2 14s5.37 12 12 12 12-5.37 12-12S20.63 2 14 2zm0 4a4 4 0 110 8 4 4 0 010-8zm0 17.2c-3.33 0-6.28-1.7-8-4.3.04-2.65 5.33-4.1 8-4.1s7.96 1.45 8 4.1c-1.72 2.6-4.67 4.3-8 4.3z" fill="#E91E8C"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#2C1810] mb-1">Provider Terverifikasi KTP</h3>
                <p className="text-[#94A3B8] text-base md:text-lg">Semua provider wajib verifikasi identitas sebelum aktif</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAF5F0] rounded-[20px] border border-[#E91E8C] px-8 py-8 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF0F8] flex items-center justify-center flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2C7.37 2 2 7.37 2 14s5.37 12 12 12 12-5.37 12-12S20.63 2 14 2zm1 17h-2v-6h2v6zm0-8h-2V9h2v2z" fill="#E91E8C"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#2C1810] mb-1">Panic Button 24/7</h3>
                <p className="text-[#94A3B8] text-base md:text-lg">Fitur keamanan darurat yang langsung menghubungi tim CS kami</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-16 flex flex-col items-center text-center">
        <Link
          to="/daftar"
          className="px-10 py-4 rounded-[10px] border border-[#7C3AED] text-white font-semibold text-lg mb-4"
          style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
        >
          Mulai Sekarang! Gratis
        </Link>
        <p className="text-[#94A3B8] text-base md:text-lg">
          Sudah punya akun?{' '}
          <Link to="/masuk" className="text-[#4C1D95] font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </section>
    </div>
  );
}
