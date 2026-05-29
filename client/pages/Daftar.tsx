import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Role = "pengguna" | "penyedia";

// Skema validasi untuk Pendaftaran
const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
  email: z.string().min(1, { message: "Email wajib diisi" }).email({ message: "Format email tidak valid" }),
  phone: z
    .string()
    .min(10, { message: "Nomor HP minimal 10 angka" })
    .regex(/^[0-9]+$/, { message: "Nomor HP hanya boleh berisi angka" }),
  password: z.string().min(8, { message: "Kata sandi minimal 8 karakter" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Daftar() {
  const [role, setRole] = useState<Role>("pengguna");
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  function onSubmit(data: RegisterFormValues) {
    console.log("Data Pendaftaran:", { ...data, role });
    // Di sini nantinya Anda bisa menambahkan logika API untuk register
    navigate(role === "penyedia" ? "/daftar-provider" : "/otp");
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-['Poppins',sans-serif] relative overflow-hidden flex flex-col items-center px-4 py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute top-[-60px] right-[-60px] w-[220px] h-[220px] md:w-[380px] md:h-[380px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute top-[220px] left-[-80px] w-[220px] h-[220px] md:w-[380px] md:h-[380px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute bottom-[120px] right-[-40px] w-[200px] h-[200px] md:w-[340px] md:h-[340px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute bottom-[-40px] left-[25%] w-[200px] h-[200px] md:w-[320px] md:h-[320px] rounded-full bg-[#FFF0F8]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[706px] flex flex-col items-center">
        {/* Logo */}
        <Link to="/">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=300"
            alt="Temenin Logo"
            className="h-24 md:h-32 w-auto mb-3"
          />
        </Link>

        {/* Subtitle */}
        <p className="text-[#2C1810] text-base md:text-lg font-normal mb-8">Buat akun baru, gratis!</p>

        {/* Daftar Sebagai */}
        <div className="w-full mb-8">
          <p className="text-[#2C1810] font-medium text-base md:text-lg mb-4">Daftar Sebagai</p>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {/* Pengguna */}
            <button
              type="button"
              onClick={() => setRole("pengguna")}
              className={`flex flex-col items-center justify-center py-10 md:py-14 px-4 rounded-2xl border-2 transition-all ${
                role === "pengguna"
                  ? "border-[#7C3AED]"
                  : "border-transparent"
              } bg-[#F5EBE0]`}
            >
              {/* User icon */}
              <svg width="72" height="86" viewBox="0 0 80 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="40" cy="30" rx="24" ry="28" fill="#4C1D95"/>
                <path d="M0 85c0-22.091 17.909-40 40-40s40 17.909 40 40v10H0V85z" fill="#4C1D95"/>
              </svg>
              <span className="mt-4 font-bold text-[#2C1810] text-base md:text-lg">Pengguna</span>
              <span className="text-[#94A3B8] text-sm md:text-base mt-1">Cari Temanian</span>
            </button>

            {/* Penyedia Jasa */}
            <button
              type="button"
              onClick={() => setRole("penyedia")}
              className={`flex flex-col items-center justify-center py-10 md:py-14 px-4 rounded-2xl border-2 transition-all ${
                role === "penyedia"
                  ? "border-[#7C3AED]"
                  : "border-transparent"
              } bg-[#F5EBE0]`}
            >
              {/* Handshake icon */}
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M52 20c0 11.046-8.954 20-20 20S12 31.046 12 20 20.954 0 32 0s20 8.954 20 20z" fill="#4C1D95"/>
                <path d="M84 20c0 11.046-8.954 20-20 20S44 31.046 44 20 52.954 0 64 0s20 8.954 20 20z" fill="#4C1D95"/>
                <path d="M0 72c0-19.882 16.118-36 36-36h24c19.882 0 36 16.118 36 36v10H0V72z" fill="#4C1D95"/>
                <path d="M34 58l10 9 18-18" stroke="#FFFCF9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="mt-4 font-bold text-[#2C1810] text-base md:text-lg">Penyedia Jasa</span>
              <span className="text-[#94A3B8] text-sm md:text-base mt-1">Tawarkan jasa</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-5 mb-3">
            
            {/* Nama Lengkap */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-black text-lg md:text-2xl font-normal mb-2">Nama Lengkap</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="w-full bg-[#F5EBE0] border border-black rounded-xl px-5 py-4 md:py-5 text-[#2C1810] placeholder-black/50 text-base md:text-lg outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-black text-lg md:text-2xl font-normal mb-2">Email</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="email"
                      placeholder="Masukkan alamat email"
                      className="w-full bg-[#F5EBE0] border border-black rounded-xl px-5 py-4 md:py-5 text-[#2C1810] placeholder-black/50 text-base md:text-lg outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* No HP */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-black text-lg md:text-2xl font-normal mb-2">No HP</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="tel"
                      placeholder="Masukkan nomor telepon"
                      className="w-full bg-[#F5EBE0] border border-black rounded-xl px-5 py-4 md:py-5 text-[#2C1810] placeholder-black/50 text-base md:text-lg outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Kata Sandi */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-black text-lg md:text-2xl font-normal mb-2">Kata Sandi (Min. 8 Karakter)</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="password"
                      placeholder="Masukkan kata sandi disini"
                      className="w-full bg-[#F5EBE0] border border-black rounded-xl px-5 py-4 md:py-5 text-[#2C1810] placeholder-black/50 text-base md:text-lg outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Masuk Sekarang Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl text-white font-semibold text-lg mt-4 mb-5 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
            >
              Daftar Sekarang
            </button>
          </form>
        </Form>

        {/* Belum punya akun */}
        <p className="text-[#94A3B8] text-base mb-8 text-center">
          Sudah punya akun?{' '}
          <Link to="/masuk" className="text-[#4C1D95] font-bold hover:underline">
            Masuk
          </Link>
        </p>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 mb-5">
          <hr className="flex-1 border-[#E5D5C5]" />
          <span className="text-[#94A3B8] text-base whitespace-nowrap">atau daftar dengan</span>
          <hr className="flex-1 border-[#E5D5C5]" />
        </div>

        {/* Google Button */}
        <button type="button" className="w-full py-4 rounded-xl border border-[#E91E8C] bg-[#F5EBE0] flex items-center justify-center gap-3 font-semibold text-[#E91E8C] text-base md:text-lg hover:bg-[#fce7f3] transition-colors">
          <svg width="26" height="26" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.6 11.23c0-.77-.07-1.5-.19-2.21H11v4.18h5.96a5.09 5.09 0 01-2.21 3.34v2.78h3.58C20.33 17.5 21.6 14.6 21.6 11.23z" fill="#4285F4"/>
            <path d="M11 22c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.28-1.93-6.14-4.52H1.17v2.86A11 11 0 0011 22z" fill="#34A853"/>
            <path d="M4.86 13.1A6.6 6.6 0 014.52 11c0-.73.13-1.44.34-2.1V6.04H1.17A11 11 0 000 11c0 1.77.43 3.45 1.17 4.96l3.69-2.86z" fill="#FBBC05"/>
            <path d="M11 4.38c1.62 0 3.06.56 4.2 1.65l3.16-3.16A10.98 10.98 0 0011 0 11 11 0 001.17 6.04l3.69 2.86C5.72 6.31 8.14 4.38 11 4.38z" fill="#EA4335"/>
          </svg>
          Lanjut dengan Google
        </button>
      </div>
    </div>
  );
}
