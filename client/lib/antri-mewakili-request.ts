export const ANTRI_HOURLY_RATE = 45_000;
export const ANTRI_COMMISSION_RATE = 0.1;
export const ANTRI_DURATION_OPTIONS = [1, 2, 3, 4] as const;

export type AntriDurationHours = (typeof ANTRI_DURATION_OPTIONS)[number];

export type AntriMewakiliRequest = {
  location: string;
  queueDate: string;
  startTime: string;
  durationHours: AntriDurationHours;
  purpose: string;
  notes: string;
  totalPrice: number;
  basePrice: number;
  commission: number;
};

export function calculateAntriPricing(durationHours: AntriDurationHours) {
  const basePrice = ANTRI_HOURLY_RATE * durationHours;
  const commission = Math.round(basePrice * ANTRI_COMMISSION_RATE);
  return {
    basePrice,
    commission,
    totalPrice: basePrice + commission,
  };
}

export function formatAntriDateTime(date: string, time: string): string {
  if (!date) return "Belum diisi";
  const parsed = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + (time ? `, ${time}` : "");
}

export function isAntriRequestComplete(
  input: Partial<AntriMewakiliRequest>,
): input is AntriMewakiliRequest {
  return Boolean(
    input.location?.trim() &&
      input.queueDate?.trim() &&
      input.startTime?.trim() &&
      input.durationHours &&
      input.purpose?.trim() &&
      typeof input.totalPrice === "number",
  );
}

export type AntriMewakiliCheckout = {
  service: "antri-mewakili";
  request: AntriMewakiliRequest;
  helperId?: number;
  pickedLocation?: { lat: number; lng: number } | null;
};
