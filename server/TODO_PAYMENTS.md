# TODO — Modul Payments (Midtrans)

Status: **PARTIAL**. Wallet & booking completion sudah jalan,
tapi pembayaran via Midtrans belum di-wiring.

## Yang sudah aktif
- [x] `GET /api/payments/wallet/me` — cek saldo provider
- [x] `POST /api/payments/withdraw` — request penarikan dana
- [x] `PATCH /api/bookings/:id/complete` — selesaikan sesi (asumsi payment sudah 'paid')

## Yang belum di-wiring (butuh akun Midtrans Sandbox)
- [ ] `POST /api/payments/create` — file ada di `routes/payments-create.ts`,
      belum di-import ke `index.ts`
- [ ] `POST /api/payments/webhook` — file ada di `routes/payments-webhook.ts`,
      belum di-import ke `index.ts`

## Langkah lanjutan saat siap
1. Daftar di https://dashboard.sandbox.midtrans.com
2. Ambil Server Key dari Settings > Access Keys
3. `npm install midtrans-client`
4. Tambah `MIDTRANS_SERVER_KEY=...` ke `.env`
5. Import & daftarkan 2 route di atas ke `server/index.ts`
   (lihat WIRING_GUIDE_PAYMENTS.md untuk detail lengkap)
6. `npm run typecheck` ulang

## Dampak sementara
Karena `payments-create` belum aktif, alur booking saat ini berhenti di:
user buat booking → provider confirm → **(tidak ada cara bayar)** → tidak akan
pernah sampai status `completed` secara natural. Untuk testing manual sementara,
bisa update status payment langsung lewat SQL:

```sql
-- HANYA untuk testing lokal, jangan dipakai di production
INSERT INTO payments (booking_id, midtrans_order_id, amount, status, paid_at)
VALUES ('<booking_id>', 'MANUAL-TEST', <jumlah>, 'paid', NOW());

INSERT INTO escrow_transactions (booking_id, payment_id, amount)
SELECT booking_id, id, amount FROM payments WHERE booking_id = '<booking_id>';
```
