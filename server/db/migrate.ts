import "dotenv/config";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getPool, isDatabaseConfigured } from "./pool";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL belum di-set di file .env");
    process.exit(1);
  }

  const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  const pool = getPool();

  try {
    await pool.query(sql);
    console.log("Migrasi database berhasil.");
  } catch (error) {
    console.error("Migrasi database gagal:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
