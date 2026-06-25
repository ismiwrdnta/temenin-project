import type {
  ActivityRequestRecord,
  CreateActivityRequestBody,
} from "@shared/api";
export type { ActivityRequestRecord };
import { getStoredToken } from "./authApi";

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? "Terjadi kesalahan. Coba lagi.";
}

export async function createActivityRequest(
  input: CreateActivityRequestBody,
): Promise<ActivityRequestRecord> {
  const res = await fetch("/api/activity-requests", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: ActivityRequestRecord };
  return data.data;
}

export async function payActivityRequest(
  id: string,
): Promise<ActivityRequestRecord> {
  const res = await fetch(`/api/activity-requests/${id}/pay`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: ActivityRequestRecord };
  return data.data;
}

export async function getActivityRequest(
  id: string,
): Promise<ActivityRequestRecord> {
  const res = await fetch(`/api/activity-requests/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: ActivityRequestRecord };
  return data.data;
}

export async function listOpenActivityRequests(): Promise<
  ActivityRequestRecord[]
> {
  const res = await fetch("/api/activity-requests/open", {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { data: ActivityRequestRecord[] };
  return data.data;
}

export async function acceptActivityRequest(id: string): Promise<{
  request: ActivityRequestRecord;
  booking: { id: string };
}> {
  const res = await fetch(`/api/activity-requests/${id}/accept`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as {
    data: { request: ActivityRequestRecord; booking: { id: string } };
  };
  return data.data;
}

export function activityRequestTypeLabel(type: ActivityRequestType): string {
  const labels: Record<ActivityRequestType, string> = {
    belanja_titip: "Belanja / Titip Beli",
    antri_mewakili: "Antri Mewakili",
    ambil_rapor: "Ambil Rapor",
  };
  return labels[type];
}

export type ActivityRequestType =
  import("@shared/api").ActivityRequestType;
