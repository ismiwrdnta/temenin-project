// Smart Matching — 4-dimension compatibility score between user prefs and a provider.
// Weights: minat 40%, gaya komunikasi 30%, tipe aktivitas 20%, usia 10%

export type CommunicationStyle = "santai" | "serius" | "empati" | "fleksibel";
export type AgeGroupPref = "muda" | "dewasa" | "senior" | "semua";

export interface UserPreferences {
  interests: string[];           // e.g. ["Olahraga", "Musik"]
  communicationStyle: CommunicationStyle | "";
  preferredActivities: string[]; // e.g. ["temenin", "curhat"]
  ageGroupPref: AgeGroupPref;
}

export interface ProviderMatchData {
  bio: string | null;
  categories: string[];  // e.g. ["temenin", "curhat"]
}

export interface MatchScore {
  total: number;       // 0–100
  minat: number;       // 0–100
  komunikasi: number;  // 0–100
  aktivitas: number;   // 0–100
  usia: number;        // 0–100
}

// --- bio parsers ---

export function parseBioInterests(bio: string | null): string[] {
  if (!bio) return [];
  const match = bio.match(/[Mm]inat\s*:\s*([^\n]+)/);
  if (!match) return [];
  return match[1].split(",").map((s) => s.trim()).filter(Boolean);
}

export function parseBioCommunicationStyle(bio: string | null): CommunicationStyle | null {
  if (!bio) return null;
  const lower = bio.toLowerCase();
  if (lower.includes("santai") || lower.includes("casual") || lower.includes("fun")) return "santai";
  if (lower.includes("serius") || lower.includes("profesional") || lower.includes("formal")) return "serius";
  if (lower.includes("empati") || lower.includes("empatik") || lower.includes("sabar") || lower.includes("mendengar")) return "empati";
  if (lower.includes("fleksibel") || lower.includes("adaptif")) return "fleksibel";
  return null;
}

// --- dimension scorers ---

function scoreMinat(userInterests: string[], providerInterests: string[]): number {
  if (userInterests.length === 0) return 50;
  if (providerInterests.length === 0) return 30;
  const lower = (s: string) => s.toLowerCase();
  const userSet = new Set(userInterests.map(lower));
  const matches = providerInterests.filter((i) => userSet.has(lower(i))).length;
  // jaccard-like: intersection / union
  const union = new Set([...userInterests.map(lower), ...providerInterests.map(lower)]).size;
  return Math.round((matches / union) * 100);
}

function scoreKomunikasi(
  userStyle: CommunicationStyle | "",
  providerStyle: CommunicationStyle | null,
): number {
  if (!userStyle) return 50;
  if (!providerStyle) return 45;
  if (userStyle === providerStyle) return 100;
  // Compatible pairs
  const compatible: Record<CommunicationStyle, CommunicationStyle[]> = {
    santai: ["fleksibel"],
    serius: ["serius"],
    empati: ["santai", "fleksibel"],
    fleksibel: ["santai", "empati", "serius"],
  };
  return compatible[userStyle]?.includes(providerStyle) ? 70 : 30;
}

function scoreAktivitas(userActivities: string[], providerCategories: string[]): number {
  if (userActivities.length === 0) return 50;
  if (providerCategories.length === 0) return 30;
  const userSet = new Set(userActivities);
  const matches = providerCategories.filter((c) => userSet.has(c)).length;
  const union = new Set([...userActivities, ...providerCategories]).size;
  return Math.round((matches / union) * 100);
}

function scoreUsia(agePref: AgeGroupPref): number {
  // No provider age data — return favorable default per preference
  if (agePref === "semua") return 80;
  return 60; // unknown data, give partial credit
}

// --- main ---

export function computeMatchScore(
  prefs: UserPreferences,
  provider: ProviderMatchData,
): MatchScore {
  const providerInterests = parseBioInterests(provider.bio);
  const providerCommStyle = parseBioCommunicationStyle(provider.bio);

  const minat = scoreMinat(prefs.interests, providerInterests);
  const komunikasi = scoreKomunikasi(prefs.communicationStyle, providerCommStyle);
  const aktivitas = scoreAktivitas(prefs.preferredActivities, provider.categories);
  const usia = scoreUsia(prefs.ageGroupPref);

  const total = Math.round(minat * 0.4 + komunikasi * 0.3 + aktivitas * 0.2 + usia * 0.1);

  return { total, minat, komunikasi, aktivitas, usia };
}

export function hasAnyPreference(prefs: UserPreferences): boolean {
  return (
    prefs.interests.length > 0 ||
    prefs.communicationStyle !== "" ||
    prefs.preferredActivities.length > 0 ||
    prefs.ageGroupPref !== "semua"
  );
}
