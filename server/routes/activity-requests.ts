import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import { findUserById } from "../repositories/users";
import { findProviderByUserId } from "../repositories/providers";
import {
  claimActivityRequest,
  createActivityRequest,
  findActivityRequestById,
  findOpenActivityRequests,
  findUserActivityRequests,
  markActivityRequestPaid,
  type ActivityRequestType,
} from "../repositories/activity-requests";

const createSchema = z.object({
  request_type: z.enum(["belanja_titip", "antri_mewakili", "ambil_rapor"]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().max(500).optional(),
  payload: z.record(z.unknown()),
  total_price: z.number().min(0),
});

export const handleCreateActivityRequest: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data permintaan tidak valid." });
    return;
  }

  try {
    const request = await createActivityRequest({
      userId,
      requestType: parsed.data.request_type as ActivityRequestType,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address: parsed.data.address,
      payload: parsed.data.payload,
      totalPrice: parsed.data.total_price,
    });
    res.status(201).json({ data: request });
  } catch (error) {
    console.error("Create activity request error:", error);
    res.status(500).json({ error: "Gagal membuat permintaan." });
  }
};

export const handleListOpenActivityRequests: RequestHandler = async (
  req,
  res,
) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user || user.role !== "penyedia") {
      res.status(403).json({ error: "Hanya penyedia jasa yang bisa melihat permintaan." });
      return;
    }

    const provider = await findProviderByUserId(userId);
    if (!provider) {
      res.json({ data: [] });
      return;
    }

    const hasBantu = provider.categories?.includes("bantu_aktivitas");
    if (!hasBantu) {
      res.json({ data: [] });
      return;
    }

    const requests = await findOpenActivityRequests();
    res.json({ data: requests });
  } catch (error) {
    console.error("List open activity requests error:", error);
    res.status(500).json({ error: "Gagal mengambil permintaan." });
  }
};

export const handleListMyActivityRequests: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  try {
    const requests = await findUserActivityRequests(userId);
    res.json({ data: requests });
  } catch (error) {
    console.error("List my activity requests error:", error);
    res.status(500).json({ error: "Gagal mengambil permintaan." });
  }
};

export const handleGetActivityRequest: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
  if (!id) {
    res.status(400).json({ error: "ID permintaan tidak valid." });
    return;
  }

  try {
    const request = await findActivityRequestById(id);
    if (!request) {
      res.status(404).json({ error: "Permintaan tidak ditemukan." });
      return;
    }

    const user = await findUserById(userId);
    const provider = user?.role === "penyedia"
      ? await findProviderByUserId(userId)
      : null;

    const isOwner = request.user_id === userId;
    const isOpenForProvider =
      user?.role === "penyedia" &&
      request.status === "open" &&
      request.payment_status === "paid";
    const isAssignedProvider =
      provider && request.claimed_by_provider_id === provider.id;

    if (!isOwner && !isOpenForProvider && !isAssignedProvider) {
      res.status(403).json({ error: "Akses ditolak." });
      return;
    }

    res.json({ data: request });
  } catch (error) {
    console.error("Get activity request error:", error);
    res.status(500).json({ error: "Gagal mengambil permintaan." });
  }
};

export const handlePayActivityRequest: RequestHandler = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Simulasi pembayaran tidak tersedia di production." });
    return;
  }

  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
  if (!id) {
    res.status(400).json({ error: "ID permintaan tidak valid." });
    return;
  }

  try {
    const updated = await markActivityRequestPaid(id, userId);
    if (!updated) {
      res.status(400).json({ error: "Permintaan tidak bisa dibayar." });
      return;
    }
    res.json({
      data: updated,
      message: "Pembayaran simulasi berhasil. Permintaan dikirim ke semua helper.",
    });
  } catch (error) {
    console.error("Pay activity request error:", error);
    res.status(500).json({ error: "Gagal memproses pembayaran." });
  }
};

export const handleAcceptActivityRequest: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
  if (!id) {
    res.status(400).json({ error: "ID permintaan tidak valid." });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user || user.role !== "penyedia") {
      res.status(403).json({ error: "Hanya penyedia jasa yang bisa menerima permintaan." });
      return;
    }

    const provider = await findProviderByUserId(userId);
    if (!provider) {
      res.status(404).json({ error: "Profil provider tidak ditemukan." });
      return;
    }

    const hasBantu = provider.categories?.includes("bantu_aktivitas");
    if (!hasBantu) {
      res.status(403).json({ error: "Provider belum mendaftar jasa bantu aktivitas." });
      return;
    }

    const result = await claimActivityRequest(id, provider.id);
    res.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_NOT_AVAILABLE") {
      res.status(409).json({ error: "Permintaan sudah diambil provider lain." });
      return;
    }
    if (error instanceof Error && error.message === "PROVIDER_SUSPENDED") {
      res.status(403).json({ error: "Akun kamu sedang diskorsing dan tidak bisa menerima permintaan." });
      return;
    }
    console.error("Accept activity request error:", error);
    res.status(500).json({ error: "Gagal menerima permintaan." });
  }
};
