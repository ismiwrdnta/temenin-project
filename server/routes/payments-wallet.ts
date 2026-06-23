import type { RequestHandler } from "express";
import { z } from "zod";
import { isDatabaseConfigured } from "../db/pool";
import {
  findWalletByUserId,
  findWalletTransactions,
  findWithdrawalRequests,
  debitWallet,
  createWithdrawalRequest,
} from "../repositories/payments";

export const handleGetMyWallet: RequestHandler = async (req, res) => {
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
    const wallet = await findWalletByUserId(userId);
    if (!wallet) {
      res.status(404).json({ error: "Wallet tidak ditemukan." });
      return;
    }

    res.json({ data: wallet });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ error: "Gagal mengambil data wallet." });
  }
};

export const handleGetWalletTransactions: RequestHandler = async (req, res) => {
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
    const wallet = await findWalletByUserId(userId);
    if (!wallet) {
      res.status(404).json({ error: "Wallet tidak ditemukan." });
      return;
    }

    const [transactions, withdrawals] = await Promise.all([
      findWalletTransactions(wallet.id),
      findWithdrawalRequests(wallet.id),
    ]);

    res.json({ data: { wallet, transactions, withdrawals } });
  } catch (error) {
    console.error("Get wallet transactions error:", error);
    res.status(500).json({ error: "Gagal mengambil riwayat transaksi." });
  }
};

const withdrawSchema = z.object({
  amount: z.number().positive(),
  bank_name: z.string().min(1),
  account_number: z.string().min(1),
  account_name: z.string().min(1),
});

export const handleRequestWithdrawal: RequestHandler = async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Database belum dikonfigurasi." });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Tidak terautentikasi." });
    return;
  }

  const parsed = withdrawSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data penarikan tidak valid." });
    return;
  }

  try {
    const wallet = await findWalletByUserId(userId);
    if (!wallet) {
      res.status(404).json({ error: "Wallet tidak ditemukan." });
      return;
    }

    const { amount, bank_name, account_number, account_name } = parsed.data;
    if (parseFloat(wallet.balance) < amount) {
      res.status(400).json({ error: "Saldo tidak mencukupi." });
      return;
    }

    await debitWallet(wallet.id, amount, "Request penarikan dana");
    const withdrawal = await createWithdrawalRequest({
      walletId: wallet.id,
      amount,
      bankName: bank_name,
      accountNumber: account_number,
      accountName: account_name,
    });

    res.status(201).json({
      data: withdrawal,
      message: "Request penarikan diterima. Dana akan dikirim dalam 1x24 jam kerja.",
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({ error: "Gagal memproses penarikan dana." });
  }
};

