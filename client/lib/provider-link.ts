import { PROVIDERS } from "@/data/providers";
import { TEMENIN_COMPANIONS } from "@/data/temenin-companions";

export function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveCompanionId(name: string): number | undefined {
  const normalized = normalizeName(name);
  if (!normalized) return undefined;

  const companion = TEMENIN_COMPANIONS.find(
    (item) =>
      normalizeName(item.name) === normalized && item.status !== "pending",
  );
  if (companion) return companion.id;

  const provider = PROVIDERS.find(
    (item) => normalizeName(item.name) === normalized,
  );
  if (!provider) return undefined;

  const linkedCompanion = TEMENIN_COMPANIONS.find(
    (item) =>
      normalizeName(item.name) === normalizeName(provider.name) &&
      item.status !== "pending",
  );
  return linkedCompanion?.id;
}

export function getCompanionName(companionId: number): string | undefined {
  return TEMENIN_COMPANIONS.find((item) => item.id === companionId)?.name;
}
