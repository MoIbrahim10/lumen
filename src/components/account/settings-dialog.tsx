import * as React from "react";
import {
  Accessibility,
  Bell,
  Check,
  Database,
  Download,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AccountSurfaceStyle } from "./types";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  style: AccountSurfaceStyle;
  onOpenPersonalization: () => void;
};

type SettingsSection = "general" | "notifications" | "data" | "accessibility";
type Confirmation = "history" | "preferences" | "reset" | null;

type SettingsState = {
  language: string;
  launchView: "last" | "new-chat" | "library";
  openLinksInNewTab: boolean;
  promptSuggestions: boolean;
  sendWithEnter: boolean;
  responseNotifications: boolean;
  mentionNotifications: boolean;
  productNotifications: boolean;
  interfaceSounds: boolean;
  notificationDelivery: "instant" | "daily";
  saveConversationHistory: boolean;
  improveLumen: boolean;
  archiveAfter: "never" | "30" | "90";
  reducedMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
  screenReaderUpdates: boolean;
};

const STORAGE_KEY = "lumen.account-settings.v1";

const DEFAULT_SETTINGS: SettingsState = {
  language: "English (US)",
  launchView: "last",
  openLinksInNewTab: true,
  promptSuggestions: true,
  sendWithEnter: true,
  responseNotifications: true,
  mentionNotifications: true,
  productNotifications: false,
  interfaceSounds: true,
  notificationDelivery: "instant",
  saveConversationHistory: true,
  improveLumen: false,
  archiveAfter: "never",
  reducedMotion: false,
  highContrast: false,
  largerText: false,
  screenReaderUpdates: true,
};

const SECTIONS: Array<{
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "general", label: "General", description: "App behavior", icon: Settings2 },
  { id: "notifications", label: "Notifications", description: "Alerts and sounds", icon: Bell },
  { id: "data", label: "Data controls", description: "History and privacy", icon: ShieldCheck },
  {
    id: "accessibility",
    label: "Accessibility",
    description: "Motion and readability",
    icon: Accessibility,
  },
];

function readPersistedSettings(): SettingsState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<SettingsState>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Toggle({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--lumen-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        checked ? "border-transparent bg-(--lumen-accent)" : "border-foreground/10 bg-foreground/12"
      }`}
    >
      <motion.span
        aria-hidden
        className="absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full shadow-sm"
        style={{
          background: checked
            ? "var(--lumen-accent-contrast)"
            : "color-mix(in srgb, currentColor 78%, var(--background))",
        }}
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-5 border-b border-foreground/8 px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="text-[12px] font-medium">{title}</div>
        <p className="mt-0.5 max-w-lg text-[10.5px] leading-relaxed opacity-50">{description}</p>
      </div>
      {children}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  label,
  style,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  style: AccountSurfaceStyle;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${style.buttonClass} h-9 max-w-[180px] shrink-0 bg-transparent px-3 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-(--lumen-accent)`}
    >
      {children}
    </select>
  );
}

function Panel({
  title,
  description,
  style,
  children,
}: {
  title: string;
  description: string;
  style: AccountSurfaceStyle;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`settings-${title.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="mb-2 px-1">
        <h3
          id={`settings-${title.toLowerCase().replaceAll(" ", "-")}`}
          className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60"
        >
          {title}
        </h3>
        <p className="mt-1 text-[10px] opacity-45">{description}</p>
      </div>
      <div className={`${style.panelClass} overflow-hidden p-1`}>
        <div className={`${style.panelInnerClass} overflow-hidden`}>{children}</div>
      </div>
    </section>
  );
}

function ConfirmActions({
  description,
  destructiveLabel,
  style,
  onCancel,
  onConfirm,
}: {
  description: string;
  destructiveLabel: string;
  style: AccountSurfaceStyle;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div
        role="alertdialog"
        aria-label={`Confirm ${destructiveLabel.toLowerCase()}`}
        className="flex flex-col gap-3 border-t border-foreground/10 bg-foreground/3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-md text-[10px] leading-relaxed opacity-60">{description}</p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={`${style.buttonClass} h-8 px-3 text-[9px]`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${style.buttonClass} h-8 border-red-500/40 bg-red-500/8 px-3 text-[9px] text-red-600 dark:text-red-300`}
          >
            {destructiveLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
  style,
  onOpenPersonalization,
}: SettingsDialogProps) {
  const prefersReducedMotion = useReducedMotion();
  const [section, setSection] = React.useState<SettingsSection>("general");
  const [settings, setSettings] = React.useState<SettingsState>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState<Confirmation>(null);
  const [notice, setNotice] = React.useState("");

  React.useEffect(() => {
    setSettings(readPersistedSettings());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      setNotice("Settings could not be saved in this browser.");
    }
    window.dispatchEvent(new CustomEvent("lumen:settings-change", { detail: settings }));
  }, [hydrated, settings]);

  React.useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  React.useEffect(() => {
    if (!open) {
      setConfirmation(null);
      setNotice("");
    }
  }, [open]);

  const motionDisabled = Boolean(prefersReducedMotion || settings.reducedMotion);
  const update = <Key extends keyof SettingsState>(key: Key, value: SettingsState[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setConfirmation(null);
    setNotice("All settings restored to their defaults.");
  };

  const exportSettings = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            product: "Lumen",
            exportedAt: new Date().toISOString(),
            settings,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lumen-settings.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Settings export downloaded.");
  };

  const clearPrototypeHistory = () => {
    setConfirmation(null);
    setNotice("Prototype activity cleared. No server records were changed.");
  };

  const erasePreferences = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      setNotice("Saved settings could not be removed in this browser.");
      return;
    }
    setSettings(DEFAULT_SETTINGS);
    setConfirmation(null);
    setNotice("Local settings removed. Account data was not affected.");
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = SECTIONS.findIndex((item) => item.id === section);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % SECTIONS.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + SECTIONS.length) % SECTIONS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = SECTIONS.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const next = SECTIONS[nextIndex];
    setSection(next.id);
    document.getElementById(`settings-tab-${next.id}`)?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${style.panelClass} h-[min(760px,calc(100dvh-24px))] w-[calc(100vw-24px)] max-w-[880px] overflow-hidden border-0 p-1 text-foreground shadow-2xl sm:max-w-[880px]`}
      >
        <div
          className={`${style.panelInnerClass} flex min-h-0 flex-1 flex-col overflow-hidden ${
            settings.highContrast ? "contrast-125" : ""
          } ${settings.largerText ? "[font-size:1.075em]" : ""}`}
        >
          <header className="shrink-0 border-b border-foreground/10 px-5 py-4 pr-12 sm:px-6">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] opacity-50">
              <Settings2 className="h-3.5 w-3.5" />
              Workspace controls
            </div>
            <DialogTitle className="mt-2 text-[24px] font-normal tracking-[-0.025em]">
              Settings
            </DialogTitle>
            <DialogDescription className="mt-1 text-[11px] leading-relaxed opacity-65">
              Manage how Lumen behaves on this device.
            </DialogDescription>
          </header>

          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <nav
              role="tablist"
              aria-label="Settings sections"
              aria-orientation="vertical"
              className="flex shrink-0 gap-1 overflow-x-auto border-b border-foreground/10 p-2 sm:w-48 sm:flex-col sm:overflow-x-visible sm:border-b-0 sm:border-r"
            >
              {SECTIONS.map((item) => {
                const active = item.id === section;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`settings-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={`settings-panel-${item.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setSection(item.id)}
                    onKeyDown={handleTabKeyDown}
                    className={`${active ? "accent-soft" : "hover:bg-foreground/5"} relative flex min-w-[142px] items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--lumen-accent) sm:min-w-0`}
                  >
                    {active && (
                      <motion.span
                        layoutId="settings-active-tab"
                        className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-(--lumen-accent)"
                        transition={
                          motionDisabled
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                      />
                    )}
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-65" />
                    <span className="min-w-0">
                      <span className="block text-[11px]">{item.label}</span>
                      <span className="mt-0.5 hidden font-mono text-[7.5px] uppercase tracking-[0.12em] opacity-40 sm:block">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}

              <div className="mt-auto hidden border-t border-foreground/10 pt-2 sm:block">
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenPersonalization();
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-[10px] opacity-60 transition hover:bg-foreground/5 hover:opacity-100"
                >
                  Open personalization
                </button>
              </div>
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={section}
                  id={`settings-panel-${section}`}
                  role="tabpanel"
                  aria-labelledby={`settings-tab-${section}`}
                  initial={motionDisabled ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={motionDisabled ? { opacity: 1 } : { opacity: 0, y: -5 }}
                  transition={{ duration: motionDisabled ? 0 : 0.18, ease: "easeOut" }}
                  className="space-y-5 p-4 sm:p-5"
                >
                  {section === "general" && (
                    <>
                      <Panel
                        title="Workspace"
                        description="The defaults used when you open Lumen."
                        style={style}
                      >
                        <SettingRow
                          title="Language"
                          description="Controls navigation and interface labels."
                        >
                          <NativeSelect
                            value={settings.language}
                            onChange={(value) => update("language", value)}
                            label="Interface language"
                            style={style}
                          >
                            <option>English (US)</option>
                            <option>English (UK)</option>
                            <option>Français</option>
                            <option>Deutsch</option>
                            <option>العربية</option>
                          </NativeSelect>
                        </SettingRow>
                        <SettingRow
                          title="Launch view"
                          description="Choose where the workspace opens next time."
                        >
                          <NativeSelect
                            value={settings.launchView}
                            onChange={(value) =>
                              update("launchView", value as SettingsState["launchView"])
                            }
                            label="Launch view"
                            style={style}
                          >
                            <option value="last">Last open page</option>
                            <option value="new-chat">New chat</option>
                            <option value="library">Library</option>
                          </NativeSelect>
                        </SettingRow>
                        <SettingRow
                          title="Open links in a new tab"
                          description="Keep your conversation available when following sources."
                        >
                          <Toggle
                            label="Open links in a new tab"
                            checked={settings.openLinksInNewTab}
                            onCheckedChange={(value) => update("openLinksInNewTab", value)}
                          />
                        </SettingRow>
                      </Panel>

                      <Panel
                        title="Composer"
                        description="Tune the behavior of the message field."
                        style={style}
                      >
                        <SettingRow
                          title="Prompt suggestions"
                          description="Show contextual ideas beneath a new conversation."
                        >
                          <Toggle
                            label="Prompt suggestions"
                            checked={settings.promptSuggestions}
                            onCheckedChange={(value) => update("promptSuggestions", value)}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Enter to send"
                          description="Use Shift + Enter to create a new line."
                        >
                          <Toggle
                            label="Enter to send"
                            checked={settings.sendWithEnter}
                            onCheckedChange={(value) => update("sendWithEnter", value)}
                          />
                        </SettingRow>
                      </Panel>
                    </>
                  )}

                  {section === "notifications" && (
                    <>
                      <Panel
                        title="Conversations"
                        description="Choose which activity should get your attention."
                        style={style}
                      >
                        <SettingRow
                          title="Responses are ready"
                          description="Notify when a longer response finishes in the background."
                        >
                          <Toggle
                            label="Responses are ready"
                            checked={settings.responseNotifications}
                            onCheckedChange={(value) => update("responseNotifications", value)}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Mentions and shared chats"
                          description="Updates from people collaborating with you."
                        >
                          <Toggle
                            label="Mentions and shared chats"
                            checked={settings.mentionNotifications}
                            onCheckedChange={(value) => update("mentionNotifications", value)}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Product updates"
                          description="Occasional notes about new Lumen capabilities."
                        >
                          <Toggle
                            label="Product updates"
                            checked={settings.productNotifications}
                            onCheckedChange={(value) => update("productNotifications", value)}
                          />
                        </SettingRow>
                      </Panel>

                      <Panel
                        title="Delivery"
                        description="Notification timing and interface feedback."
                        style={style}
                      >
                        <SettingRow
                          title="Delivery schedule"
                          description="Bundle non-urgent updates into one summary."
                        >
                          <NativeSelect
                            value={settings.notificationDelivery}
                            onChange={(value) =>
                              update(
                                "notificationDelivery",
                                value as SettingsState["notificationDelivery"],
                              )
                            }
                            label="Notification delivery schedule"
                            style={style}
                          >
                            <option value="instant">As they happen</option>
                            <option value="daily">Daily summary</option>
                          </NativeSelect>
                        </SettingRow>
                        <SettingRow
                          title="Interface sounds"
                          description="Play subtle sounds for completed and failed actions."
                        >
                          <Toggle
                            label="Interface sounds"
                            checked={settings.interfaceSounds}
                            onCheckedChange={(value) => update("interfaceSounds", value)}
                          />
                        </SettingRow>
                      </Panel>

                      <p className="px-1 text-[9.5px] leading-relaxed opacity-45">
                        Browser notifications remain subject to your operating-system permissions.
                      </p>
                    </>
                  )}

                  {section === "data" && (
                    <>
                      <Panel
                        title="Privacy"
                        description="Control what this local prototype remembers."
                        style={style}
                      >
                        <SettingRow
                          title="Conversation history"
                          description="Keep recent conversations available in your sidebar."
                        >
                          <Toggle
                            label="Conversation history"
                            checked={settings.saveConversationHistory}
                            onCheckedChange={(value) => update("saveConversationHistory", value)}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Improve Lumen"
                          description="Allow de-identified prototype feedback to improve responses."
                        >
                          <Toggle
                            label="Improve Lumen"
                            checked={settings.improveLumen}
                            onCheckedChange={(value) => update("improveLumen", value)}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Archive inactive chats"
                          description="Move older conversations out of the recent list."
                        >
                          <NativeSelect
                            value={settings.archiveAfter}
                            onChange={(value) =>
                              update("archiveAfter", value as SettingsState["archiveAfter"])
                            }
                            label="Archive inactive chats"
                            style={style}
                          >
                            <option value="never">Never</option>
                            <option value="30">After 30 days</option>
                            <option value="90">After 90 days</option>
                          </NativeSelect>
                        </SettingRow>
                      </Panel>

                      <Panel
                        title="Local data"
                        description="Exports and removals apply only to this browser prototype."
                        style={style}
                      >
                        <SettingRow
                          title="Export settings"
                          description="Download a portable JSON copy of your current preferences."
                        >
                          <button
                            type="button"
                            onClick={exportSettings}
                            className={`${style.buttonClass} flex h-9 shrink-0 items-center gap-2 px-3 text-[9px]`}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Export
                          </button>
                        </SettingRow>
                        <SettingRow
                          title="Clear prototype activity"
                          description="Remove the activity represented in this local demo."
                        >
                          <button
                            type="button"
                            onClick={() => setConfirmation("history")}
                            className={`${style.buttonClass} h-9 shrink-0 px-3 text-[9px]`}
                          >
                            Clear
                          </button>
                        </SettingRow>
                        <AnimatePresence initial={false}>
                          {confirmation === "history" && (
                            <ConfirmActions
                              description="This only clears the activity represented by the prototype. It cannot remove server records."
                              destructiveLabel="Clear activity"
                              style={style}
                              onCancel={() => setConfirmation(null)}
                              onConfirm={clearPrototypeHistory}
                            />
                          )}
                        </AnimatePresence>
                        <SettingRow
                          title="Erase saved settings"
                          description="Remove Lumen settings stored in this browser."
                        >
                          <button
                            type="button"
                            onClick={() => setConfirmation("preferences")}
                            className={`${style.buttonClass} flex h-9 shrink-0 items-center gap-2 border-red-500/30 px-3 text-[9px] text-red-600 dark:text-red-300`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Erase
                          </button>
                        </SettingRow>
                        <AnimatePresence initial={false}>
                          {confirmation === "preferences" && (
                            <ConfirmActions
                              description="Your settings will return to their defaults. Chats and account details are not affected."
                              destructiveLabel="Erase settings"
                              style={style}
                              onCancel={() => setConfirmation(null)}
                              onConfirm={erasePreferences}
                            />
                          )}
                        </AnimatePresence>
                      </Panel>
                    </>
                  )}

                  {section === "accessibility" && (
                    <>
                      <Panel
                        title="Visual"
                        description="Make this settings surface easier to read and navigate."
                        style={style}
                      >
                        <SettingRow
                          title="Reduce motion"
                          description="Replace animated transitions with immediate state changes."
                        >
                          <Toggle
                            label="Reduce motion"
                            checked={settings.reducedMotion}
                            onCheckedChange={(value) => update("reducedMotion", value)}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Increase contrast"
                          description="Strengthen contrast while settings are open."
                        >
                          <Toggle
                            label="Increase contrast"
                            checked={settings.highContrast}
                            onCheckedChange={(value) => update("highContrast", value)}
                          />
                        </SettingRow>
                        <SettingRow
                          title="Larger settings text"
                          description="Increase the size of labels and supporting descriptions."
                        >
                          <Toggle
                            label="Larger settings text"
                            checked={settings.largerText}
                            onCheckedChange={(value) => update("largerText", value)}
                          />
                        </SettingRow>
                      </Panel>

                      <Panel
                        title="Assistive technology"
                        description="Additional feedback for non-visual navigation."
                        style={style}
                      >
                        <SettingRow
                          title="Announce live updates"
                          description="Let screen readers announce completed background actions."
                        >
                          <Toggle
                            label="Announce live updates"
                            checked={settings.screenReaderUpdates}
                            onCheckedChange={(value) => update("screenReaderUpdates", value)}
                          />
                        </SettingRow>
                      </Panel>

                      <div className={`${style.panelClass} p-1`}>
                        <div
                          className={`${style.panelInnerClass} flex items-start gap-3 px-4 py-3`}
                        >
                          <Accessibility className="mt-0.5 h-4 w-4 shrink-0 accent-text" />
                          <p className="text-[10px] leading-relaxed opacity-55">
                            Lumen follows operating-system reduced-motion preferences automatically.
                            Keyboard focus remains visible across every theme and button design.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <footer className="flex shrink-0 flex-col gap-2 border-t border-foreground/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={notice || "saved"}
                role="status"
                aria-live="polite"
                initial={motionDisabled ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex min-h-5 items-center gap-2 text-[9.5px] opacity-55"
              >
                {notice ? (
                  <>
                    <Check className="h-3.5 w-3.5 accent-text" />
                    {notice}
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    Saved locally on this device
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setConfirmation("reset")}
                className={`${style.buttonClass} flex h-9 items-center gap-2 px-3 text-[9px]`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset settings
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className={`${style.buttonClass} accent-soft h-9 px-4 text-[9px]`}
              >
                Done
              </button>
            </div>
          </footer>

          <AnimatePresence initial={false}>
            {confirmation === "reset" && (
              <motion.div
                initial={motionDisabled ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
              >
                <div className={`${style.panelClass} w-full max-w-sm p-1 shadow-2xl`}>
                  <div className={`${style.panelInnerClass} p-5`}>
                    <RotateCcw className="h-5 w-5 accent-text" />
                    <h3 className="mt-4 text-[15px]">Reset all settings?</h3>
                    <p className="mt-1.5 text-[10.5px] leading-relaxed opacity-55">
                      Every section will return to its default. Account details and conversations
                      are not affected.
                    </p>
                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        type="button"
                        autoFocus
                        onClick={() => setConfirmation(null)}
                        className={`${style.buttonClass} h-9 px-3 text-[9px]`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={resetSettings}
                        className={`${style.buttonClass} accent-soft h-9 px-3 text-[9px]`}
                      >
                        Reset all
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { SettingsDialogProps };
