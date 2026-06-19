import type { UserRole } from "@shared/api";
import { resolveCompanionId } from "@/lib/provider-link";

export type StoredAccount = {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  companionId?: number;
};

const ACCOUNTS_KEY = "temenin_accounts";

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getAccountByEmail(email: string): StoredAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return loadAccounts().find(
    (account) => account.email.trim().toLowerCase() === normalized,
  );
}

export function saveAccount(input: {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const companionId =
    input.role === "penyedia"
      ? resolveCompanionId(input.name)
      : undefined;

  const account: StoredAccount = {
    email,
    name: input.name.trim(),
    role: input.role,
    phone: input.phone,
    companionId,
  };

  const accounts = loadAccounts().filter((item) => item.email !== email);
  accounts.push(account);
  saveAccounts(accounts);
  return account;
}
