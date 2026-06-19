export type AmbilRaporDeliveryMethod = "foto" | "antar";

export type AmbilRaporRequest = {
  schoolName: string;
  studentInfo: string;
  reportDate: string;
  schoolAddress: string;
  deliveryMethod: AmbilRaporDeliveryMethod;
  notes: string;
  totalPrice: number;
  powerOfAttorneyFileName?: string;
};

export type AmbilRaporCheckout = {
  service: "ambil-rapor";
  request: AmbilRaporRequest;
  helperId: number;
};

export function formatAmbilRaporSchedule(request: AmbilRaporRequest): string {
  const school = request.schoolName.trim() || "Sekolah";
  const location = request.schoolAddress.trim() || "Jakarta";

  let dateLabel = "Hari ini";
  if (request.reportDate) {
    const selected = new Date(`${request.reportDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected.getTime() !== today.getTime()) {
      dateLabel = selected.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  }

  return `Jadwal: ${dateLabel}, 08:00 - 12:00 • ${school}, ${location}`;
}

export function isAmbilRaporRequestComplete(
  request: Partial<AmbilRaporRequest>,
): request is AmbilRaporRequest {
  return Boolean(
    request.schoolName?.trim() &&
      request.studentInfo?.trim() &&
      request.reportDate?.trim() &&
      request.schoolAddress?.trim() &&
      request.deliveryMethod &&
      typeof request.totalPrice === "number" &&
      request.powerOfAttorneyFileName?.trim(),
  );
}
