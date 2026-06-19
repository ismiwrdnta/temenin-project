import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@shared/api";
import { cn } from "@/lib/utils";

function GoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
    >
      <path
        d="M21.6 11.23c0-.77-.07-1.5-.19-2.21H11v4.18h5.96a5.09 5.09 0 01-2.21 3.34v2.78h3.58C20.33 17.5 21.6 14.6 21.6 11.23z"
        fill="#4285F4"
      />
      <path
        d="M11 22c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.28-1.93-6.14-4.52H1.17v2.86A11 11 0 0011 22z"
        fill="#34A853"
      />
      <path
        d="M4.86 13.1A6.6 6.6 0 014.52 11c0-.73.13-1.44.34-2.1V6.04H1.17A11 11 0 000 11c0 1.77.43 3.45 1.17 4.96l3.69-2.86z"
        fill="#FBBC05"
      />
      <path
        d="M11 4.38c1.62 0 3.06.56 4.2 1.65l3.16-3.16A10.98 10.98 0 0011 0 11 11 0 001.17 6.04l3.69 2.86C5.72 6.31 8.14 4.38 11 4.38z"
        fill="#EA4335"
      />
    </svg>
  );
}

type GoogleAuthButtonProps = {
  label: string;
  role?: UserRole;
  className?: string;
  iconSize?: number;
};

function getRedirectPath(role: UserRole, isRegister: boolean) {
  if (role === "penyedia") {
    return isRegister ? "/daftar-provider" : "/dashboard-penyedia";
  }
  return "/dashboard";
}

function GoogleAuthButtonDisabled({
  label,
  className,
  iconSize = 22,
}: GoogleAuthButtonProps) {
  return (
    <div className="w-full">
      <button
        type="button"
        disabled
        title="Tambahkan VITE_GOOGLE_CLIENT_ID di .env"
        className={cn(
          "w-full py-4 rounded-xl border border-[#E5D5C5] bg-[#F5F5F5] flex items-center justify-center gap-3 font-semibold text-[#94A3B8] text-base cursor-not-allowed",
          className,
        )}
      >
        <GoogleIcon size={iconSize} />
        {label} (belum dikonfigurasi)
      </button>
      <p className="text-[#94A3B8] text-xs mt-2 text-center">
        Set <code className="text-[#4C1D95]">VITE_GOOGLE_CLIENT_ID</code> di
        file .env untuk mengaktifkan Google Sign-In.
      </p>
    </div>
  );
}

function GoogleAuthButtonActive({
  label,
  role = "pengguna",
  className,
  iconSize = 22,
}: GoogleAuthButtonProps) {
  const navigate = useNavigate();
  const { loginLocal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister =
    label.toLowerCase().includes("daftar") || label.includes("Lanjut");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );
        if (!profileRes.ok) {
          throw new Error("Gagal mengambil profil Google.");
        }
        const profile = (await profileRes.json()) as {
          email?: string;
          name?: string;
          picture?: string;
        };
        if (!profile.email) {
          throw new Error("Email Google tidak tersedia.");
        }
        loginLocal({
          name: profile.name ?? profile.email.split("@")[0],
          email: profile.email,
          picture: profile.picture,
          role,
          rememberAccount: true,
        });
        navigate(getRedirectPath(role, isRegister));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal masuk dengan Google.",
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Login Google dibatalkan atau gagal.");
    },
  });

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={loading}
        onClick={() => googleLogin()}
        className={cn(
          "w-full py-4 rounded-xl border border-[#E91E8C] bg-[#F5EBE0] flex items-center justify-center gap-3 font-bold text-[#E91E8C] text-base hover:bg-[#fce7f3] transition-colors disabled:opacity-60 disabled:cursor-wait",
          className,
        )}
      >
        <GoogleIcon size={iconSize} />
        {loading ? "Memproses..." : label}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function GoogleAuthButton(props: GoogleAuthButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <GoogleAuthButtonDisabled {...props} />;
  }

  return <GoogleAuthButtonActive {...props} />;
}
