import { useRef, useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { maskEmail } from "@/lib/authApi";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 165; // 2:45

export default function OtpVerifikasi() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const email =
    (location.state as { email?: string } | null)?.email ?? user?.email;
  const maskedEmail = email ? maskEmail(email) : "email kamu";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#FFFCF9] font-['Poppins',sans-serif] relative overflow-hidden flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute top-[-40px] right-[-60px] w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute top-[120px] left-[-80px] w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full bg-[#EDE9FE]" />
      <div className="pointer-events-none absolute bottom-[60px] right-[20%] w-[180px] h-[180px] md:w-[260px] md:h-[260px] rounded-full bg-[#FFF0F8]" />

      <div className="relative z-10 w-full max-w-[600px] flex flex-col items-center text-center">
        {/* Gmail icon */}
        <div className="mb-6">
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="60" rx="4" fill="white"/>
            <path d="M6 10h68v40H6z" fill="white"/>
            <path d="M6 10l34 24L74 10" stroke="#EA4335" strokeWidth="0"/>
            <path d="M6 10v40h10V24L40 42l24-18v26h10V10L40 34 6 10z" fill="#4285F4"/>
            <path d="M6 10l34 24L74 10H6z" fill="#EA4335"/>
            <path d="M6 50V10l34 24L74 10v40" fill="none"/>
            <path d="M16 24v26H6V10l10 14z" fill="#34A853"/>
            <path d="M64 24v26h10V10L64 24z" fill="#FBBC05"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#2C1810] mb-3">Cek Email Kamu</h1>

        {/* Subtitle */}
        <p className="text-[#94A3B8] text-base mb-1">Kode OTP 6 digit telah dikirim ke</p>
        <p className="text-[#2C1810] font-bold text-base mb-1">{maskedEmail}</p>
        <p className="text-[#94A3B8] text-base mb-10">
          Berlaku selama <span className="text-[#4C1D95] font-bold">10 menit</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-3 md:gap-4 mb-10">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 md:w-16 md:h-[72px] text-center text-xl font-bold rounded-xl border-2 bg-[#F5EBE0] outline-none transition-colors
                ${digit ? "border-[#E91E8C] text-[#E91E8C]" : "border-[#E91E8C]/40 text-[#2C1810]"}
                focus:border-[#E91E8C]`}
            />
          ))}
        </div>

        {/* Verifikasi Button */}
        <button
          className="w-full max-w-[600px] py-4 rounded-xl text-white font-semibold text-lg mb-5 transition-opacity"
          style={{ background: 'linear-gradient(90deg, #E91E8C 0%, #A131CC 100%)' }}
          onClick={() => {
            if (!isAuthenticated) {
              navigate("/masuk", { replace: true });
              return;
            }
            navigate("/dashboard");
          }}
        >
          Verifikasi OTP
        </button>

        {/* Resend */}
        <p className="text-[#94A3B8] text-base">
          Tidak dapat kode?{" "}
          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className={`font-bold transition-colors ${countdown > 0 ? "text-[#4C1D95]" : "text-[#E91E8C] hover:underline"}`}
          >
            Kirim ulang {countdown > 0 && `(${formatCountdown(countdown)})`}
          </button>
        </p>
      </div>
    </div>
  );
}
