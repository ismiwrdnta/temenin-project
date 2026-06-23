export async function deliverOtpEmail(email: string, code: string): Promise<void> {
  // Belum ada SMTP — log ke console supaya bisa ditest saat development.
  console.log(`[OTP] Kode verifikasi untuk ${email}: ${code} (berlaku 10 menit)`);
}

export function isDevOtpEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}
