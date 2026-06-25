import "dotenv/config";
import { getPool } from "./pool";
import { hashPassword } from "../lib/password";
import { createUser, findUserByEmail } from "../repositories/users";
import {
  findProviderByUserId,
  setProviderCategories,
} from "../repositories/providers";
import type { ServiceCategory } from "../types/booking-types";

const PROVIDERS_TO_SEED = [
  {
    name: "Rafi Ananda",
    email: "rafi@mail.com",
    phone: "081234567891",
    rate: 70000,
    categories: ["temenin", "curhat"] as ServiceCategory[],
    rating: 4.88,
    reviews: 83,
    lat: -6.9082,
    lng: 107.6154,
  },
  {
    name: "Risna",
    email: "risna@mail.com",
    phone: "081234567892",
    rate: 70000,
    categories: ["curhat", "bantu_aktivitas"] as ServiceCategory[],
    rating: 4.88,
    reviews: 61,
    lat: -6.9118,
    lng: 107.6172,
  },
  {
    name: "Bimo Pratama",
    email: "bimo@mail.com",
    phone: "081234567893",
    rate: 65000,
    categories: ["temenin", "bantu_aktivitas"] as ServiceCategory[],
    rating: 4.75,
    reviews: 45,
    lat: -6.9235,
    lng: 107.6021,
  },
  {
    name: "Ismi Wardanita",
    email: "ismi@mail.com",
    phone: "081234567894",
    rate: 70000,
    categories: ["curhat", "bantu_aktivitas"] as ServiceCategory[],
    rating: 4.88,
    reviews: 61,
    lat: -6.9105,
    lng: 107.6148,
  },
  {
    name: "Ima",
    email: "ima_provider@mail.com",
    phone: "081234567895",
    rate: 65000,
    categories: ["temenin", "bantu_aktivitas"] as ServiceCategory[],
    rating: 4.75,
    reviews: 45,
    lat: -6.9268,
    lng: 107.6115,
  },
];

async function seed() {
  const pool = getPool();
  console.log("Mulai seeding penyedia jasa...");

  try {
    const pwHash = await hashPassword("password123");

    const adminEmail = "admin@temenin.id";
    const existingAdmin = await findUserByEmail(adminEmail);
    if (!existingAdmin) {
      console.log(`Membuat user admin: Admin 1 (${adminEmail})`);
      await createUser({
        email: adminEmail,
        fullName: "Admin 1",
        role: "admin",
        passwordHash: pwHash,
        emailVerified: true,
      });
    }

    // Akun test pengguna untuk user testing
    const testUserEmail = "test@temenin.id";
    const existingTestUser = await findUserByEmail(testUserEmail);
    if (!existingTestUser) {
      console.log(`Membuat akun test pengguna: ${testUserEmail}`);
      await createUser({
        email: testUserEmail,
        fullName: "User Test",
        phone: "08999888777",
        role: "pengguna",
        passwordHash: pwHash,
        emailVerified: true,
      });
    }

    for (const p of PROVIDERS_TO_SEED) {
      let user = await findUserByEmail(p.email);
      if (!user) {
        console.log(`Membuat user penyedia: ${p.name} (${p.email})`);
        user = await createUser({
          email: p.email,
          fullName: p.name,
          phone: p.phone,
          role: "penyedia",
          passwordHash: pwHash,
          emailVerified: true,
        }) as any;
      }

      const userId = user!.id;
      let provider = await findProviderByUserId(userId);
      if (!provider) {
        console.log(`Membuat profil penyedia untuk: ${p.name}`);
        // Database trigger trg_create_provider_wallet otomatis membuat wallet
        const res = await pool.query(
          `INSERT INTO provider_profiles (user_id, hourly_rate, verification_status, is_available, latitude, longitude, area_description, avg_rating, total_reviews)
           VALUES ($1, $2, 'verified', true, $3, $4, 'Bandung, Jawa Barat', $5, $6)
           RETURNING *`,
          [userId, p.rate, p.lat, p.lng, p.rating, p.reviews]
        );
        provider = res.rows[0];
      } else {
        // Update detail rating, lokasi, harga, dan set available
        await pool.query(
          `UPDATE provider_profiles
           SET hourly_rate = $1, verification_status = 'verified', is_available = true, latitude = $2, longitude = $3, area_description = 'Bandung, Jawa Barat', avg_rating = $4, total_reviews = $5
           WHERE user_id = $6`,
          [p.rate, p.lat, p.lng, p.rating, p.reviews, userId]
        );
      }

      await setProviderCategories(provider!.id, p.categories);
      console.log(`Penyedia ${p.name} berhasil di-seed dengan kategori: ${p.categories.join(", ")}`);
    }

    console.log("Seeding penyedia jasa selesai sukses!");
  } catch (error) {
    console.error("Gagal melakukan seeding:", error);
  } finally {
    await pool.end();
  }
}

seed();
