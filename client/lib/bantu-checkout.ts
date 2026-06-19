import type { AmbilRaporCheckout } from "@/lib/ambil-rapor-request";
import type { AntriMewakiliCheckout } from "@/lib/antri-mewakili-request";

export type BantuCheckout = AmbilRaporCheckout | AntriMewakiliCheckout;

export function isAmbilRaporCheckout(
  checkout: BantuCheckout,
): checkout is AmbilRaporCheckout {
  return checkout.service === "ambil-rapor";
}

export function isAntriMewakiliCheckout(
  checkout: BantuCheckout,
): checkout is AntriMewakiliCheckout {
  return checkout.service === "antri-mewakili";
}
