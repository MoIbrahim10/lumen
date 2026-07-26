import { useSyncExternalStore } from "react";
import type { AccountProfile, WorkspaceAccount, WorkspacePlan } from "./types";

type AccountState = {
  accounts: WorkspaceAccount[];
  activeAccountId: string;
  profiles: Record<string, AccountProfile>;
};

const DEFAULT_ACCOUNT: WorkspaceAccount = {
  id: "emma",
  name: "Emma",
  email: "emma@lumen.app",
  plan: "Pro",
};

const DEFAULT_PROFILE: AccountProfile = {
  name: "Emma",
  email: "emma@lumen.app",
  role: "Product designer",
  bio: "Designing calm, useful AI experiences.",
};

const DEFAULT_STATE: AccountState = {
  accounts: [DEFAULT_ACCOUNT],
  activeAccountId: DEFAULT_ACCOUNT.id,
  profiles: { [DEFAULT_ACCOUNT.id]: DEFAULT_PROFILE },
};

const ACCOUNT_KEY = "lumen:accounts:v1";

const loadState = (): AccountState => {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return DEFAULT_STATE;
    const stored = JSON.parse(raw) as Partial<AccountState>;
    const accounts = stored.accounts?.length ? stored.accounts : DEFAULT_STATE.accounts;
    const activeAccountId = accounts.some((account) => account.id === stored.activeAccountId)
      ? stored.activeAccountId!
      : accounts[0].id;
    return {
      accounts,
      activeAccountId,
      profiles: { ...DEFAULT_STATE.profiles, ...stored.profiles },
    };
  } catch {
    return DEFAULT_STATE;
  }
};

export const accountStore = (() => {
  let state = DEFAULT_STATE;
  let hydrated = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const persist = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(state));
    } catch {
      // Local persistence is best-effort in restricted browser contexts.
    }
  };
  const update = (next: AccountState) => {
    state = next;
    persist();
    emit();
  };

  return {
    get: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hydrate: () => {
      if (hydrated) return;
      hydrated = true;
      state = loadState();
      emit();
    },
    switchAccount: (accountId: string) => {
      if (!state.accounts.some((account) => account.id === accountId)) return;
      update({ ...state, activeAccountId: accountId });
    },
    addAccount: (account: WorkspaceAccount, profile?: AccountProfile) => {
      const existing = state.accounts.find(
        (candidate) => candidate.email.toLowerCase() === account.email.toLowerCase(),
      );
      if (existing) {
        update({ ...state, activeAccountId: existing.id });
        return existing;
      }
      update({
        accounts: [...state.accounts, account],
        activeAccountId: account.id,
        profiles: {
          ...state.profiles,
          [account.id]: profile ?? {
            name: account.name,
            email: account.email,
            role: "",
            bio: "",
          },
        },
      });
      return account;
    },
    removeAccount: (accountId: string) => {
      if (state.accounts.length === 1) return;
      const accounts = state.accounts.filter((account) => account.id !== accountId);
      const profiles = { ...state.profiles };
      delete profiles[accountId];
      update({
        accounts,
        profiles,
        activeAccountId:
          state.activeAccountId === accountId ? accounts[0].id : state.activeAccountId,
      });
    },
    saveProfile: (profile: AccountProfile) => {
      const accountId = state.activeAccountId;
      update({
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === accountId
            ? { ...account, name: profile.name, email: profile.email }
            : account,
        ),
        profiles: { ...state.profiles, [accountId]: profile },
      });
    },
    setPlan: (plan: WorkspacePlan) => {
      update({
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === state.activeAccountId ? { ...account, plan } : account,
        ),
      });
    },
  };
})();

export function useAccountState() {
  return useSyncExternalStore(accountStore.subscribe, accountStore.get, () => DEFAULT_STATE);
}
