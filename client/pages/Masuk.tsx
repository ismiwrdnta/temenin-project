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

// Skema validasi untuk Login
const loginSchema = z.object({
  email: z.string().min(1, { message: "Email wajib diisi" }).email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Kata sandi minimal 8 karakter" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Masuk() {
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    console.log("Data Login:", data);
    // Di sini nantinya Anda bisa menambahkan logika API untuk login
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-['Poppins',sans-serif] relative overflow-hidden flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute top-[-40px] right-[-60px] w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute top-[160px] left-[-80px] w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute bottom-[80px] right-[25%] w-[180px] h-[180px] md:w-[260px] md:h-[260px] rounded-full bg-[#FFF0F8]" />

      <div className="relative z-10 w-full max-w-[600px] flex flex-col items-center">
        {/* Logo */}
        <Link to="/">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/c2a1e0d43e8d5993c7a970ad5d90af41ee0bd8eb?width=115"
            alt="Temenin Logo"
            className="h-20 w-auto mb-2"
          />
        </Link>
        <h1 className="text-2xl font-bold text-[#4C1D95] tracking-wide mb-1">TEMENIN</h1>
        <p className="text-[#2C1810] text-base mb-10">Selamat datang kembali</p>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-5 mb-2">
            
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-[#2C1810] text-base font-medium mb-2">Email</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="email"
                      placeholder="alamatemail@example.com"
                      className="w-full bg-[#F5EBE0] border border-[#E5D5C5] rounded-xl px-4 py-4 text-[#2C1810] placeholder-[#94A3B8] text-base outline-none focus:border-[#7C3AED] transition-colors"
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
                  <FormLabel className="block text-[#2C1810] text-base font-medium mb-2">Kata Sandi</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="password"
                      placeholder="Masukkan kata sandi"
                      className="w-full bg-[#F5EBE0] border border-[#E5D5C5] rounded-xl px-4 py-4 text-[#2C1810] placeholder-[#94A3B8] text-base outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Lupa Password */}
            <div className="w-full flex justify-end mb-2">
              <span className="text-[#4C1D95] font-bold text-sm cursor-pointer hover:underline">
                Lupa Password?
              </span>
            </div>

            {/* Masuk Sekarang Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl text-white font-semibold text-lg mb-5 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
            >
              Masuk Sekarang
            </button>
          </form>
        </Form>

        {/* Belum punya akun */}
        <p className="text-[#94A3B8] text-sm mb-8">
          Belum punya akun?{" "}
          <Link to="/daftar" className="text-[#4C1D95] font-bold hover:underline">
            Daftar Gratis
          </Link>
        </p>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 mb-5">
          <hr className="flex-1 border-[#E5D5C5]" />
          <span className="text-[#94A3B8] text-sm whitespace-nowrap">atau masuk dengan</span>
          <hr className="flex-1 border-[#E5D5C5]" />
        </div>

        {/* Google Button */}
        <button type="button" className="w-full py-4 rounded-xl border border-[#E91E8C] bg-[#F5EBE0] flex items-center justify-center gap-3 font-bold text-[#E91E8C] text-base hover:bg-[#fce7f3] transition-colors">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.6 11.23c0-.77-.07-1.5-.19-2.21H11v4.18h5.96a5.09 5.09 0 01-2.21 3.34v2.78h3.58C20.33 17.5 21.6 14.6 21.6 11.23z" fill="#4285F4"/>
            <path d="M11 22c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.28-1.93-6.14-4.52H1.17v2.86A11 11 0 0011 22z" fill="#34A853"/>
            <path d="M4.86 13.1A6.6 6.6 0 014.52 11c0-.73.13-1.44.34-2.1V6.04H1.17A11 11 0 000 11c0 1.77.43 3.45 1.17 4.96l3.69-2.86z" fill="#FBBC05"/>
            <path d="M11 4.38c1.62 0 3.06.56 4.2 1.65l3.16-3.16A10.98 10.98 0 0011 0 11 11 0 001.17 6.04l3.69 2.86C5.72 6.31 8.14 4.38 11 4.38z" fill="#EA4335"/>
          </svg>
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
}
