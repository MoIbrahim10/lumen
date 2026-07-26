import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleUserRound,
  Plus,
  ShieldCheck,
  Trash2,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AccountSurfaceStyle, WorkspaceAccount } from "./types";

type AddAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  style: AccountSurfaceStyle;
  accounts: WorkspaceAccount[];
  activeAccountId: string;
  onAdd: (account: WorkspaceAccount) => void;
  onSwitch: (accountId: string) => void;
  onRemove: (accountId: string) => void;
};

type View = "add" | "accounts";
type Draft = Pick<WorkspaceAccount, "name" | "email" | "plan">;
type DraftErrors = Partial<Record<"name" | "email", string>>;

const EMPTY_DRAFT: Draft = {
  name: "",
  email: "",
  plan: "Free",
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function makeLocalAccountId(email: string) {
  let hash = 2166136261;
  for (const character of normalizeEmail(email)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `local-${(hash >>> 0).toString(36)}`;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "—";
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`.toUpperCase();
}

function validateDraft(draft: Draft): DraftErrors {
  const errors: DraftErrors = {};
  const name = draft.name.trim();
  const email = normalizeEmail(draft.email);

  if (!name) errors.name = "Enter a display name.";
  else if (name.length < 2) errors.name = "Use at least 2 characters.";
  else if (name.length > 80) errors.name = "Keep the name under 80 characters.";

  if (!email) errors.email = "Enter an email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          id={id}
          role="alert"
          initial={{ height: 0, opacity: 0, y: -3 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
          className="mt-1 overflow-hidden text-[10px] leading-snug text-red-500"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export function AddAccountDialog({
  open,
  onOpenChange,
  style,
  accounts,
  activeAccountId,
  onAdd,
  onSwitch,
  onRemove,
}: AddAccountDialogProps) {
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState<View>("add");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const wasOpenRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const removeCancelRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const ids = {
    title: `${baseId}-title`,
    description: `${baseId}-description`,
    name: `${baseId}-name`,
    nameError: `${baseId}-name-error`,
    email: `${baseId}-email`,
    emailError: `${baseId}-email-error`,
    plan: `${baseId}-plan`,
  };

  const duplicate = useMemo(
    () => accounts.find((account) => account.id === duplicateId) ?? null,
    [accounts, duplicateId],
  );
  const confirmRemoveAccount = useMemo(
    () => accounts.find((account) => account.id === confirmRemoveId) ?? null,
    [accounts, confirmRemoveId],
  );

  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened) return;
    setView("add");
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setDuplicateId(null);
    setConfirmRemoveId(null);
    setNotice("");
  }, [open]);

  useEffect(() => {
    if (!confirmRemoveAccount) setConfirmRemoveId(null);
  }, [confirmRemoveAccount]);

  useEffect(() => {
    if (confirmRemoveId) removeCancelRef.current?.focus();
  }, [confirmRemoveId]);

  const showView = (next: View) => {
    setView(next);
    setErrors({});
    setDuplicateId(null);
    setConfirmRemoveId(null);
    setNotice("");
  };

  const updateDraft = <Key extends keyof Draft>(field: Key, value: Draft[Key]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field as keyof DraftErrors];
      return next;
    });
    if (field === "email") setDuplicateId(null);
    setNotice("");
  };

  const handleAdd = () => {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);

    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }

    const email = normalizeEmail(draft.email);
    const existing = accounts.find((account) => normalizeEmail(account.email) === email);
    if (existing) {
      setDuplicateId(existing.id);
      setErrors({ email: "This email is already on this device." });
      emailRef.current?.focus();
      return;
    }

    const account: WorkspaceAccount = {
      id: makeLocalAccountId(email),
      name: draft.name.trim(),
      email,
      plan: draft.plan,
    };
    onAdd(account);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setDuplicateId(null);
    setNotice(`${account.name} was added to this local prototype.`);
    setView("accounts");
  };

  const switchAccount = (account: WorkspaceAccount) => {
    if (account.id === activeAccountId) return;
    onSwitch(account.id);
    setNotice(`Switched to ${account.name} on this device.`);
    setConfirmRemoveId(null);
  };

  const removeAccount = (account: WorkspaceAccount) => {
    if (accounts.length <= 1) {
      setNotice("At least one local account must remain.");
      setConfirmRemoveId(null);
      return;
    }

    if (account.id === activeAccountId) {
      const fallback = accounts.find((candidate) => candidate.id !== account.id);
      if (fallback) onSwitch(fallback.id);
    }
    onRemove(account.id);
    setConfirmRemoveId(null);
    setNotice(`${account.name} was removed from this device.`);
  };

  const inputClass =
    "mt-1.5 h-10 w-full rounded-md border border-foreground/15 bg-background/45 px-3 text-[12px] text-foreground outline-none transition-[border-color,box-shadow,background-color] placeholder:text-foreground/30 hover:border-foreground/25 focus:border-[color:var(--lumen-accent)] focus:bg-background/70 focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--lumen-accent)_18%,transparent)]";
  const labelClass = "block font-mono text-[9px] uppercase tracking-[0.17em] text-foreground/55";
  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <MotionConfig reducedMotion="user">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          aria-labelledby={ids.title}
          aria-describedby={ids.description}
          className={`${style.panelClass} w-[calc(100vw-1.5rem)] max-w-[700px] gap-0 overflow-hidden border-0 p-1 text-foreground shadow-2xl sm:max-w-[700px] sm:rounded-xl`}
        >
          <div
            className={`${style.panelInnerClass} flex max-h-[min(88dvh,720px)] min-h-0 flex-col overflow-hidden`}
          >
            <header className="shrink-0 border-b border-foreground/10 px-4 py-4 pr-12 sm:px-5">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                >
                  <UsersRound className="h-4.5 w-4.5 text-[var(--lumen-accent)]" />
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/45">
                    Local prototype · no sign-in
                  </div>
                  <DialogTitle
                    id={ids.title}
                    className="mt-1 text-[18px] font-medium leading-tight tracking-tight"
                  >
                    Accounts on this device
                  </DialogTitle>
                  <DialogDescription
                    id={ids.description}
                    className="mt-1 max-w-lg text-[11px] leading-relaxed text-foreground/50"
                  >
                    Create and switch between local workspace identities. Lumen never asks for a
                    password or connects to an identity provider here.
                  </DialogDescription>
                </div>
              </div>

              <div className="mt-4 flex gap-1 rounded-lg border border-foreground/10 bg-foreground/[0.025] p-1">
                {(
                  [
                    { id: "add" as const, label: "Add account", icon: UserRoundPlus },
                    {
                      id: "accounts" as const,
                      label: `Manage accounts · ${accounts.length}`,
                      icon: UsersRound,
                    },
                  ] satisfies { id: View; label: string; icon: typeof UsersRound }[]
                ).map((item) => {
                  const active = item.id === view;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => showView(item.id)}
                      className={`relative flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-accent)] ${
                        active
                          ? "text-foreground"
                          : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
                      }`}
                    >
                      {active ? (
                        <motion.span
                          layoutId={`${baseId}-account-tab`}
                          className="accent-soft absolute inset-0 rounded-md border"
                          transition={motionTransition}
                        />
                      ) : null}
                      <Icon className="relative h-3.5 w-3.5 shrink-0" />
                      <span className="relative truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <AnimatePresence initial={false} mode="wait">
                {view === "add" ? (
                  <motion.section
                    key="add"
                    aria-label="Add a local account"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                    transition={motionTransition}
                    className="p-4 sm:p-5"
                  >
                    <div className="accent-soft flex items-start gap-2.5 rounded-lg border p-3">
                      <ShieldCheck
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lumen-accent)]"
                      />
                      <div>
                        <p className="text-[11px] font-medium">A workspace identity, not a login</p>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-foreground/55">
                          Details remain in this browser for the prototype. No credentials, email
                          verification, or OAuth flow is performed.
                        </p>
                      </div>
                    </div>

                    <form
                      noValidate
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleAdd();
                      }}
                      className="mt-4 space-y-3.5"
                    >
                      <div className="grid gap-3.5 sm:grid-cols-2">
                        <label className={labelClass} htmlFor={ids.name}>
                          Display name
                          <input
                            ref={nameRef}
                            id={ids.name}
                            value={draft.name}
                            onChange={(event) => updateDraft("name", event.target.value)}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? ids.nameError : undefined}
                            autoComplete="off"
                            placeholder="e.g. Emma Ibrahim"
                            className={inputClass}
                          />
                          <FieldError id={ids.nameError} message={errors.name} />
                        </label>

                        <label className={labelClass} htmlFor={ids.email}>
                          Email label
                          <input
                            ref={emailRef}
                            id={ids.email}
                            type="email"
                            inputMode="email"
                            value={draft.email}
                            onChange={(event) => updateDraft("email", event.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? ids.emailError : undefined}
                            autoComplete="off"
                            placeholder="name@example.com"
                            className={inputClass}
                          />
                          <FieldError id={ids.emailError} message={errors.email} />
                        </label>
                      </div>

                      <label className={labelClass} htmlFor={ids.plan}>
                        Plan label <span className="normal-case tracking-normal">(optional)</span>
                        <select
                          id={ids.plan}
                          value={draft.plan}
                          onChange={(event) =>
                            updateDraft("plan", event.target.value as WorkspaceAccount["plan"])
                          }
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="Free">Free</option>
                          <option value="Plus">Plus</option>
                          <option value="Pro">Pro</option>
                        </select>
                      </label>

                      <AnimatePresence initial={false}>
                        {duplicate ? (
                          <motion.div
                            role="alert"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 p-3">
                              <p className="text-[11px] font-medium">Already on this device</p>
                              <p className="mt-0.5 text-[10px] leading-relaxed text-foreground/55">
                                {duplicate.email} belongs to {duplicate.name}. Nothing was added.
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    switchAccount(duplicate);
                                    showView("accounts");
                                  }}
                                  className={`${style.buttonClass} h-8 px-3 text-[9px]`}
                                >
                                  Switch to {duplicate.name}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => showView("accounts")}
                                  className="rounded-md px-2.5 py-1.5 text-[9px] text-foreground/60 transition hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-accent)]"
                                >
                                  Review accounts
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>

                      <div className="flex flex-col-reverse gap-2 border-t border-foreground/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[9px] leading-relaxed text-foreground/40">
                          Free is used when no plan label is selected.
                        </p>
                        <button
                          type="submit"
                          className={`${style.buttonClass} accent-soft flex h-9 items-center justify-center gap-2 px-4 text-[10px]`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add local account
                        </button>
                      </div>
                    </form>
                  </motion.section>
                ) : (
                  <motion.section
                    key="accounts"
                    aria-label="Manage local accounts"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                    transition={motionTransition}
                    className="p-4 sm:p-5"
                  >
                    <div className="mb-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/50">
                          Device identities
                        </p>
                        <p className="mt-1 text-[10px] leading-relaxed text-foreground/45">
                          Switching only changes the active local workspace.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => showView("add")}
                        className={`${style.buttonClass} flex h-8 shrink-0 items-center gap-1.5 px-3 text-[9px]`}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </div>

                    <div className="space-y-2">
                      {accounts.map((account) => {
                        const active = account.id === activeAccountId;
                        const confirming = account.id === confirmRemoveId;
                        const canRemove = accounts.length > 1;

                        return (
                          <motion.article
                            layout
                            key={account.id}
                            className={`overflow-hidden rounded-lg border ${
                              active
                                ? "accent-soft border-[color:var(--lumen-accent)]"
                                : "border-foreground/10 bg-background/25"
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3 p-3">
                              <span
                                aria-hidden
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-medium tracking-[0.05em] ${
                                  active
                                    ? "bg-[var(--lumen-accent)] text-[var(--lumen-accent-contrast)]"
                                    : "bg-foreground/8 text-foreground/65"
                                }`}
                              >
                                {initialsFor(account.name)}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                  <h3 className="truncate text-[12px] font-medium">
                                    {account.name}
                                  </h3>
                                  {active ? (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground/10 bg-background/50 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.12em] text-foreground/60">
                                      <Check className="h-2.5 w-2.5" />
                                      Current
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-0.5 truncate text-[9.5px] text-foreground/45">
                                  {account.email} · {account.plan}
                                </p>
                              </div>

                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  disabled={active}
                                  onClick={() => switchAccount(account)}
                                  aria-label={
                                    active
                                      ? `${account.name} is the current account`
                                      : `Switch to ${account.name}`
                                  }
                                  className="h-8 rounded-md border border-foreground/10 px-2.5 text-[9px] transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-accent)] disabled:cursor-default disabled:opacity-40"
                                >
                                  {active ? "Active" : "Switch"}
                                </button>
                                <button
                                  type="button"
                                  disabled={!canRemove}
                                  onClick={() =>
                                    setConfirmRemoveId((current) =>
                                      current === account.id ? null : account.id,
                                    )
                                  }
                                  aria-label={
                                    canRemove
                                      ? `Remove ${account.name} from this device`
                                      : "Cannot remove the only account"
                                  }
                                  title={
                                    canRemove
                                      ? `Remove ${account.name}`
                                      : "At least one account must remain"
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md border border-foreground/10 text-foreground/45 transition hover:border-red-500/30 hover:bg-red-500/8 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-accent)] disabled:cursor-not-allowed disabled:opacity-25"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {confirming ? (
                                <motion.div
                                  role="group"
                                  aria-label={`Confirm removal of ${account.name}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={motionTransition}
                                  className="overflow-hidden"
                                >
                                  <div className="flex flex-col gap-2 border-t border-red-500/20 bg-red-500/6 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-[9.5px] leading-relaxed text-foreground/65">
                                      Remove {account.name}? Their local profile will be removed
                                      from this device.
                                    </p>
                                    <div className="flex shrink-0 gap-1.5">
                                      <button
                                        ref={removeCancelRef}
                                        type="button"
                                        onClick={() => setConfirmRemoveId(null)}
                                        className="h-8 rounded-md px-2.5 text-[9px] transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-accent)]"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeAccount(account)}
                                        className={`${style.buttonClass} h-8 border-red-500/35 bg-red-500/8 px-2.5 text-[9px] text-red-600 dark:text-red-300`}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </motion.article>
                        );
                      })}
                    </div>

                    {accounts.length === 1 ? (
                      <p className="mt-3 flex items-center gap-1.5 text-[9px] text-foreground/40">
                        <CircleUserRound className="h-3 w-3" />
                        Add another local account before removing this one.
                      </p>
                    ) : null}
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            <footer className="min-h-11 shrink-0 border-t border-foreground/10 px-4 py-2.5 sm:px-5">
              <AnimatePresence mode="wait" initial={false}>
                {notice ? (
                  <motion.p
                    key={notice}
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    className="flex items-center gap-1.5 text-[9.5px] text-foreground/60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--lumen-accent)]" />
                    {notice}
                  </motion.p>
                ) : (
                  <motion.p
                    key="local-note"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[9px] text-foreground/35"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Close anytime — no remote account is changed.
                  </motion.p>
                )}
              </AnimatePresence>
            </footer>
          </div>
        </DialogContent>
      </Dialog>
    </MotionConfig>
  );
}
