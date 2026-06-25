import { getPool } from "../db/pool";

export interface PaymentRow {
  id: string;
  booking_id: string;
  midtrans_order_id: string;
  midtrans_transaction_id: string | null;
  payment_method: string | null;
  amount: string;
  status: "pending" | "paid" | "failed" | "expired" | "refunded";
  paid_at: string | null;
  expired_at: string | null;
  created_at: string;
}

export interface WalletRow {
  id: string;
  provider_id: string;
  balance: string;
  total_earned: string;
  total_withdrawn: string;
  updated_at: string;
}

export async function createPayment(input: {
  bookingId: string;
  midtransOrderId: string;
  amount: number;
}): Promise<PaymentRow> {
  const pool = getPool();
  const result = await pool.query<PaymentRow>(
    `INSERT INTO payments (booking_id, midtrans_order_id, amount, expired_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')
     RETURNING *`,
    [input.bookingId, input.midtransOrderId, input.amount],
  );
  return result.rows[0];
}

export async function findPaymentByOrderId(
  orderId: string,
): Promise<PaymentRow | null> {
  const pool = getPool();
  const result = await pool.query<PaymentRow>(
    `SELECT * FROM payments WHERE midtrans_order_id = $1`,
    [orderId],
  );
  return result.rows[0] ?? null;
}

export async function findPaymentByBookingId(
  bookingId: string,
): Promise<PaymentRow | null> {
  const pool = getPool();
  const result = await pool.query<PaymentRow>(
    `SELECT * FROM payments WHERE booking_id = $1`,
    [bookingId],
  );
  return result.rows[0] ?? null;
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentRow["status"],
  meta: { transactionId?: string; paymentMethod?: string } = {},
): Promise<PaymentRow | null> {
  const pool = getPool();
  const result = await pool.query<PaymentRow>(
    `UPDATE payments SET
       status = $1::varchar,
       midtrans_transaction_id = COALESCE($2, midtrans_transaction_id),
       payment_method = COALESCE($3, payment_method),
       paid_at = CASE WHEN $1::varchar = 'paid' THEN NOW() ELSE paid_at END
     WHERE id = $4
     RETURNING *`,
    [status, meta.transactionId ?? null, meta.paymentMethod ?? null, id],
  );
  return result.rows[0] ?? null;
}

export async function createEscrow(input: {
  bookingId: string;
  paymentId: string;
  amount: number;
}): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO escrow_transactions (booking_id, payment_id, amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (booking_id) DO NOTHING`,
    [input.bookingId, input.paymentId, input.amount],
  );
}

export async function releaseEscrow(
  bookingId: string,
  trigger: "user_confirm" | "auto_24h",
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE escrow_transactions
     SET status = 'released', release_trigger = $1, released_at = NOW()
     WHERE booking_id = $2`,
    [trigger, bookingId],
  );
}

export async function refundEscrow(
  bookingId: string,
  type: "refunded_full" | "refunded_partial",
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE escrow_transactions SET status = $1 WHERE booking_id = $2`,
    [type, bookingId],
  );
}

export async function findWalletByProviderId(
  providerId: string,
): Promise<WalletRow | null> {
  const pool = getPool();
  const result = await pool.query<WalletRow>(
    `SELECT * FROM provider_wallets WHERE provider_id = $1`,
    [providerId],
  );
  return result.rows[0] ?? null;
}

export async function findWalletByUserId(
  userId: string,
): Promise<WalletRow | null> {
  const pool = getPool();
  const result = await pool.query<WalletRow>(
    `SELECT pw.* FROM provider_wallets pw
     JOIN provider_profiles pp ON pp.id = pw.provider_id
     WHERE pp.user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function creditWallet(
  walletId: string,
  amount: number,
  bookingId: string,
  commissionAmount: number,
  description: string,
): Promise<void> {
  const pool = getPool();
  const netAmount = amount - commissionAmount;

  await pool.query(
    `UPDATE provider_wallets
     SET balance = balance + $1, total_earned = total_earned + $1, updated_at = NOW()
     WHERE id = $2`,
    [netAmount, walletId],
  );

  await pool.query(
    `INSERT INTO wallet_transactions
       (wallet_id, booking_id, type, amount, commission_amount, net_amount, description)
     VALUES ($1, $2, 'credit', $3, $4, $5, $6)`,
    [walletId, bookingId, amount, commissionAmount, netAmount, description],
  );
}

export async function debitWallet(
  walletId: string,
  amount: number,
  description: string,
): Promise<void> {
  const pool = getPool();

  await pool.query(
    `UPDATE provider_wallets
     SET balance = balance - $1, total_withdrawn = total_withdrawn + $1, updated_at = NOW()
     WHERE id = $2`,
    [amount, walletId],
  );

  await pool.query(
    `INSERT INTO wallet_transactions (wallet_id, type, amount, net_amount, description)
     VALUES ($1, 'debit', $2, $2, $3)`,
    [walletId, amount, description],
  );
}

export async function createWithdrawalRequest(input: {
  walletId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}): Promise<{ id: string }> {
  const pool = getPool();
  const result = await pool.query<{ id: string }>(
    `INSERT INTO withdrawal_requests
       (wallet_id, amount, bank_name, account_number, account_name, status, processed_at)
     VALUES ($1, $2, $3, $4, $5, 'processed', NOW())
     RETURNING id`,
    [
      input.walletId,
      input.amount,
      input.bankName,
      input.accountNumber,
      input.accountName,
    ],
  );
  return result.rows[0];
}

export interface WalletTransactionRow {
  id: string;
  wallet_id: string;
  booking_id: string | null;
  type: "credit" | "debit";
  amount: string;
  commission_amount: string | null;
  net_amount: string;
  description: string | null;
  created_at: string;
}

export async function findWalletTransactions(
  walletId: string,
  limit = 50,
): Promise<WalletTransactionRow[]> {
  const pool = getPool();
  const result = await pool.query<WalletTransactionRow>(
    `SELECT * FROM wallet_transactions
     WHERE wallet_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [walletId, limit],
  );
  return result.rows;
}

export interface WithdrawalRequestRow {
  id: string;
  wallet_id: string;
  amount: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
}

export async function findWithdrawalRequests(
  walletId: string,
  limit = 20,
): Promise<WithdrawalRequestRow[]> {
  const pool = getPool();
  const result = await pool.query<WithdrawalRequestRow>(
    `SELECT * FROM withdrawal_requests
     WHERE wallet_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [walletId, limit],
  );
  return result.rows;
}

