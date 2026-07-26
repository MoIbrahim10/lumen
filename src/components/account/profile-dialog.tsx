import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, Check, Save, UserRound } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AccountProfile, AccountSurfaceStyle } from "./types";

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  style: AccountSurfaceStyle;
  profile: AccountProfile;
  onSave: (profile: AccountProfile) => void;
};

type ProfileErrors = Partial<Record<keyof AccountProfile, string>>;

const EMPTY_ERRORS: ProfileErrors = {};

function normalizeProfile(profile: AccountProfile): AccountProfile {
  return {
    name: profile.name.trim(),
    email: profile.email.trim(),
    role: profile.role.trim(),
    bio: profile.bio.trim(),
  };
}

function profilesMatch(left: AccountProfile, right: AccountProfile) {
  return (
    left.name === right.name &&
    left.email === right.email &&
    left.role === right.role &&
    left.bio === right.bio
  );
}

function validateProfile(profile: AccountProfile): ProfileErrors {
  const errors: ProfileErrors = {};
  const normalized = normalizeProfile(profile);

  if (!normalized.name) errors.name = "Enter a display name.";
  else if (normalized.name.length < 2) errors.name = "Use at least 2 characters.";
  else if (normalized.name.length > 80) errors.name = "Keep the name under 80 characters.";

  if (!normalized.email) errors.email = "Enter an email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!normalized.role) errors.role = "Enter your role.";
  else if (normalized.role.length > 64) errors.role = "Keep the role under 64 characters.";

  if (normalized.bio.length > 320) errors.bio = "Keep the bio under 320 characters.";

  return errors;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "—";
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`.toUpperCase();
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
          transition={{ duration: 0.16 }}
          className="mt-1 overflow-hidden font-sans text-[10px] normal-case leading-snug tracking-normal text-red-500"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export function ProfileDialog({ open, onOpenChange, style, profile, onSave }: ProfileDialogProps) {
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState<AccountProfile>(() => normalizeProfile(profile));
  const [baseline, setBaseline] = useState<AccountProfile>(() => normalizeProfile(profile));
  const [errors, setErrors] = useState<ProfileErrors>(EMPTY_ERRORS);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<number | null>(null);
  const wasOpenRef = useRef(false);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const baseId = useId();
  const ids = {
    title: `${baseId}-title`,
    description: `${baseId}-description`,
    name: `${baseId}-name`,
    email: `${baseId}-email`,
    role: `${baseId}-role`,
    bio: `${baseId}-bio`,
    discardTitle: `${baseId}-discard-title`,
  };

  const isDirty = useMemo(() => {
    return !profilesMatch(draft, baseline);
  }, [baseline, draft]);
  const initials = useMemo(() => initialsFor(draft.name), [draft.name]);

  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened) return;
    const nextProfile = normalizeProfile(profile);
    setDraft(nextProfile);
    setBaseline(nextProfile);
    setErrors(EMPTY_ERRORS);
    setConfirmDiscard(false);
    setSaved(false);
  }, [open, profile]);

  useEffect(() => {
    if (confirmDiscard) keepEditingRef.current?.focus();
  }, [confirmDiscard]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  const updateField = <Key extends keyof AccountProfile>(
    field: Key,
    value: AccountProfile[Key],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSaved(false);
  };

  const requestClose = () => {
    if (confirmDiscard) {
      setConfirmDiscard(false);
      return;
    }
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    onOpenChange(false);
  };

  const discardAndClose = () => {
    setDraft(baseline);
    setErrors(EMPTY_ERRORS);
    setConfirmDiscard(false);
    setSaved(false);
    onOpenChange(false);
  };

  const handleSave = () => {
    const nextErrors = validateProfile(draft);
    setErrors(nextErrors);

    const firstInvalid = (["name", "email", "role", "bio"] as const).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      const refs = {
        name: nameRef,
        email: emailRef,
        role: roleRef,
        bio: bioRef,
      };
      refs[firstInvalid].current?.focus();
      return;
    }

    const nextProfile = normalizeProfile(draft);
    setDraft(nextProfile);
    setBaseline(nextProfile);
    onSave(nextProfile);
    setSaved(true);

    if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
    savedTimerRef.current = window.setTimeout(() => setSaved(false), 1800);
  };

  const inputClass =
    "mt-1.5 w-full rounded-md border border-foreground/15 bg-background/45 px-3 py-2 font-sans text-[12px] normal-case tracking-normal text-foreground outline-none transition-[border-color,box-shadow,background-color] placeholder:text-foreground/30 hover:border-foreground/25 focus:border-[color:var(--lumen-accent)] focus:bg-background/70 focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--lumen-accent)_18%,transparent)] disabled:cursor-not-allowed disabled:opacity-50";
  const labelClass = "block font-mono text-[9px] uppercase tracking-[0.17em] text-foreground/55";

  return (
    <MotionConfig reducedMotion="user">
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) onOpenChange(true);
          else requestClose();
        }}
      >
        <DialogContent
          aria-labelledby={ids.title}
          aria-describedby={ids.description}
          className={`${style.panelClass} w-[calc(100vw-1.5rem)] max-w-[680px] gap-0 overflow-hidden p-1 text-foreground motion-reduce:transition-none sm:rounded-xl`}
        >
          <div
            className={`${style.panelInnerClass} relative max-h-[min(88dvh,700px)] overflow-y-auto`}
          >
            <header className="flex items-start gap-4 border-b border-foreground/10 px-4 py-4 pr-12 sm:px-5 sm:py-5">
              <motion.div
                layout
                initial={false}
                animate={reduceMotion ? undefined : { scale: saved ? [1, 1.06, 1] : 1 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-[13px] font-medium tracking-[0.05em] text-background"
                aria-label={`Avatar preview: ${initials}`}
              >
                {initials}
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-[var(--lumen-accent)] text-background"
                >
                  <UserRound className="h-2.5 w-2.5" />
                </span>
              </motion.div>
              <div className="min-w-0 pt-0.5">
                <DialogTitle
                  id={ids.title}
                  className="text-[17px] font-medium leading-tight tracking-tight"
                >
                  Profile
                </DialogTitle>
                <DialogDescription
                  id={ids.description}
                  className="mt-1 max-w-md text-[11px] leading-relaxed text-foreground/50"
                >
                  Manage how you appear across conversations and shared workspaces.
                </DialogDescription>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-foreground/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-foreground/55">
                    {draft.role.trim() || "Role preview"}
                  </span>
                  <AnimatePresence initial={false}>
                    {isDirty ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.14em] text-foreground/45"
                      >
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rounded-full bg-[var(--lumen-accent)]"
                        />
                        Unsaved
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                handleSave();
              }}
              className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5 sm:py-5"
            >
              <label className={labelClass} htmlFor={ids.name}>
                Display name
                <input
                  ref={nameRef}
                  id={ids.name}
                  name="name"
                  autoComplete="name"
                  value={draft.name}
                  maxLength={81}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                  onChange={(event) => updateField("name", event.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
                <FieldError id={`${ids.name}-error`} message={errors.name} />
              </label>

              <label className={labelClass} htmlFor={ids.email}>
                Email
                <input
                  ref={emailRef}
                  id={ids.email}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={draft.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? `${ids.email}-error` : undefined}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
                <FieldError id={`${ids.email}-error`} message={errors.email} />
              </label>

              <label className={labelClass} htmlFor={ids.role}>
                Role
                <input
                  ref={roleRef}
                  id={ids.role}
                  name="role"
                  autoComplete="organization-title"
                  value={draft.role}
                  maxLength={65}
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={errors.role ? `${ids.role}-error` : undefined}
                  onChange={(event) => updateField("role", event.target.value)}
                  className={inputClass}
                  placeholder="Product designer"
                />
                <FieldError id={`${ids.role}-error`} message={errors.role} />
              </label>

              <label className={`${labelClass} sm:col-span-2`} htmlFor={ids.bio}>
                <span className="flex items-center justify-between gap-3">
                  <span>Bio</span>
                  <span
                    className={`tabular-nums ${
                      draft.bio.length > 320 ? "text-red-500" : "text-foreground/35"
                    }`}
                  >
                    {draft.bio.length}/320
                  </span>
                </span>
                <textarea
                  ref={bioRef}
                  id={ids.bio}
                  name="bio"
                  rows={4}
                  value={draft.bio}
                  maxLength={321}
                  aria-invalid={Boolean(errors.bio)}
                  aria-describedby={errors.bio ? `${ids.bio}-error` : undefined}
                  onChange={(event) => updateField("bio", event.target.value)}
                  className={`${inputClass} min-h-24 resize-none leading-relaxed`}
                  placeholder="A short introduction for collaborators…"
                />
                <FieldError id={`${ids.bio}-error`} message={errors.bio} />
              </label>

              <footer className="flex flex-col-reverse gap-2 border-t border-foreground/10 pt-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-5" aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    {saved ? (
                      <motion.p
                        key="saved"
                        role="status"
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-[10px] text-foreground/60"
                      >
                        <Check className="h-3.5 w-3.5" style={{ color: "var(--lumen-accent)" }} />
                        Profile saved
                      </motion.p>
                    ) : (
                      <motion.p
                        key="privacy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[9px] leading-relaxed text-foreground/40"
                      >
                        Changes stay in this local prototype.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={requestClose}
                    className={`${style.buttonClass} h-9 flex-1 px-4 text-[10px] sm:flex-none`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={!isDirty}
                    whileTap={isDirty && !reduceMotion ? { scale: 0.97 } : undefined}
                    className={`${style.buttonClass} flex h-9 flex-1 items-center justify-center gap-1.5 px-4 text-[10px] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none`}
                    style={
                      isDirty
                        ? {
                            borderColor: "color-mix(in srgb, var(--lumen-accent) 45%, transparent)",
                          }
                        : undefined
                    }
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {saved ? (
                        <motion.span
                          key="saved-icon"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Saved
                        </motion.span>
                      ) : (
                        <motion.span
                          key="save-icon"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save changes
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </footer>
            </form>

            <AnimatePresence>
              {confirmDiscard ? (
                <motion.div
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby={ids.discardTitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.18 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm"
                >
                  <motion.div
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: reduceMotion ? 0.1 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={`${style.panelClass} w-full max-w-sm p-1 shadow-2xl`}
                  >
                    <div className={`${style.panelInnerClass} p-4`}>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                      <h2 id={ids.discardTitle} className="mt-3 text-[13px] font-medium">
                        Discard profile changes?
                      </h2>
                      <p className="mt-1 text-[10px] leading-relaxed text-foreground/50">
                        Your unsaved name, contact, and bio edits will be lost.
                      </p>
                      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          ref={keepEditingRef}
                          type="button"
                          onClick={() => setConfirmDiscard(false)}
                          className={`${style.buttonClass} h-9 px-4 text-[10px]`}
                        >
                          Keep editing
                        </button>
                        <button
                          type="button"
                          onClick={discardAndClose}
                          className="h-9 rounded-md bg-red-500 px-4 text-[10px] font-medium text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                        >
                          Discard changes
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </MotionConfig>
  );
}
