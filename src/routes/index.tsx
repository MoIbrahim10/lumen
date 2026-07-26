import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "motion/react";
import {
  Paperclip, Mic, Wrench, ArrowUp, Globe, Brain, ChevronDown, Sun, Moon, Eye,
  SlidersHorizontal, Menu, EyeOff, FileText, Mail, Code2, Search,
  ScanSearch, Lightbulb, Presentation, Image as ImageIcon,
  Plus, History, Library, FolderClosed, Cpu, Plug,
  Settings, User, ChevronRight, PanelLeft, X, ArrowRight, Check,
  Sparkles, Feather, Smile, Scissors, Wand2,
  Upload, Link2, ClipboardPaste, Github, Database, Calendar,
  Hash, Film, FileAudio, MonitorUp, Pin, PinOff, Pencil, Trash2, ArrowUpDown, FolderPlus,
  FileArchive, FileSpreadsheet, Palette, CircleHelp, LogOut, ArrowLeft,
  MoreHorizontal, Copy, ThumbsUp, ThumbsDown, RefreshCw, Share2, Volume2,
  Files, Link as LinkIcon,
} from "lucide-react";
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup,
  CommandItem, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpDialog } from "@/components/account/help-dialog";
import { AddAccountDialog } from "@/components/account/add-account-dialog";
import { ProfileDialog } from "@/components/account/profile-dialog";
import { SettingsDialog } from "@/components/account/settings-dialog";
import { UpgradePlanDialog } from "@/components/account/upgrade-plan-dialog";
import { accountStore, useAccountState } from "@/components/account/account-store";
import type { AccountSurfaceStyle } from "@/components/account/types";
import type {
  AttachKind,
  Attachment,
  ConversationMessage,
} from "@/data/conversations/types";
import { SEEDED_CONVERSATIONS } from "@/data/conversations";

export const Route = createFileRoute("/")({ component: LayoutGallery });

/* ───────────────────────── shared bits ───────────────────────── */

// Unified spring presets — all icon feedback uses these for consistent feel.
const SPRING_POP = { type: "spring" as const, stiffness: 500, damping: 18, mass: 0.6 };
const SPRING_TURN = { type: "spring" as const, stiffness: 500, damping: 22 };
const SPRING_SETTLE = { type: "spring" as const, stiffness: 360, damping: 26 };
const EASE_OUT_STRONG = "cubic-bezier(0.23, 1, 0.32, 1)";


type Ctx = {
  light: boolean;
  btn: string;
  panel: string;
  panelInner: string;
};

const QUICK = [
  { icon: FileText, label: "Summarize document", prompt: "Summarize this document into key bullet points with a TL;DR at the top." },
  { icon: Mail, label: "Write email", prompt: "Draft a polite, concise email about " },
  { icon: Code2, label: "Generate UI", prompt: "Generate a clean React + Tailwind UI for " },
  { icon: ScanSearch, label: "Research topic", prompt: "Research the latest on " },
  { icon: Lightbulb, label: "Brainstorm ideas", prompt: "Brainstorm 10 creative ideas for " },
  { icon: Code2, label: "Code assistant", prompt: "Help me debug this code:\n\n" },
  { icon: Presentation, label: "Create presentation", prompt: "Outline a 10-slide presentation about " },
  { icon: ImageIcon, label: "Create image", prompt: "Generate an image of " },
];

/* ───────── tiny pub/sub so chips can stream into the input ───────── */
const promptBus = (() => {
  const listeners = new Set<(text: string) => void>();
  return {
    emit: (text: string) => listeners.forEach((l) => l(text)),
    subscribe: (cb: (text: string) => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
})();

/* ───────── composerStore — shared input state across InputBlock + PrimaryRow ───────── */
const composerStore = (() => {
  let snap = { value: "", streaming: false, listening: false, fillEpoch: 0 };
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  return {
    get: () => snap,
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => { listeners.delete(cb); };
    },
    setValue: (v: string) => { snap = { ...snap, value: v }; notify(); },
    setStreaming: (v: boolean) => { snap = { ...snap, streaming: v }; notify(); },
    setListening: (v: boolean) => { snap = { ...snap, listening: v }; notify(); },
    bumpFillEpoch: () => { snap = { ...snap, fillEpoch: snap.fillEpoch + 1 }; notify(); },
  };
})();

function useComposer() {
  return useSyncExternalStore(composerStore.subscribe, composerStore.get, composerStore.get);
}

/* ───────── attachmentsStore — files + links + pasted snippets in the composer ───────── */
const attachmentsStore = (() => {
  let snap: Attachment[] = [];
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  let counter = 0;
  return {
    get: () => snap,
    subscribe: (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    add: (a: Omit<Attachment, "id">) => { snap = [...snap, { ...a, id: `att-${++counter}` }]; notify(); },
    remove: (id: string) => { snap = snap.filter((a) => a.id !== id); notify(); },
    clear: () => { snap = []; notify(); },
  };
})();

function useAttachments() {
  return useSyncExternalStore(attachmentsStore.subscribe, attachmentsStore.get, attachmentsStore.get);
}

const kindIcon = (k: AttachKind) => {
  switch (k) {
    case "image": return <ImageIcon className="h-3 w-3" />;
    case "audio": return <FileAudio className="h-3 w-3" />;
    case "video": return <Film className="h-3 w-3" />;
    case "url": return <Link2 className="h-3 w-3" />;
    case "text": return <ClipboardPaste className="h-3 w-3" />;
    default: return <FileText className="h-3 w-3" />;
  }
};

const kindFromFile = (f: File): AttachKind => {
  if (f.type.startsWith("image/")) return "image";
  if (f.type.startsWith("audio/")) return "audio";
  if (f.type.startsWith("video/")) return "video";
  return "file";
};

const prettyBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

/* ───────── toolsStore — tools + connectors toggled by the user ───────── */
type ToolDef = { id: string; label: string; desc: string; icon: typeof Globe };
const TOOL_DEFS: ToolDef[] = [
  { id: "think",  label: "Deep think",   desc: "Slower, multi-step reasoning.",   icon: Brain },
  { id: "code",   label: "Code runner",  desc: "Run snippets in a sandbox.",      icon: Code2 },
  { id: "image",  label: "Image gen",    desc: "Generate images inline.",         icon: ImageIcon },
  { id: "scan",   label: "Vision scan",  desc: "Read screenshots and diagrams.",  icon: ScanSearch },
];

type ConnDef = { id: string; label: string; icon: typeof Github; hue: string; status: "linked" | "available" };
const CONN_DEFS: ConnDef[] = [
  { id: "github",   label: "GitHub",          icon: Github,       hue: "#a78bfa", status: "linked" },
  { id: "notion",   label: "Notion",          icon: FileText,     hue: "#94a3b8", status: "linked" },
  { id: "slack",    label: "Slack",           icon: Hash,         hue: "#ec4899", status: "available" },
  { id: "drive",    label: "Google Drive",    icon: FolderClosed, hue: "#60a5fa", status: "linked" },
  { id: "calendar", label: "Calendar",        icon: Calendar,     hue: "#f59e0b", status: "available" },
  { id: "db",       label: "Postgres",        icon: Database,     hue: "#34d399", status: "available" },
];

const toolsStore = (() => {
  let snap: { tools: Set<string>; conns: Set<string> } = {
    tools: new Set<string>(),
    conns: new Set<string>(),
  };
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  return {
    get: () => snap,
    subscribe: (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    toggleTool: (id: string) => {
      const t = new Set(snap.tools);
      t.has(id) ? t.delete(id) : t.add(id);
      snap = { ...snap, tools: t }; notify();
    },
    toggleConn: (id: string) => {
      const c = new Set(snap.conns);
      c.has(id) ? c.delete(id) : c.add(id);
      snap = { ...snap, conns: c }; notify();
    },
  };
})();

function useTools() {
  return useSyncExternalStore(toolsStore.subscribe, toolsStore.get, toolsStore.get);
}

/* ───────── settingsStore — theme, accent, button style (persisted) ───────── */

export type ButtonStyleId =
  | "mech" | "clean" | "emboss" | "depth3d" | "penrose"
  | "squircle" | "liquid" | "pebble" | "inflated" | "paper";

export type ThemePresetId = "obsidian" | "graphite" | "ocean" | "plasma";

type Settings = {
  light: boolean;
  themeId: ThemePresetId;
  hue: number;        // 0-360
  saturation: number; // 0-100
  lightness: number;  // 0-100 (accent lightness)
  buttonStyleId: ButtonStyleId;
};

const DEFAULT_SETTINGS: Settings = {
  light: true,
  themeId: "graphite",
  hue: 145,
  saturation: 84,
  lightness: 39,
  buttonStyleId: "mech",
};

const SETTINGS_KEY = "lumen:settings:v1";

const loadSettings = (): Settings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { return DEFAULT_SETTINGS; }
};

const settingsStore = (() => {
  let snap: Settings = DEFAULT_SETTINGS;
  let hydrated = false;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  const persist = () => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(snap)); } catch {}
    }
  };
  return {
    get: () => snap,
    hydrate: () => {
      if (hydrated) return;
      hydrated = true;
      snap = loadSettings();
      notify();
    },
    subscribe: (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    set: <K extends keyof Settings>(key: K, value: Settings[K]) => {
      snap = { ...snap, [key]: value };
      persist(); notify();
    },
    reset: () => { snap = DEFAULT_SETTINGS; persist(); notify(); },
  };
})();

function useSettings() {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.get, () => DEFAULT_SETTINGS);
}

export const BUTTON_STYLES: {
  id: ButtonStyleId; name: string;
  lightClass: string; darkClass: string;
  panelLight: string; panelDarkClass: string;
  panelInnerLight: string; panelInnerDark: string;
  inner: boolean;
}[] = [
  { id: "mech",     name: "Mechanical", lightClass: "btn-mech-light", darkClass: "btn-mech",
    panelLight: "panel-mech-light", panelDarkClass: "panel-mech",
    panelInnerLight: "panel-inner-mech-light", panelInnerDark: "panel-inner-mech", inner: false },
  { id: "clean",    name: "Cupertino",  lightClass: "btn-clean", darkClass: "btn-clean",
    panelLight: "panel-clean", panelDarkClass: "panel-clean",
    panelInnerLight: "panel-inner-clean", panelInnerDark: "panel-inner-clean", inner: false },
  { id: "emboss",   name: "Embossed",   lightClass: "btn-emboss", darkClass: "btn-emboss",
    panelLight: "panel-emboss", panelDarkClass: "panel-emboss-dark",
    panelInnerLight: "panel-inner-emboss", panelInnerDark: "panel-inner-emboss-dark", inner: false },
  { id: "depth3d",  name: "Soft 3D",    lightClass: "btn-3d", darkClass: "btn-3d",
    panelLight: "panel-3d", panelDarkClass: "panel-3d-dark",
    panelInnerLight: "panel-inner-3d", panelInnerDark: "panel-inner-3d-dark", inner: false },
  { id: "penrose",  name: "Penrose",    lightClass: "btn-penrose", darkClass: "btn-penrose",
    panelLight: "panel-penrose", panelDarkClass: "panel-penrose-dark",
    panelInnerLight: "panel-inner-penrose", panelInnerDark: "panel-inner-penrose-dark", inner: true },
  { id: "squircle", name: "Squircle",   lightClass: "btn-squircle", darkClass: "btn-squircle",
    panelLight: "panel-squircle", panelDarkClass: "panel-squircle-dark",
    panelInnerLight: "panel-inner-squircle", panelInnerDark: "panel-inner-squircle-dark", inner: true },
  { id: "liquid",   name: "Liquid",     lightClass: "btn-liquid", darkClass: "btn-liquid",
    panelLight: "panel-liquid", panelDarkClass: "panel-liquid-dark",
    panelInnerLight: "panel-inner-liquid", panelInnerDark: "panel-inner-liquid-dark", inner: true },
  { id: "pebble",   name: "Pebble",     lightClass: "btn-pebble", darkClass: "btn-pebble",
    panelLight: "panel-pebble", panelDarkClass: "panel-pebble-dark",
    panelInnerLight: "panel-inner-pebble", panelInnerDark: "panel-inner-pebble-dark", inner: false },
  { id: "inflated", name: "Inflated",   lightClass: "btn-inflated", darkClass: "btn-inflated",
    panelLight: "panel-inflated", panelDarkClass: "panel-inflated-dark",
    panelInnerLight: "panel-inner-inflated", panelInnerDark: "panel-inner-inflated-dark", inner: true },
  { id: "paper",    name: "Paper",      lightClass: "btn-paper", darkClass: "btn-paper",
    panelLight: "panel-paper", panelDarkClass: "panel-paper-dark",
    panelInnerLight: "panel-inner-paper", panelInnerDark: "panel-inner-paper-dark", inner: false },
];

type ThemeMode = { bg: string; fg: string; accent: string; panel: string };
export const THEME_PRESETS: { id: ThemePresetId; name: string; tagline: string; light: ThemeMode; dark: ThemeMode }[] = [
  { id: "obsidian", name: "Obsidian", tagline: "Pure black · violet pulse",
    light: { bg: "#f5f3ef", fg: "#1a1a1a", accent: "#7c3aed", panel: "#ecebe6" },
    dark:  { bg: "#0a0a0a", fg: "#f0f0f0", accent: "#a78bfa", panel: "#161616" } },
  { id: "graphite", name: "Graphite Ink", tagline: "Newsprint · soft graphite",
    light: { bg: "#ededeb", fg: "#111111", accent: "#3b3b3b", panel: "#e2e0dc" },
    dark:  { bg: "#1c1c1c", fg: "#e8e8e6", accent: "#a0a0a0", panel: "#262626" } },
  { id: "ocean",    name: "Ocean Deep",   tagline: "Submarine indigo · teal",
    light: { bg: "#e6f1ff", fg: "#0c1f2e", accent: "#0d7a8a", panel: "#d4e5f5" },
    dark:  { bg: "#0c1f2e", fg: "#e6f1ff", accent: "#5cbdb9", panel: "#13293d" } },
  { id: "plasma",   name: "Plasma Violet", tagline: "Midnight · neon plasma",
    light: { bg: "#f7eafe", fg: "#2e0f4a", accent: "#c026d3", panel: "#ecdaf5" },
    dark:  { bg: "#15101f", fg: "#f3eaff", accent: "#e879f9", panel: "#1f1830" } },
];

/* ───────── theme → CSS variables ─────────
   Maps the active theme preset + custom accent onto:
   • shadcn design tokens (--background, --popover, --muted, --border, --primary…)
     so every token-based component repaints with the theme.
   • material seeds (--mat-surface, --mat-fg, --mat-accent) consumed by the
     button/panel materials in styles.css.
   • --lumen-accent/-contrast consumed by the accent helper classes.
   Derived shades use CSS color-mix so they track the seeds reactively. */
function buildThemeVars(mode: ThemeMode, accent: string, accentContrast: string): Record<string, string> {
  const { bg, fg, accent: presetAccent, panel } = mode;
  const mix = (a: string, b: string, pct: number) => `color-mix(in srgb, ${a}, ${b} ${pct}%)`;
  return {
    // page + lumen vars (used by SideMenu + accent helpers)
    "--lumen-page-bg": bg,
    "--lumen-page-fg": fg,
    "--lumen-panel": panel,
    "--lumen-accent": accent,
    "--lumen-accent-contrast": accentContrast,
    "--lumen-preset-accent": presetAccent,
    // material seeds — drive every .btn-*/.panel-* surface
    "--mat-surface": panel,
    "--mat-fg": fg,
    "--mat-accent": accent,
    // shadcn design tokens — drive every token-based component
    "--background": bg,
    "--foreground": fg,
    "--card": panel,
    "--card-foreground": fg,
    "--popover": panel,
    "--popover-foreground": fg,
    "--primary": accent,
    "--primary-foreground": accentContrast,
    "--secondary": mix(panel, fg, 7),
    "--secondary-foreground": fg,
    "--muted": mix(panel, fg, 6),
    "--muted-foreground": mix(fg, bg, 42),
    "--accent": mix(panel, fg, 10),
    "--accent-foreground": fg,
    "--border": mix(bg, fg, 16),
    "--input": mix(bg, fg, 16),
    "--ring": accent,
  };
}

/* Readable foreground for the accent fill — accent lightness picks black vs white. */
const accentContrastFor = (lightness: number) => (lightness > 62 ? "#0b0b0b" : "#ffffff");

const ACCENT_LIGHTNESS_MIN = 10;
const ACCENT_LIGHTNESS_MAX = 95;

const ACCENT_SWATCHES = [
  { hue: 262, saturation: 72, lightness: 58 },
  { hue: 220, saturation: 85, lightness: 55 },
  { hue: 175, saturation: 70, lightness: 40 },
  { hue: 145, saturation: 65, lightness: 42 },
  { hue: 85,  saturation: 75, lightness: 45 },
  { hue: 38,  saturation: 92, lightness: 50 },
  { hue: 22,  saturation: 90, lightness: 52 },
  { hue: 350, saturation: 75, lightness: 55 },
] as const;

const accentHsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;

const matchesAccentSwatch = (settings: Settings, swatch: (typeof ACCENT_SWATCHES)[number]) =>
  Math.round(settings.hue) === swatch.hue
  && Math.round(settings.saturation) === swatch.saturation
  && Math.round(settings.lightness) === swatch.lightness;




function HoverTip({ label, keys, desc, children, side = "bottom", align = "center", hideOnClick = false }: {
  label: string; keys?: string; desc?: string; children: ReactNode; side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  /** Dismiss on press; stay hidden until pointer leaves (for click-to-cycle controls). */
  hideOnClick?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [suppressed, setSuppressed] = useState(false);
  const show = hover && !suppressed;
  const pos = side === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]";
  const alignClass =
    align === "start"
      ? "left-0 translate-x-0"
      : align === "end"
        ? "right-0 left-auto translate-x-0"
        : "left-1/2 -translate-x-1/2";
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => { if (!suppressed) setHover(true); }}
      onMouseLeave={() => { setHover(false); setSuppressed(false); }}
      onFocus={() => { if (!suppressed) setHover(true); }}
      onBlur={() => { setHover(false); setSuppressed(false); }}
      onPointerDown={hideOnClick ? () => { setHover(false); setSuppressed(true); } : undefined}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 480, damping: 30, mass: 0.5 }}
            className={`pointer-events-none absolute z-60 ${alignClass} ${pos} ${
              desc
                ? "w-[240px] flex-col items-start"
                : "flex items-center gap-2 whitespace-nowrap"
            } hidden max-w-[calc(100vw_-_1rem)] rounded-lg border border-border/60 bg-popover/95 px-3 py-2 text-popover-foreground shadow-xl backdrop-blur-sm sm:flex`}
          >
            <span className="flex w-full items-center gap-1.5">
              <span aria-hidden className="h-1 w-1 rounded-full bg-foreground/50" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">{label}</span>
            </span>
            {desc && (
              <>
                <span aria-hidden className="my-1.5 h-px w-full bg-border/60" />
                <span className="text-[11px] leading-relaxed opacity-70 normal-case tracking-normal">
                  {desc}
                </span>
              </>
            )}
            {keys && !desc && (
              <kbd className="rounded-sm border border-border bg-muted/40 px-1.5 py-px font-mono text-[9px] tracking-widest">
                {keys}
              </kbd>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}


function IconBtn({ ctx, children, onClick, dim = false, size = 9, tip, keys, "aria-label": ariaLabel }: {
  ctx: Ctx; children: ReactNode; onClick?: () => void; dim?: boolean; size?: number;
  tip?: string; keys?: string; "aria-label"?: string;
}) {
  const btn = (
    <button
      onClick={onClick}
      aria-label={ariaLabel || tip}
      className={`${ctx.btn} flex items-center justify-center ${dim ? "opacity-40" : ""}`}
      style={{ width: size * 4, height: size * 4 }}
    >
      {children}
    </button>
  );
  return tip ? <HoverTip label={tip} keys={keys}>{btn}</HoverTip> : btn;
}

function Pill({ ctx, children, onClick }: { ctx: Ctx; children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`${ctx.btn} flex items-center gap-1.5 px-3 py-1.5 text-[11px]`}>
      {children}
    </button>
  );
}

function TogglePill({
  ctx, on, onClick, label, desc, icon, tipAlign, hideTipOnClick = false, size = 30,
}: {
  ctx: Ctx; on: boolean; onClick: () => void;
  label: string; desc: string; icon: ReactNode;
  tipAlign?: "start" | "center" | "end";
  hideTipOnClick?: boolean;
  size?: number;
}) {
  return (
    <HoverTip label={label} desc={desc} align={tipAlign} hideOnClick={hideTipOnClick}>
      <motion.button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        aria-label={`${label} ${on ? "on" : "off"}`}
        whileTap={{ scale: 0.92 }}
        transition={SPRING_TURN}
        style={{ height: size, width: size }}
        className={`${ctx.btn} relative flex items-center justify-center`}
      >
        <motion.span
          key={`t-${on}`}
          initial={{ scale: 0.7, rotate: on ? -16 : 16 }}
          animate={{
            scale: 1,
            rotate: 0,
            color: on ? "var(--lumen-accent)" : "var(--muted-foreground)",
          }}
          transition={{
            scale: SPRING_POP,
            rotate: SPRING_POP,
            color: { duration: 0.2 },
          }}

          className="inline-flex"
        >
          {icon}
        </motion.span>

      </motion.button>

    </HoverTip>
  );
}


function Dropdown({
  ctx, value, options, label, onChange, align = "left",
}: {
  ctx: Ctx; value: string; options: string[]; label?: string;
  onChange: (v: string) => void; align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`${ctx.btn} flex items-center gap-1.5 px-3 py-1.5 text-[11px]`}>
        {label && <span className="opacity-60">{label}</span>}
        <span>{value}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute top-full z-50 mt-1 min-w-[170px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg ${align === "right" ? "right-0" : "left-0"}`}
          >
            {options.map((o) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                className="block w-full px-3 py-2 text-left text-xs hover:bg-muted"
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────── Style + Model glyphs (cycle button style) ───────── */

const STYLE_OPTIONS = ["Auto", "Formal", "Friendly", "Concise", "Creative"] as const;
const STYLE_ICONS: Record<(typeof STYLE_OPTIONS)[number], typeof Sparkles> = {
  Auto: Sparkles,
  Formal: Feather,
  Friendly: Smile,
  Concise: Scissors,
  Creative: Wand2,
};

function StyleGlyph({ index }: { index: number }) {
  const name = STYLE_OPTIONS[index] ?? "Auto";
  const Icon = STYLE_ICONS[name];
  return <Icon className="h-3.5 w-3.5" />;
}

const MODEL_OPTIONS = ["Lumen 4 Mini", "Lumen 4", "Lumen 4 Pro"] as const;

function ModelGlyph({ index }: { index: number }) {
  // signal-strength style — 3 vertical bars of growing height
  const heights = [4, 8, 12];
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      {heights.map((h, i) => {
        const active = i <= index;
        return (
          <motion.rect
            key={i}
            x={1 + i * 4.5}
            width="2.5"
            rx="1"
            initial={false}
            animate={{
              height: active ? h : 2,
              y: active ? 13 - h : 11,
              opacity: active ? 1 : 0.3,
            }}
            transition={{ ...SPRING_SETTLE, delay: i * 0.04 }}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}


/* ───────── FancyPicker — creative dropdown for multi-option selectors ───────── */

type PickerOption = { id: string; desc?: string; glyph: ReactNode };

function FancyPicker({
  ctx, label, value, options, onChange, align = "left", className = "", compact = false,
}: {
  ctx: Ctx;
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (v: string) => void;
  align?: "left" | "right";
  /** applied to the root — pass e.g. "min-w-0 flex-1 sm:flex-none" so the trigger can shrink */
  className?: string;
  /** hide the text label on mobile to save width (e.g. the Model picker in a tight row) */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.id === value) ?? options[0];
  const longest = options.reduce((a, b) => (a.id.length >= b.id.length ? a : b)).id;
  const activeId = hoverId ?? value;
  const activeIndex = Math.max(0, options.findIndex((o) => o.id === activeId));
  const total = options.length;

  return (
    <div className={`relative ${className}`}>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.97 }}
        className={`${ctx.btn} flex h-9 w-full min-w-0 items-center gap-1.5 px-3 text-[11px] cursor-pointer select-none`}
      >
        {/* compact pickers hide the label on mobile to save width; others always show it */}
        <span className={`shrink-0 opacity-60 ${compact ? "hidden sm:inline" : ""}`}>{label}</span>
        <span className="relative flex min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left sm:inline-block sm:flex-none sm:overflow-visible">
          {/* mobile: truncating value (sizes to fit available space) */}
          <span className="block min-w-0 truncate sm:hidden">{current.id}</span>
          {/* desktop: animated value over a reserved longest-width spacer (no width jump) */}
          <span className="invisible hidden sm:inline">{longest}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={current.id}
              initial={{ y: -8, opacity: 0, filter: "blur(2px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: 8, opacity: 0, filter: "blur(2px)" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 hidden sm:block"
            >
              {current.id}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.span
          animate={{ rotate: open ? -180 : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="ml-0.5 inline-flex shrink-0"
        >
          <ChevronDown className="h-3 w-3 opacity-60" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (() => {
          // Anchor just above the trigger, but clamp into the viewport so the
          // menu stays connected to the selector without ever overflowing.
          const r = triggerRef.current?.getBoundingClientRect();
          const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
          const vh = typeof window !== "undefined" ? window.innerHeight : 768;
          const w = Math.min(260, vw - 16);
          const anchorLeft = r ? (align === "right" ? r.right - w : r.left) : 8;
          const left = Math.min(Math.max(8, anchorLeft), vw - w - 8);
          const bottom = r ? vh - r.top + 8 : 8;
          return (
          <>
            <div
              className="fixed inset-0 z-40"
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); }}
            />
            {/* anchored just above the trigger; position clamped into the viewport */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.55 }}
              style={{ position: "fixed", left, bottom, width: w, transformOrigin: align === "right" ? "bottom right" : "bottom left" }}
              onMouseLeave={() => setHoverId(null)}
              className={`${ctx.panel} z-50 overflow-hidden p-1`}
            >
              <div className={`${ctx.panelInner} relative overflow-hidden`}>


              {/* header strip */}
              <div className="relative flex items-center justify-between border-b border-border/40 px-3 py-2">
                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] opacity-70">
                  <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-foreground/60" />
                  {label}
                </span>
                <span className="font-mono text-[9px] tabular-nums uppercase tracking-[0.18em] opacity-45">
                  {String(activeIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
                </span>
              </div>

              {/* options list */}
              <LayoutGroup id={`picker-${label}`}>
                <div className="relative py-1">
                  {options.map((o, i) => {
                    const selected = o.id === value;
                    const active = o.id === activeId;
                    return (
                      <motion.button
                        key={o.id}
                        type="button"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.05 + i * 0.04,
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onClick={() => { onChange(o.id); setOpen(false); }}
                        onMouseEnter={() => setHoverId(o.id)}
                        className="group/row relative flex w-full items-start gap-2.5 px-3 py-2 text-left"
                      >
                        {/* active row backdrop */}
                        {active && (
                          <motion.span
                            layoutId={`picker-bg-${label}`}
                            transition={{ type: "spring", stiffness: 480, damping: 36, mass: 0.5 }}
                            className="absolute inset-x-1 inset-y-0.5 rounded-md bg-foreground/6"
                          />
                        )}
                        {/* left rail for selected */}
                        {selected && (
                          <motion.span
                            layoutId={`picker-rail-${label}`}
                            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.5 }}
                            className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full"
                            style={{ background: "var(--lumen-accent)" }}
                          />
                        )}

                        {/* index + caret column */}
                        <span className="relative z-10 mt-px flex w-7 shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] opacity-60 tabular-nums">
                          <span className="inline-block w-2 text-foreground/80">
                            {active ? (
                              <motion.span
                                layoutId={`picker-caret-${label}`}
                                transition={{ type: "spring", stiffness: 520, damping: 34 }}
                                className="inline-block"
                              >
                                ▸
                              </motion.span>
                            ) : null}
                          </span>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                        </span>

                        {/* glyph */}
                        <motion.span
                          animate={{ scale: active ? 1.08 : 1, opacity: active ? 1 : 0.65 }}
                          transition={{ type: "spring", stiffness: 420, damping: 28 }}
                          className="relative z-10 mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center"
                        >
                          {o.glyph}
                        </motion.span>

                        {/* text */}
                        <span className="relative z-10 flex min-w-0 flex-1 flex-col">
                          <span className={`text-[11px] leading-tight ${selected ? "text-foreground" : active ? "text-foreground/90" : "text-foreground/70"}`}>
                            {o.id}
                          </span>
                          {o.desc && (
                            <motion.span
                              initial={false}
                              animate={{
                                height: active ? "auto" : 0,
                                opacity: active ? 0.6 : 0,
                                marginTop: active ? 2 : 0,
                              }}
                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden text-[10px] leading-snug"
                            >
                              {o.desc}
                            </motion.span>
                          )}
                        </span>

                        {/* selected marker */}
                        <span className="relative z-10 mt-[5px] flex h-2 w-2 shrink-0 items-center justify-center">
                          {selected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 520, damping: 24 }}
                              className="inline-block h-1.5 w-1.5 rounded-full"
                              style={{ background: "var(--lumen-accent)" }}
                            />
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>

              {/* footer hint strip */}
              <div className="relative flex items-center justify-between border-t border-border/40 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] opacity-45">
                <span className="flex items-center gap-1">
                  <kbd className="rounded-sm border border-border/60 px-1 py-px text-[8px]">↑↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded-sm border border-border/60 px-1 py-px text-[8px]">↵</kbd>
                  <span>select</span>
                </span>
              </div>
              </div>
            </motion.div>
          </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}


/* ───────── CycleButton — click to cycle, animated SVG indicator ───────── */

function LengthGlyph({ index }: { index: number }) {
  // 3 horizontal bars of growing width; active count = index+1
  const widths = [6, 10, 14];
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
      {widths.map((w, i) => {
        const active = i <= index;
        return (
          <motion.rect
            key={i}
            x="1"
            y={2 + i * 4}
            height="2"
            rx="1"
            initial={false}
            animate={{
              width: active ? w : 3,
              opacity: active ? 1 : 0.3,
            }}
            transition={{ ...SPRING_SETTLE, delay: i * 0.04 }}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}

function DepthGlyph({ index }: { index: number }) {
  // Depth gauge: 3 strata lines + a probe that descends through them
  const probeY = 3 + index * 4;
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
      {[0, 1, 2].map((i) => {
        const reached = i <= index;
        const y = 3 + i * 4;
        return (
          <motion.line
            key={i}
            x1="2"
            x2="14"
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: reached ? 0.9 : 0.25 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          />
        );
      })}
      <motion.circle
        cx="8"
        r="1.8"
        fill="currentColor"
        initial={false}
        animate={{ cy: probeY }}
        transition={SPRING_SETTLE}
      />
    </svg>
  );
}


function CycleButton({
  ctx, label, options, value, onChange, glyph, descriptions, showLabel = true,
}: {
  ctx: Ctx;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  glyph: (i: number) => ReactNode;
  descriptions?: Record<string, string>;
  showLabel?: boolean;
}) {
  const index = Math.max(0, options.indexOf(value));
  const [bump, setBump] = useState(0);

  const cycle = () => {
    const next = options[(index + 1) % options.length];
    onChange(next);
    setBump((b) => b + 1);
  };

  const desc = descriptions?.[value];

  return (
    <HoverTip label={`${label} · ${value}`} desc={desc} hideOnClick>
      <motion.button
        type="button"
        onClick={cycle}
        aria-label={`${label}: ${value}`}
        animate={{ scale: bump ? [1, 0.96, 1] : 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={`${ctx.btn} flex h-9 items-center gap-1.5 ${showLabel ? "px-3" : "px-2.5"} text-[11px] cursor-pointer select-none`}
      >
        {showLabel && <span className="opacity-60">{label}</span>}
        <motion.span
          key={`g-${index}`}
          initial={{ rotate: -14, scale: 0.7 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            scale: SPRING_POP,
            rotate: SPRING_POP,
          }}

          className="inline-flex"
        >
          {glyph(index)}
        </motion.span>
      </motion.button>
    </HoverTip>
  );
}




function accountInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "E"}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`.toUpperCase();
}

function Profile({ ctx }: { ctx: Ctx }) {
  const accountState = useAccountState();
  const activeAccount =
    accountState.accounts.find((account) => account.id === accountState.activeAccountId) ??
    accountState.accounts[0];

  useEffect(() => {
    accountStore.hydrate();
  }, []);

  return (
    <motion.button
      onClick={() => window.dispatchEvent(new Event("layout:open-profile"))}
      whileTap={{ scale: 0.92 }}
      transition={SPRING_TURN}
      className={`${ctx.btn} flex h-[30px] w-[30px] items-center justify-center p-0`}
      aria-label="Profile"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
        {accountInitials(activeAccount?.name ?? "Emma")}
      </span>
    </motion.button>
  );
}

type WorkspaceView = "chat" | "library" | "connectors";
type ChatThread = {
  id: string;
  title: string;
  summary: string;
  updated: string;
};
type ProjectGroup = {
  id: string;
  name: string;
  chats: ChatThread[];
};

const PROJECT_GROUPS: ProjectGroup[] = [
  {
    id: "lumen",
    name: "Lumen",
    chats: [
      { id: "navigation-ia", title: "Navigation and IA", summary: "Refine the sidebar and workspace structure.", updated: "Now" },
      { id: "motion-system", title: "Motion system", summary: "Shape subtle, interruptible interface motion.", updated: "2h" },
      { id: "theme-qa", title: "Theme QA", summary: "Check color, surface, and button-style variants.", updated: "Yesterday" },
    ],
  },
  {
    id: "client-work",
    name: "Client workspace",
    chats: [
      { id: "launch-brief", title: "Launch brief", summary: "Turn product notes into a concise launch plan.", updated: "Mon" },
      { id: "research-synthesis", title: "Research synthesis", summary: "Organize interview findings and next steps.", updated: "Fri" },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    chats: [
      { id: "portfolio-story", title: "Portfolio story", summary: "Clarify the narrative for recent case studies.", updated: "Jul 18" },
      { id: "weekly-planning", title: "Weekly planning", summary: "Prioritize deep work and recurring tasks.", updated: "Jul 14" },
    ],
  },
];

const RECENT_THREADS: ChatThread[] = [
  { id: "assistant-flow", title: "Writing assistant flow", summary: "Explore a focused writing workspace.", updated: "1h" },
  { id: "browser-review", title: "Browser performance review", summary: "Summarize the latest UI validation notes.", updated: "4h" },
  { id: "email-concepts", title: "Confirmation email concepts", summary: "Develop calm, editorial confirmation patterns.", updated: "Yesterday" },
  { id: "healthy-routine", title: "Building a healthy routine", summary: "Create a flexible, sustainable weekly plan.", updated: "Tue" },
];

const ALL_THREADS = [
  ...PROJECT_GROUPS.flatMap((project) => project.chats),
  ...RECENT_THREADS,
];

type AgentProgress = {
  phase: "thinking" | "working" | "streaming";
  label: string;
  detail: string;
};

function seededConversation(chat: ChatThread): ConversationMessage[] {
  const fixture = SEEDED_CONVERSATIONS[chat.id];
  if (fixture) return fixture;

  if (chat.id === "navigation-ia") {
    return [
      {
        id: `${chat.id}-1`,
        role: "user",
        content:
          "Refine the sidebar and workspace structure. I want the navigation to feel lighter, and the sidebar and conversation should scroll independently.",
        timestamp: "10:42",
      },
      {
        id: `${chat.id}-2`,
        role: "assistant",
        content:
          "I’d separate the shell into two scroll regions and keep primary navigation visually distinct from project content. That preserves context without making every row compete like a button.",
        timestamp: "10:43",
        variant: "steps",
        title: "A lighter navigation model",
        points: [
          "Keep the sidebar viewport-bound with its own scroll.",
          "Let the conversation own the remaining vertical space.",
          "Keep the composer reachable at the bottom of the thread.",
        ],
      },
      {
        id: `${chat.id}-3`,
        role: "user",
        content:
          "Good. Projects and chats should remain collapsible, and sending the first prompt should feel like the workspace is becoming a conversation.",
        timestamp: "10:47",
      },
      {
        id: `${chat.id}-4`,
        role: "assistant",
        content:
          "That gives us a clear interaction model: the centered new-chat composer can transition into the thread composer, while the submitted prompt becomes the first message and Lumen responds in place.",
        timestamp: "10:48",
      },
    ];
  }

  const firstAssistant: ConversationMessage =
    chat.id === "browser-review"
      ? {
          id: `${chat.id}-2`,
          role: "assistant",
          content:
            "The latest pass is healthy overall. The remaining work is concentrated in scroll behavior and response feedback rather than visual polish.",
          timestamp: "09:19",
          variant: "table",
          title: "Validation summary",
          table: {
            headers: ["Area", "Status", "Next check"],
            rows: [
              ["Navigation", "Stable", "Keyboard focus"],
              ["Conversation", "Needs work", "Bottom anchoring"],
              ["Composer", "Stable", "Long prompts"],
            ],
          },
        }
      : chat.id === "assistant-flow"
        ? {
            id: `${chat.id}-2`,
            role: "assistant",
            content:
              "Here’s a clearer writing flow: start with the intended outcome, keep the supporting detail in one compact paragraph, then end with a direct next step.",
            timestamp: "09:19",
            variant: "rewrite",
            title: "A cleaner working draft",
          }
        : {
            id: `${chat.id}-2`,
            role: "assistant",
            content: `I’ve turned that into a focused starting point for ${chat.title.toLowerCase()}. The structure stays practical so we can refine it without losing the calm visual system.`,
            timestamp: "09:19",
            variant: "steps",
            title: "Recommended direction",
            points: [
              "Clarify the primary goal and hierarchy.",
              "Make state changes visible and reversible.",
              "Reuse the active theme and interaction patterns.",
            ],
          };

  return [
    {
      id: `${chat.id}-1`,
      role: "user",
      content: chat.summary,
      timestamp: "09:18",
      attachments:
        chat.id === "browser-review"
          ? [
              {
                id: `${chat.id}-notes`,
                kind: "file",
                name: "ui-validation-notes.md",
                meta: "18 KB",
              },
              {
                id: `${chat.id}-capture`,
                kind: "image",
                name: "scroll-behavior.png",
                meta: "284 KB",
              },
            ]
          : undefined,
    },
    firstAssistant,
    {
      id: `${chat.id}-3`,
      role: "user",
      content: "Keep it concise, but make the next steps concrete.",
      timestamp: "09:22",
    },
    {
      id: `${chat.id}-4`,
      role: "assistant",
      content:
        "Understood. I’ll keep the surface quiet, show only the decisions that affect the workflow, and make every action easy to verify.",
      timestamp: "09:22",
    },
  ];
}

function createAssistantReply(
  prompt: string,
  sequence: number,
): Omit<ConversationMessage, "id" | "streaming"> {
  const focus = prompt.replace(/\s+/g, " ").trim();
  const lower = focus.toLowerCase();

  if (/(write|rewrite|email|copy|wording|better|polite)/.test(lower)) {
    return {
      role: "assistant",
      timestamp: "Now",
      variant: "rewrite",
      title: "Here’s a smoother version",
      content:
        "I’ve refined the message so the main point lands quickly, the tone stays warm, and the next step is unmistakable.\n\nThe result is concise enough to scan, while keeping the context a reader needs to respond with confidence.",
    };
  }

  if (/(code|debug|error|api|typescript|javascript|request|payload)/.test(lower)) {
    return {
      role: "assistant",
      timestamp: "Now",
      variant: "code",
      title: "The state and payload need one source of truth",
      content:
        "The UI can look correct while the submitted value is stale. Bind the control to state, then build the request from that same state at submit time.",
      code: {
        language: "TypeScript",
        value:
          "const [accepted, setAccepted] = useState(false)\n\nconst payload = {\n  ...formValues,\n  privacyPolicyAccepted: accepted,\n}",
      },
    };
  }

  if (/(research|summar|compare|requirements|review|audit|data)/.test(lower)) {
    return {
      role: "assistant",
      timestamp: "Now",
      variant: "table",
      title: "Quick assessment",
      content:
        "I grouped the request into the decisions that affect the experience most, so the next pass can stay focused.",
      table: {
        headers: ["Priority", "Decision", "Outcome"],
        rows: [
          ["High", "Primary flow", "Keep the path obvious"],
          ["High", "Feedback", "Show progress immediately"],
          ["Medium", "Polish", "Reuse current theme tokens"],
        ],
      },
    };
  }

  if (sequence % 2 === 0) {
    return {
      role: "assistant",
      timestamp: "Now",
      variant: "steps",
      title: "I’d approach it in three passes",
      content:
        "The request is clear. I’d keep the existing visual language and improve the experience where state changes are most visible.",
      points: [
        "Make the immediate action and result feel connected.",
        "Keep progress visible without shifting the layout.",
        "Verify the final state across the active styles.",
      ],
    };
  }

  return {
    role: "assistant",
    timestamp: "Now",
    variant: "prose",
    title: "That direction makes sense",
    content:
      "I’d keep this change intentionally quiet: preserve the hierarchy that already works, remove the repeated visual treatment, and let the response shape follow the content instead of forcing every answer into the same card.",
  };
}

function LeftPill({ ctx, sideOpen, onSide, onSearch }: {
  ctx: Ctx; sideOpen: boolean; onSide?: () => void; onSearch: () => void;
}) {
  return (
    <div className="absolute left-4 top-3 z-60 flex items-center gap-1.5">
      {onSide && (
        <HoverTip label={sideOpen ? "Close menu" : "Open menu"} keys="⌘B" align="start">
          <motion.button
            onClick={onSide}
            aria-label={sideOpen ? "Close menu" : "Open menu"}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_TURN}
            className={`${ctx.btn} flex h-[30px] w-[30px] items-center justify-center`}
          >
            <PanelLeft
              className="h-[15px] w-[15px] transition-transform duration-300 ease-out"
              strokeWidth={2}
              style={{ transform: sideOpen ? "scaleX(-1)" : "scaleX(1)" }}
            />
          </motion.button>
        </HoverTip>
      )}
      <HoverTip label="Search" keys="⌘K" align="start">
        <motion.button
          onClick={onSearch}
          aria-label="Search"
          whileTap={{ scale: 0.92 }}
          transition={SPRING_TURN}
          className={`${ctx.btn} flex h-[30px] w-[30px] items-center justify-center`}
        >
          <Search className="h-[15px] w-[15px]" strokeWidth={2} />
        </motion.button>
      </HoverTip>
    </div>
  );
}

type AccountMenuView = "main" | "accounts" | "signout";
type AccountDialogView = "settings" | "profile" | "plan" | "help" | "add-account" | null;
type PreferencesSource = "Preferences" | "Personalization" | "Settings";

function openPreferences(source: PreferencesSource) {
  window.dispatchEvent(new CustomEvent("layout:open-preferences", { detail: { source } }));
}

function AccountMenuItem({
  icon: Icon,
  label,
  onClick,
  trailing,
  destructive = false,
}: {
  icon: typeof User;
  label: string;
  onClick: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[11px] transition-colors ${
        destructive
          ? "text-red-500 hover:bg-red-500/[0.08]"
          : "hover:bg-foreground/[0.06]"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-65" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </button>
  );
}

function SidebarAccountMenu({ ctx }: { ctx: Ctx }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AccountMenuView>("main");
  const [dialog, setDialog] = useState<AccountDialogView>(null);
  const [notice, setNotice] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const accountState = useAccountState();
  const activeAccount =
    accountState.accounts.find((account) => account.id === accountState.activeAccountId) ??
    accountState.accounts[0];
  const activeProfile = accountState.profiles[accountState.activeAccountId] ?? {
    name: activeAccount?.name ?? "Emma",
    email: activeAccount?.email ?? "emma@lumen.app",
    role: "",
    bio: "",
  };
  const surfaceStyle: AccountSurfaceStyle = {
    buttonClass: ctx.btn,
    panelClass: ctx.panel,
    panelInnerClass: ctx.panelInner,
  };

  const close = () => {
    setOpen(false);
    setView("main");
    setNotice("");
  };

  const showView = (next: AccountMenuView) => {
    setNotice("");
    setView(next);
  };

  const showDialog = (next: Exclude<AccountDialogView, null>) => {
    close();
    setDialog(next);
  };

  useEffect(() => {
    accountStore.hydrate();
    const onOpenProfile = () => {
      setOpen(false);
      setView("main");
      setNotice("");
      setDialog("profile");
    };
    window.addEventListener("layout:open-profile", onOpenProfile);
    return () => window.removeEventListener("layout:open-profile", onOpenProfile);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openSettings = (source: PreferencesSource) => {
    close();
    openPreferences(source);
  };

  const backHeader = (title: string) => (
    <div className="flex items-center gap-2 border-b border-foreground/10 px-2 py-1.5">
      <button
        type="button"
        onClick={() => showView("main")}
        className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-foreground/[0.06]"
        aria-label="Back to account menu"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
      </button>
      <span className="text-[11px] font-medium">{title}</span>
    </div>
  );

  return (
    <div ref={menuRef} className="relative mt-3 border-t border-foreground/10 pt-2">
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Account menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97, filter: "blur(4px)" }}
            transition={reduceMotion ? { duration: 0.12 } : SPRING_SETTLE}
            style={{ transformOrigin: "bottom center" }}
            className={`${ctx.panel} absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-30 max-h-[min(70vh,430px)] overflow-hidden p-1 shadow-xl`}
          >
            <div className={`${ctx.panelInner} overflow-hidden`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={view}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: view === "main" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: view === "main" ? -10 : 10 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="max-h-[min(68vh,418px)] overflow-y-auto p-1"
                >
                  {view === "main" && (
                    <>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => showView("accounts")}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-foreground/[0.06]"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
                          {accountInitials(activeAccount?.name ?? "Emma")}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col leading-tight">
                          <span className="truncate text-[11px] font-medium">{activeAccount?.name ?? "Emma"}</span>
                          <span className="truncate font-mono text-[8px] uppercase tracking-[0.12em] opacity-45">
                            {activeAccount?.plan ?? "Pro"} workspace
                          </span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-45" />
                      </button>
                      <span aria-hidden className="my-1 block h-px bg-foreground/10" />
                      <AccountMenuItem icon={Sparkles} label="Upgrade plan" onClick={() => showDialog("plan")} />
                      <AccountMenuItem icon={Palette} label="Personalization" onClick={() => openSettings("Personalization")} />
                      <AccountMenuItem icon={User} label="Profile" onClick={() => showDialog("profile")} />
                      <AccountMenuItem icon={Settings} label="Settings" onClick={() => showDialog("settings")} />
                      <span aria-hidden className="my-1 block h-px bg-foreground/10" />
                      <AccountMenuItem
                        icon={CircleHelp}
                        label="Help"
                        onClick={() => showDialog("help")}
                      />
                      <AccountMenuItem icon={LogOut} label="Log out" onClick={() => showView("signout")} destructive />
                    </>
                  )}

                  {view === "accounts" && (
                    <>
                      {backHeader("Accounts")}
                      <div className="px-2.5 pb-1 pt-2 font-mono text-[8px] uppercase tracking-[0.14em] opacity-45">
                        {activeAccount?.email ?? "emma@lumen.app"}
                      </div>
                      {accountState.accounts.map((account) => {
                        const active = account.id === accountState.activeAccountId;
                        return (
                          <button
                            key={account.id}
                            type="button"
                            role="menuitem"
                            onClick={() => accountStore.switchAccount(account.id)}
                            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-foreground/[0.06]"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
                              {accountInitials(account.name)}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col leading-tight">
                              <span className="truncate text-[11px] font-medium">{account.name}</span>
                              <span className="truncate text-[9px] opacity-45">{account.email}</span>
                            </span>
                            {active && <Check className="h-3.5 w-3.5" style={{ color: "var(--lumen-accent)" }} />}
                          </button>
                        );
                      })}
                      <span aria-hidden className="my-1 block h-px bg-foreground/10" />
                      <AccountMenuItem
                        icon={Plus}
                        label="Add account"
                        onClick={() => showDialog("add-account")}
                      />
                    </>
                  )}

                  {view === "signout" && (
                    <>
                      {backHeader("Log out")}
                      <div className="px-3 py-3">
                        <p className="text-[11px] font-medium">Log out of Lumen?</p>
                        <p className="mt-1 text-[10px] leading-relaxed opacity-55">This local prototype has no connected authentication session.</p>
                        <div className="mt-3 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => showView("main")}
                            className={`${ctx.btn} flex h-8 flex-1 items-center justify-center text-[10px]`}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => setNotice("No active session to log out.")}
                            className="flex h-8 flex-1 items-center justify-center rounded-md bg-red-500 text-[10px] text-white transition-colors hover:bg-red-600"
                          >
                            Log out
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <AnimatePresence>
                    {notice && (
                      <motion.p
                        role="status"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-2 mb-2 rounded-md border border-foreground/10 bg-foreground/[0.035] px-2.5 py-2 text-[9px] leading-relaxed opacity-65"
                      >
                        {notice}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setView("main");
          setNotice("");
        }}
        whileTap={{ scale: 0.985 }}
        transition={SPRING_TURN}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${ctx.btn} flex w-full items-center gap-2.5 px-2.5 py-2 text-left`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
          {accountInitials(activeAccount?.name ?? "Emma")}
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[11px] font-medium">{activeAccount?.name ?? "Emma"}</span>
          <span className="truncate font-mono text-[8px] uppercase tracking-[0.12em] opacity-45">
            {activeAccount?.plan ?? "Pro"} workspace
          </span>
        </span>
        <motion.span animate={{ rotate: open ? -90 : 0 }} transition={SPRING_TURN}>
          <ChevronRight className="h-3.5 w-3.5 opacity-45" />
        </motion.span>
      </motion.button>

      <SettingsDialog
        open={dialog === "settings"}
        onOpenChange={(nextOpen) => setDialog(nextOpen ? "settings" : null)}
        style={surfaceStyle}
        onOpenPersonalization={() => {
          setDialog(null);
          requestAnimationFrame(() => openPreferences("Personalization"));
        }}
      />
      <ProfileDialog
        open={dialog === "profile"}
        onOpenChange={(nextOpen) => setDialog(nextOpen ? "profile" : null)}
        style={surfaceStyle}
        profile={activeProfile}
        onSave={accountStore.saveProfile}
      />
      <HelpDialog
        open={dialog === "help"}
        onOpenChange={(nextOpen) => setDialog(nextOpen ? "help" : null)}
        style={surfaceStyle}
        onOpenSearch={() => {
          setDialog(null);
          requestAnimationFrame(() => window.dispatchEvent(new Event("layout:open-search")));
        }}
      />
      <UpgradePlanDialog
        open={dialog === "plan"}
        onOpenChange={(nextOpen) => setDialog(nextOpen ? "plan" : null)}
        style={surfaceStyle}
        currentPlan={activeAccount?.plan ?? "Pro"}
        onPlanChange={accountStore.setPlan}
      />
      <AddAccountDialog
        open={dialog === "add-account"}
        onOpenChange={(nextOpen) => setDialog(nextOpen ? "add-account" : null)}
        style={surfaceStyle}
        accounts={accountState.accounts}
        activeAccountId={accountState.activeAccountId}
        onAdd={accountStore.addAccount}
        onSwitch={accountStore.switchAccount}
        onRemove={accountStore.removeAccount}
      />
    </div>
  );
}


function SideMenu({
  ctx,
  open,
  onToggle,
  activeView = "chat",
  selectedChatId,
  onNavigate,
  onNewChat,
  onSelectChat,
  additionalThreads = [],
  pinnedChatIds: controlledPinnedChatIds,
  onTogglePinnedChat,
  deletedChatIds = new Set<string>(),
  onRequestDeleteChat,
}: {
  ctx: Ctx;
  open: boolean;
  onToggle?: () => void;
  activeView?: WorkspaceView;
  selectedChatId?: string | null;
  onNavigate?: (view: WorkspaceView) => void;
  onNewChat?: () => void;
  onSelectChat?: (chat: ChatThread) => void;
  additionalThreads?: ChatThread[];
  pinnedChatIds?: Set<string>;
  onTogglePinnedChat?: (chatId: string) => void;
  deletedChatIds?: Set<string>;
  onRequestDeleteChat?: (chat: ChatThread) => void;
}) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [chatsOpen, setChatsOpen] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    () => new Set(["lumen"]),
  );
  const [localPinnedChatIds, setLocalPinnedChatIds] = useState<Set<string>>(
    () => new Set(["navigation-ia"]),
  );
  const pinnedChatIds = controlledPinnedChatIds ?? localPinnedChatIds;

  const toggleProject = (projectId: string) => {
    setExpandedProjects((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const togglePin = (chatId: string) => {
    if (onTogglePinnedChat) {
      onTogglePinnedChat(chatId);
      return;
    }
    setLocalPinnedChatIds((current) => {
      const next = new Set(current);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  };

  const visibleRecentThreads = [...additionalThreads, ...RECENT_THREADS].filter(
    (chat) => !deletedChatIds.has(chat.id),
  );
  const pinnedThreads = [...ALL_THREADS, ...additionalThreads].filter(
    (chat) => pinnedChatIds.has(chat.id) && !deletedChatIds.has(chat.id),
  );

  const threadRow = (chat: ChatThread, nested = false) => {
    const selected = activeView === "chat" && selectedChatId === chat.id;
    const pinned = pinnedChatIds.has(chat.id);
    return (
      <div key={chat.id} className={`group/thread relative min-w-0 ${nested ? "ml-3" : ""}`}>
        <button
          type="button"
          onClick={() => onSelectChat?.(chat)}
          className={`${selected ? "accent-soft" : "hover:bg-foreground/[0.045]"} flex h-8 w-full min-w-0 items-center gap-2 rounded-md px-2.5 text-left text-[11px] transition-colors`}
          aria-current={selected ? "page" : undefined}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: pinned ? "var(--lumen-accent)" : "color-mix(in srgb, currentColor 28%, transparent)" }}
          />
          <span className="min-w-0 flex-1 truncate">{chat.title}</span>
          <span className="shrink-0 font-mono text-[8px] opacity-35 transition-opacity sm:group-hover/thread:opacity-0 sm:group-focus-within/thread:opacity-0">
            {chat.updated}
          </span>
        </button>
        <div
          className="absolute inset-y-0 right-0 flex items-center gap-0.5 rounded-r-md pl-6 pr-1 opacity-100 transition-opacity sm:pointer-events-none sm:opacity-0 sm:group-hover/thread:pointer-events-auto sm:group-hover/thread:opacity-100 sm:group-focus-within/thread:pointer-events-auto sm:group-focus-within/thread:opacity-100"
          style={{ background: "linear-gradient(90deg, transparent, var(--lumen-panel) 28%)" }}
        >
          <HoverTip label={pinned ? "Unpin chat" : "Pin chat"} align="end">
            <motion.button
              type="button"
              onClick={() => togglePin(chat.id)}
              whileTap={{ scale: 0.88 }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-55 transition-[background-color,opacity] hover:bg-foreground/[0.07] hover:opacity-100 focus-visible:opacity-100"
              aria-label={`${pinned ? "Unpin" : "Pin"} ${chat.title}`}
              aria-pressed={pinned}
            >
              {pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </motion.button>
          </HoverTip>
          {onRequestDeleteChat ? (
            <HoverTip label="Delete chat" align="end">
              <motion.button
                type="button"
                onClick={() => onRequestDeleteChat(chat)}
                whileTap={{ scale: 0.88 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-500 opacity-55 transition-[background-color,opacity] hover:bg-red-500/[0.08] hover:opacity-100 focus-visible:opacity-100"
                aria-label={`Delete ${chat.title}`}
              >
                <Trash2 className="h-3 w-3" />
              </motion.button>
            </HoverTip>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* mobile backdrop — taps close the drawer */}
      <div
        aria-hidden
        onMouseDown={onToggle}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 sm:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* mobile: fixed drawer that slides in (no layout push); sm+: in-flow width push */}
      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-[260px] overflow-hidden border-r border-foreground/10 shadow-2xl transition-transform duration-300 ease-out sm:static sm:z-auto sm:shrink-0 sm:translate-x-0 sm:shadow-none sm:transition-[width] ${
          open ? "translate-x-0 sm:w-[260px]" : "-translate-x-full sm:w-0"
        }`}
        style={{ background: "var(--lumen-panel)" }}
      >
        <div
          className="flex h-full w-[260px] flex-col px-2 pb-3 pt-[58px] transition-opacity duration-200"
          style={{ opacity: open ? 1 : 0, transitionDelay: open ? "120ms" : "0ms" }}
        >
          <div className="px-2 pb-3 pt-1">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium tracking-tight">Lumen</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] opacity-45">Personal workspace</span>
            </div>
          </div>
          <nav aria-label="Workspace" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={onNewChat}
                className={`${ctx.btn} flex h-10 items-center justify-between gap-2 px-3 text-[11px]`}
              >
                <span className="flex items-center gap-2.5">
                  <Plus className="h-3.5 w-3.5 opacity-70" />
                  New chat
                </span>
                <kbd className="font-mono text-[9px] tracking-widest opacity-40">⌘N</kbd>
              </button>

              {[
                { id: "library" as const, label: "Library", icon: Library, keys: "⌘L" },
                { id: "connectors" as const, label: "Connectors", icon: Plug, keys: "⌘⇧C" },
              ].map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate?.(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`${ctx.btn} ${active ? "accent-soft" : ""} flex h-10 items-center justify-between gap-2 px-3 text-[11px]`}
                  >
                    <span className="flex items-center gap-2.5">
                      <item.icon className="h-3.5 w-3.5 opacity-70" />
                      {item.label}
                    </span>
                    <kbd className="font-mono text-[9px] tracking-widest opacity-40">{item.keys}</kbd>
                  </button>
                );
              })}
            </div>

            <div className="my-3 h-px bg-foreground/10" />

            <button
              type="button"
              onClick={() => setProjectsOpen((value) => !value)}
              className="flex h-8 items-center justify-between px-2 text-[10px] font-medium uppercase tracking-[0.12em] opacity-65 transition-opacity hover:opacity-100"
              aria-expanded={projectsOpen}
            >
              <span>Projects</span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[8px] opacity-50">{PROJECT_GROUPS.length}</span>
                <motion.span animate={{ rotate: projectsOpen ? 90 : 0 }} transition={SPRING_TURN}>
                  <ChevronRight className="h-3 w-3" />
                </motion.span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {projectsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1 pb-2">
                    {PROJECT_GROUPS.map((project) => {
                      const projectChats = project.chats.filter(
                        (chat) => !deletedChatIds.has(chat.id),
                      );
                      const expanded = expandedProjects.has(project.id);
                      return (
                        <div key={project.id}>
                          <button
                            type="button"
                            onClick={() => toggleProject(project.id)}
                            className={`${expanded ? "bg-foreground/[0.035]" : ""} flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-[11px] transition-colors hover:bg-foreground/[0.055]`}
                            aria-expanded={expanded}
                          >
                            <FolderClosed className="h-3.5 w-3.5 opacity-65" />
                            <span className="min-w-0 flex-1 truncate">{project.name}</span>
                            <span className="font-mono text-[8px] opacity-40">{projectChats.length}</span>
                            <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={SPRING_TURN}>
                              <ChevronRight className="h-3 w-3 opacity-55" />
                            </motion.span>
                          </button>
                          <AnimatePresence initial={false}>
                            {expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-1 flex flex-col gap-1 overflow-hidden"
                              >
                                {projectChats.map((chat) => threadRow(chat, true))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {pinnedThreads.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex h-8 items-center justify-between px-2 text-[10px] font-medium uppercase tracking-[0.12em] opacity-65">
                  <span>Pinned</span>
                  <span className="font-mono text-[8px] opacity-50">{pinnedThreads.length}</span>
                </div>
                {pinnedThreads.map((chat) => threadRow(chat))}
              </div>
            )}

            <div className="mt-2 flex flex-col">
              <button
                type="button"
                onClick={() => setChatsOpen((value) => !value)}
                className="flex h-8 items-center justify-between px-2 text-[10px] font-medium uppercase tracking-[0.12em] opacity-65 transition-opacity hover:opacity-100"
                aria-expanded={chatsOpen}
              >
                <span>Chats</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[8px] opacity-50">Recent</span>
                  <motion.span animate={{ rotate: chatsOpen ? 90 : 0 }} transition={SPRING_TURN}>
                    <ChevronRight className="h-3 w-3" />
                  </motion.span>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {chatsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-1 overflow-hidden"
                  >
                    {visibleRecentThreads.map((chat) => threadRow(chat))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <SidebarAccountMenu ctx={ctx} />
        </div>
      </aside>
    </>
  );
}

type LibraryAsset = {
  id: string;
  name: string;
  kind: "folder" | "image" | "video" | "document" | "archive";
  modified: string;
  modifiedAt: number;
  size: string;
  sizeBytes: number | null;
};

const INITIAL_LIBRARY_ASSETS: LibraryAsset[] = [
  { id: "lumen", name: "Lumen", kind: "folder", modified: "Today", modifiedAt: Date.parse("2026-07-26T10:30:00"), size: "—", sizeBytes: null },
  { id: "sidebar-study", name: "sidebar-reference.png", kind: "image", modified: "Today", modifiedAt: Date.parse("2026-07-26T09:15:00"), size: "284 KB", sizeBytes: 284 * 1024 },
  { id: "interaction-notes", name: "Interaction notes.md", kind: "document", modified: "Yesterday", modifiedAt: Date.parse("2026-07-25T17:40:00"), size: "18 KB", sizeBytes: 18 * 1024 },
  { id: "theme-matrix", name: "Theme QA matrix.pdf", kind: "document", modified: "Jul 24", modifiedAt: Date.parse("2026-07-24T14:20:00"), size: "126 KB", sizeBytes: 126 * 1024 },
  { id: "connector-map", name: "connector-map.png", kind: "image", modified: "Jul 23", modifiedAt: Date.parse("2026-07-23T11:05:00"), size: "94 KB", sizeBytes: 94 * 1024 },
  { id: "research-brief", name: "Research brief.docx", kind: "document", modified: "Jul 21", modifiedAt: Date.parse("2026-07-21T08:50:00"), size: "42 KB", sizeBytes: 42 * 1024 },
];

type LibraryFilter = "all" | "images" | "videos" | "documents" | "archives";
type LibrarySortKey = "name" | "modified" | "size";

const IMAGE_EXTENSIONS = new Set([
  "avif", "bmp", "gif", "heic", "heif", "jpeg", "jpg", "png", "svg", "tif", "tiff", "webp",
]);
const VIDEO_EXTENSIONS = new Set([
  "avi", "m4v", "mkv", "mov", "mp4", "mpeg", "mpg", "webm",
]);
const SPREADSHEET_EXTENSIONS = new Set(["csv", "tsv", "xls", "xlsx"]);
const CODE_EXTENSIONS = new Set([
  "astro", "bash", "c", "cc", "cjs", "cpp", "cs", "csharp", "css", "cxx", "fish", "go", "h", "hpp",
  "html", "htm", "java", "js", "json", "jsonl", "jsx", "kt", "kts", "less", "mjs", "php", "py",
  "rb", "rs", "sass", "scss", "sh", "sql", "svelte", "swift", "ts", "tsx", "vue", "xml", "yaml",
  "yml", "zsh",
]);
const DOCUMENT_EXTENSIONS = new Set([
  "doc", "docx", "md", "pdf", "ppt", "pptx", "rtf", "txt",
  ...SPREADSHEET_EXTENSIONS,
  ...CODE_EXTENSIONS,
]);
const LIBRARY_ACCEPT = [
  "image/*",
  "video/*",
  ...Array.from(DOCUMENT_EXTENSIONS, (extension) => `.${extension}`),
  ".zip",
].join(",");

function fileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function classifyLibraryFile(file: Pick<File, "name" | "type">): LibraryAsset["kind"] | null {
  const extension = fileExtension(file.name);
  if (extension === "zip" || file.type === "application/zip") return "archive";
  if (IMAGE_EXTENSIONS.has(extension) || file.type.startsWith("image/")) return "image";
  if (VIDEO_EXTENSIONS.has(extension) || file.type.startsWith("video/")) return "video";
  if (DOCUMENT_EXTENSIONS.has(extension)) return "document";
  return null;
}

function libraryAssetIcon(asset: LibraryAsset) {
  if (asset.kind === "folder") return FolderClosed;
  if (asset.kind === "image") return ImageIcon;
  if (asset.kind === "video") return Film;
  if (asset.kind === "archive") return FileArchive;
  const extension = fileExtension(asset.name);
  if (SPREADSHEET_EXTENSIONS.has(extension)) return FileSpreadsheet;
  if (CODE_EXTENSIONS.has(extension)) return Code2;
  return FileText;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

function LibrarySurface({ ctx }: { ctx: Ctx }) {
  const [assets, setAssets] = useState(INITIAL_LIBRARY_ASSETS);
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<LibrarySortKey>("modified");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [recentlyRenamedId, setRecentlyRenamedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleAssets = assets
    .filter((asset) => {
      const matchesQuery = asset.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "images" && asset.kind === "image") ||
        (filter === "videos" && asset.kind === "video") ||
        (filter === "documents" && asset.kind === "document") ||
        (filter === "archives" && asset.kind === "archive");
      return matchesQuery && matchesFilter;
    })
    .sort((a, b) => {
      let result = 0;
      if (sortKey === "name") result = a.name.localeCompare(b.name);
      if (sortKey === "modified") result = a.modifiedAt - b.modifiedAt;
      if (sortKey === "size") result = (a.sizeBytes ?? -1) - (b.sizeBytes ?? -1);
      if (result === 0) result = a.id.localeCompare(b.id);
      return sortDirection === "asc" ? result : -result;
    });

  const createFolder = () => {
    const names = new Set(assets.map((asset) => asset.name.toLowerCase()));
    let name = "New folder";
    let suffix = 2;
    while (names.has(name.toLowerCase())) {
      name = `New folder ${suffix}`;
      suffix += 1;
    }
    const now = Date.now();
    const next: LibraryAsset = {
      id: `folder-${now}`,
      name,
      kind: "folder",
      modified: "Just now",
      modifiedAt: now,
      size: "—",
      sizeBytes: null,
    };
    setAssets((current) => [next, ...current]);
    setFilter("all");
    setQuery("");
    setSelectedId(next.id);
    setRenamingId(next.id);
    setRenameValue(next.name);
    setNewMenuOpen(false);
  };

  const uploadFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const now = Date.now();
    const selected = Array.from(files);
    const uploaded = selected.flatMap<LibraryAsset>((file, index) => {
      const kind = classifyLibraryFile(file);
      if (!kind) return [];
      return [{
        id: `upload-${now}-${index}`,
        name: file.name,
        kind,
        modified: "Just now",
        modifiedAt: now - index,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
      }];
    });
    const rejected = selected.length - uploaded.length;
    if (uploaded.length) {
      setAssets((current) => [...uploaded, ...current]);
      setFilter("all");
      setQuery("");
      setSelectedId(uploaded[0].id);
    }
    setUploadNotice(
      rejected > 0
        ? `${rejected} ${rejected === 1 ? "file was" : "files were"} not added because the format is unsupported.`
        : null,
    );
    setNewMenuOpen(false);
  };

  const changeSort = (nextKey: LibrarySortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === "name" ? "asc" : "desc");
  };

  const beginRename = (asset: LibraryAsset) => {
    setSelectedId(asset.id);
    setRenamingId(asset.id);
    setRenameValue(asset.name);
  };

  const commitRename = (assetId: string, nextValue: string) => {
    const name = nextValue.trim();
    if (name) {
      const now = Date.now();
      setAssets((current) =>
        current.map((asset) =>
          asset.id === assetId
            ? {
                ...asset,
                name,
                kind:
                  asset.kind === "folder"
                    ? "folder"
                    : classifyLibraryFile({ name, type: "" }) ?? asset.kind,
                modified: "Just now",
                modifiedAt: now,
              }
            : asset,
        ),
      );
      setRecentlyRenamedId(assetId);
      window.setTimeout(() => setRecentlyRenamedId(null), 700);
    }
    setRenamingId(null);
  };

  const deleteAsset = (assetId: string) => {
    if (deletingId) return;
    setDeletingId(assetId);
    window.setTimeout(() => {
      setAssets((current) => current.filter((asset) => asset.id !== assetId));
      setSelectedId((current) => current === assetId ? null : current);
      setRenamingId((current) => current === assetId ? null : current);
      setDeletingId(null);
    }, 180);
  };

  const sortHeader = (key: LibrarySortKey, label: string, className = "") => {
    const active = sortKey === key;
    return (
      <button
        type="button"
        onClick={() => changeSort(key)}
        aria-label={`Sort by ${label.toLowerCase()}`}
        className={`flex items-center gap-1.5 transition-opacity hover:opacity-100 ${className} ${active ? "opacity-100" : "opacity-60"}`}
      >
        <span>{label}</span>
        <motion.span
          animate={{ rotate: active && sortDirection === "asc" ? 180 : 0 }}
          transition={SPRING_TURN}
          className="inline-flex"
        >
          <ArrowUpDown className="h-2.5 w-2.5" style={active ? { color: "var(--lumen-accent)" } : undefined} />
        </motion.span>
      </button>
    );
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-5 sm:px-8 sm:pt-8">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] opacity-45">Workspace assets</span>
            <h1 className="mt-1 text-[28px] font-light tracking-tight sm:text-[34px]">Library</h1>
            <p className="mt-1 max-w-[520px] text-[12px] leading-relaxed opacity-55">
              Files and generated artifacts from your conversations.
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <label className={`${ctx.panelInner} flex h-10 min-w-0 flex-1 items-center gap-2 px-3 sm:w-[260px]`}>
              <Search className="h-3.5 w-3.5 shrink-0 opacity-45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search library"
                className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:opacity-40"
              />
            </label>
            <div
              className="relative shrink-0"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setNewMenuOpen(false);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={LIBRARY_ACCEPT}
                multiple
                className="hidden"
                onChange={(event) => {
                  uploadFiles(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
              <motion.button
                type="button"
                onClick={() => setNewMenuOpen((current) => !current)}
                whileTap={{ scale: 0.96 }}
                aria-haspopup="menu"
                aria-expanded={newMenuOpen}
                className={`${ctx.btn} accent-soft flex h-10 items-center gap-2 px-3.5 text-[11px]`}
              >
                <Plus className="h-3.5 w-3.5" />
                New
                <motion.span
                  animate={{ rotate: newMenuOpen ? 180 : 0 }}
                  transition={SPRING_TURN}
                  className="inline-flex"
                >
                  <ChevronDown className="h-3 w-3 opacity-55" />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {newMenuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className={`${ctx.panel} absolute right-0 top-full z-30 mt-2 w-[230px] p-1.5`}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setNewMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className={`${ctx.btn} flex w-full items-center gap-3 px-2.5 py-2.5 text-left`}
                    >
                      <span className={`${ctx.panelInner} flex h-8 w-8 shrink-0 items-center justify-center`}>
                        <Upload className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px]">Upload files</span>
                        <span className="mt-0.5 block text-[9px] opacity-45">Images, videos, files, or ZIP</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={createFolder}
                      className={`${ctx.btn} mt-1 flex w-full items-center gap-3 px-2.5 py-2.5 text-left`}
                    >
                      <span className={`${ctx.panelInner} flex h-8 w-8 shrink-0 items-center justify-center`}>
                        <FolderPlus className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px]">New folder</span>
                        <span className="mt-0.5 block text-[9px] opacity-45">Create an empty folder</span>
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {uploadNotice && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              className={`${ctx.panelInner} mt-3 flex items-center gap-2 overflow-hidden px-3 py-2 text-[10px]`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-red-500" />
              <span className="min-w-0 flex-1">{uploadNotice}</span>
              <button
                type="button"
                onClick={() => setUploadNotice(null)}
                aria-label="Dismiss upload message"
                className={`${ctx.btn} flex h-6 w-6 shrink-0 items-center justify-center`}
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all" as const, label: "All" },
              { id: "images" as const, label: "Images" },
              { id: "videos" as const, label: "Videos" },
              { id: "documents" as const, label: "Files" },
              { id: "archives" as const, label: "ZIP" },
            ].map((item) => {
              const active = filter === item.id;
              return (
                <motion.button
                  layout
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={active}
                  className={`${ctx.btn} relative h-9 overflow-hidden px-3 text-[10px]`}
                >
                  {active && (
                    <motion.span
                      layoutId="library-filter-active"
                      className="accent-soft absolute inset-0"
                      transition={{ type: "spring", stiffness: 440, damping: 34 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={visibleAssets.length}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 0.45, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="font-mono text-[9px] uppercase tracking-[0.18em]"
            >
              {visibleAssets.length} {visibleAssets.length === 1 ? "item" : "items"}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className={`${ctx.panel} mt-4 p-2`}>
          <div className={`${ctx.panelInner} overflow-hidden`}>
            <div className="grid grid-cols-[minmax(0,1fr)_76px_68px] items-center gap-3 border-b border-foreground/10 px-3 py-2.5 font-mono text-[8px] uppercase tracking-[0.18em] opacity-45 sm:grid-cols-[minmax(0,1fr)_110px_80px_68px]">
              {sortHeader("name", "Name")}
              {sortHeader("modified", "Modified")}
              {sortHeader("size", "Size", "hidden justify-end sm:flex")}
              <span className="text-right">Actions</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div layout>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {visibleAssets.map((asset) => {
                      const Icon = libraryAssetIcon(asset);
                      const selected = selectedId === asset.id;
                      const renaming = renamingId === asset.id;
                      const deleting = deletingId === asset.id;
                      const recentlyRenamed = recentlyRenamedId === asset.id;
                      return (
                        <motion.div
                          layout
                          key={asset.id}
                          initial={{ opacity: 0, y: 8, scale: 0.99 }}
                          animate={
                            deleting
                              ? { opacity: 0.45, x: 14, scale: 0.985, filter: "blur(1px)" }
                              : { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }
                          }
                          exit={{ opacity: 0, x: 24, scale: 0.97, filter: "blur(5px)" }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                          className={`relative grid grid-cols-[minmax(0,1fr)_76px_68px] items-center gap-3 border-b border-foreground/8 px-3 py-2.5 text-left text-[11px] hover:z-20 focus-within:z-20 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_110px_80px_68px] ${
                            selected ? "accent-soft" : "transition-colors hover:bg-foreground/4"
                          }`}
                        >
                          <AnimatePresence>
                            {recentlyRenamed && (
                              <motion.span
                                aria-hidden
                                initial={{ opacity: 0.18 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7 }}
                                className="accent-soft pointer-events-none absolute inset-0"
                              />
                            )}
                          </AnimatePresence>

                          <div className="relative flex min-w-0 items-center gap-2.5">
                            <span className={`${ctx.btn} flex h-8 w-8 shrink-0 items-center justify-center`}>
                              <Icon className="h-3.5 w-3.5" style={{ color: "var(--lumen-accent)" }} />
                            </span>
                            <AnimatePresence mode="wait" initial={false}>
                              {renaming ? (
                                <motion.div
                                  key="rename"
                                  initial={{ opacity: 0, x: -6, filter: "blur(3px)" }}
                                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, x: 6, filter: "blur(3px)" }}
                                  className="min-w-0 flex-1"
                                >
                                  <input
                                    autoFocus
                                    value={renameValue}
                                    onChange={(event) => setRenameValue(event.target.value)}
                                    onBlur={(event) => commitRename(asset.id, event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        event.preventDefault();
                                        commitRename(asset.id, event.currentTarget.value);
                                      }
                                      if (event.key === "Escape") {
                                        event.preventDefault();
                                        setRenamingId(null);
                                      }
                                    }}
                                    aria-label={`Rename ${asset.name}`}
                                    className="w-full border-b border-foreground/20 bg-transparent py-1 outline-none focus:border-(--lumen-accent)"
                                  />
                                </motion.div>
                              ) : (
                                <motion.button
                                  key={`name-${asset.name}`}
                                  type="button"
                                  onClick={() => setSelectedId(asset.id)}
                                  initial={{ opacity: 0, x: -5, filter: "blur(2px)" }}
                                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, x: 5, filter: "blur(2px)" }}
                                  className="min-w-0 flex-1 truncate text-left"
                                >
                                  {asset.name}
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>

                          <span className="relative font-mono text-[9px] opacity-50">{asset.modified}</span>
                          <span className="relative hidden text-right font-mono text-[9px] opacity-50 sm:block">{asset.size}</span>
                          <div className="relative flex items-center justify-end gap-1">
                            <HoverTip label="Rename" side="top" align="end">
                              <motion.button
                                type="button"
                                onClick={() => beginRename(asset)}
                                disabled={deleting}
                                whileTap={{ scale: 0.88 }}
                                className={`${ctx.btn} flex h-7 w-7 items-center justify-center disabled:pointer-events-none disabled:opacity-30`}
                                aria-label={`Rename ${asset.name}`}
                              >
                                <Pencil className="h-3 w-3" />
                              </motion.button>
                            </HoverTip>
                            <HoverTip label="Delete" side="top" align="end">
                              <motion.button
                                type="button"
                                onClick={() => deleteAsset(asset.id)}
                                disabled={deleting}
                                animate={deleting ? { rotate: [0, -12, 12, 0] } : { rotate: 0 }}
                                whileTap={{ scale: 0.88 }}
                                className={`${ctx.btn} flex h-7 w-7 items-center justify-center text-red-500 disabled:pointer-events-none`}
                                aria-label={`Delete ${asset.name}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </motion.button>
                            </HoverTip>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
                {visibleAssets.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-14 text-center"
                  >
                    <Search className="h-5 w-5 opacity-30" />
                    <span className="mt-3 text-[12px] opacity-60">No matching assets</span>
                    <span className="mt-1 text-[10px] opacity-40">Try another search or filter.</span>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

type ConnectorCard = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: typeof Github;
};

const CONNECTOR_CARDS: ConnectorCard[] = [
  { id: "github", name: "GitHub", description: "Review repositories, issues, and pull requests.", category: "Development", icon: Github },
  { id: "notion", name: "Notion", description: "Search workspace knowledge and capture decisions.", category: "Productivity", icon: FileText },
  { id: "drive", name: "Google Drive", description: "Find and work with documents stored in Drive.", category: "Files", icon: FolderClosed },
  { id: "slack", name: "Slack", description: "Read team context and prepare thoughtful replies.", category: "Communication", icon: Hash },
  { id: "calendar", name: "Calendar", description: "Review schedules and prepare for upcoming work.", category: "Productivity", icon: Calendar },
  { id: "database", name: "Postgres", description: "Explore schemas and safely inspect application data.", category: "Development", icon: Database },
  { id: "research", name: "Web Research", description: "Gather current sources and structured findings.", category: "Research", icon: Globe },
  { id: "email", name: "Email", description: "Draft, organize, and respond with conversation context.", category: "Communication", icon: Mail },
];

function ConnectorsSurface({ ctx }: { ctx: Ctx }) {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(
    () => new Set(["github", "notion", "drive"]),
  );
  const [filter, setFilter] = useState<"all" | "connected">("all");
  const [query, setQuery] = useState("");

  const visibleConnectors = CONNECTOR_CARDS.filter((connector) => {
    const matchesQuery = `${connector.name} ${connector.description} ${connector.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesQuery && (filter === "all" || connectedIds.has(connector.id));
  });

  const toggleConnector = (id: string) => {
    setConnectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-5 sm:px-8 sm:pt-8">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] opacity-45">Extend your workspace</span>
            <h1 className="mt-1 text-[28px] font-light tracking-tight sm:text-[34px]">Connectors</h1>
            <p className="mt-1 max-w-[560px] text-[12px] leading-relaxed opacity-55">
              Bring trusted tools and context into Lumen conversations.
            </p>
          </div>
          <label className={`${ctx.panelInner} flex h-10 w-full items-center gap-2 px-3 sm:w-[280px]`}>
            <Search className="h-3.5 w-3.5 shrink-0 opacity-45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search connectors"
              className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:opacity-40"
            />
          </label>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all" as const, label: "Discover" },
              { id: "connected" as const, label: `Connected · ${connectedIds.size}` },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
                className={`${ctx.btn} ${filter === item.id ? "accent-soft" : ""} h-9 px-3 text-[10px]`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-45">
            Local prototype · no credentials stored
          </span>
        </div>

        <motion.div layout className="mt-4 grid gap-2 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {visibleConnectors.map((connector) => {
              const connected = connectedIds.has(connector.id);
              const Icon = connector.icon;
              return (
                <motion.article
                  layout
                  key={connector.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`${ctx.panel} p-2`}
                >
                  <div className={`${ctx.panelInner} flex h-full flex-col p-4`}>
                    <div className="flex items-start gap-3 pb-4">
                      <span className={`${ctx.btn} flex h-10 w-10 shrink-0 items-center justify-center`}>
                        <Icon className="h-4 w-4" style={{ color: "var(--lumen-accent)" }} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-medium">{connector.name}</span>
                          <span className="font-mono text-[8px] uppercase tracking-[0.15em] opacity-40">
                            {connector.category}
                          </span>
                        </span>
                        <span className="mt-1 block text-[10.5px] leading-relaxed opacity-55">
                          {connector.description}
                        </span>
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-foreground/8 pt-3">
                      <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.16em] opacity-50">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: connected
                              ? "var(--lumen-accent)"
                              : "color-mix(in srgb, currentColor 28%, transparent)",
                          }}
                        />
                        {connected ? "Ready" : "Available"}
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => toggleConnector(connector.id)}
                        whileTap={{ scale: 0.95 }}
                        className={`${ctx.btn} ${connected ? "accent-soft" : ""} h-8 px-3 text-[10px]`}
                        aria-pressed={connected}
                      >
                        {connected ? "Disconnect" : "Connect"}
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {visibleConnectors.length === 0 && (
          <div className={`${ctx.panel} mt-4 p-2`}>
            <div className={`${ctx.panelInner} flex flex-col items-center py-14 text-center`}>
              <Plug className="h-5 w-5 opacity-30" />
              <span className="mt-3 text-[12px] opacity-60">No matching connectors</span>
              <span className="mt-1 text-[10px] opacity-40">Try another search or view Discover.</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchPalette({ open, onClose, ctx }: { open: boolean; onClose: () => void; ctx: Ctx }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${ctx.panel} overflow-hidden border-0 p-1 shadow-2xl sm:max-w-[560px]`}>
        <div className={`${ctx.panelInner} overflow-hidden`}>
          <Command className="bg-transparent **:[[cmdk-input]]:h-12 **:[[cmdk-input]]:bg-transparent **:[[cmdk-input-wrapper]]:border-foreground/10">
            <CommandInput placeholder="Type a command or search your threads…" />
            <CommandList className="px-1 py-1">
              <CommandEmpty className="py-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
                No results
              </CommandEmpty>
              <CommandGroup>
                <CommandItem className="gap-2.5 rounded-md text-[12px] data-[selected=true]:bg-foreground/6">
                  <Plus className="h-3.5 w-3.5 opacity-70" /> New chat <CommandShortcut className="font-mono text-[9px] tracking-[0.18em] opacity-50">⌘N</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator className="my-1 bg-foreground/10" />
              <CommandGroup heading="Chat" className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-mono **:[[cmdk-group-heading]]:text-[9px] **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.22em] **:[[cmdk-group-heading]]:opacity-50">
                <CommandItem className="gap-2.5 rounded-md text-[12px] data-[selected=true]:bg-foreground/6">
                  <History className="h-3.5 w-3.5 opacity-70" /> Manage chat history
                </CommandItem>
                <CommandItem className="gap-2.5 rounded-md text-[12px] data-[selected=true]:bg-foreground/6">
                  <Cpu className="h-3.5 w-3.5 opacity-70" /> View all available models
                </CommandItem>
                <CommandItem className="gap-2.5 rounded-md text-[12px] data-[selected=true]:bg-foreground/6">
                  <Paperclip className="h-3.5 w-3.5 opacity-70" /> View all uploaded attachments
                </CommandItem>
              </CommandGroup>
              <CommandSeparator className="my-1 bg-foreground/10" />
              <CommandGroup heading="Profiles" className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-mono **:[[cmdk-group-heading]]:text-[9px] **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.22em] **:[[cmdk-group-heading]]:opacity-50">
                <CommandItem className="gap-2.5 rounded-md text-[12px] data-[selected=true]:bg-foreground/6">
                  <Check className="h-3.5 w-3.5 accent-text" /> Default
                </CommandItem>
                <CommandItem className="gap-2.5 rounded-md text-[12px] data-[selected=true]:bg-foreground/6">
                  <Plus className="h-3.5 w-3.5 opacity-70" /> Create new profile
                </CommandItem>
              </CommandGroup>
            </CommandList>
            <div className="flex items-center justify-between gap-2 border-t border-foreground/10 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] opacity-50">
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="h-1 w-1 rounded-full bg-foreground/50" />
                <span>Search</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-sm border border-foreground/15 bg-foreground/4 px-1.5 py-px">↵</kbd>
                <span className="normal-case tracking-normal">open</span>
              </span>
            </div>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── StatusTicker — cycling status with per-char letter swap ───────── */

const STATUS_STATES = ["ready", "listening", "drafting", "thinking", "composing"] as const;
type StatusState = (typeof STATUS_STATES)[number];

/* fixed-width 4-char codes — eliminates layout shift entirely */
const STATUS_CODE: Record<StatusState, string> = {
  ready: "RDY·",
  listening: "LSTN",
  drafting: "DRFT",
  thinking: "THNK",
  composing: "CMPS",
};

/* expanded labels for aria + tooltip — visual code stays fixed-width */
const STATUS_LABEL: Record<StatusState, { name: string; desc: string }> = {
  ready:     { name: "Ready",     desc: "Idle · awaiting input" },
  listening: { name: "Listening", desc: "Capturing voice input" },
  drafting:  { name: "Drafting",  desc: "You're typing a prompt" },
  thinking:  { name: "Thinking",  desc: "Reasoning over context" },
  composing: { name: "Composing", desc: "Streaming response" },
};

/* Single shared waveform + per-state intensity/opacity.
   Keeping `duration` constant across states means the bars never restart
   their timeline when state changes — only amplitude/opacity tween. */
const WAVE_DURATION = 1.6;
const WAVE_HEIGHTS = [0.40, 0.75, 0.95, 0.70, 0.45];

const PROFILES: Record<StatusState, { intensity: number; opacity: number }> = {
  ready:     { intensity: 0.28, opacity: 0.35 },
  listening: { intensity: 0.55, opacity: 0.55 },
  drafting:  { intensity: 0.50, opacity: 0.60 },
  thinking:  { intensity: 0.80, opacity: 0.75 },
  composing: { intensity: 1.00, opacity: 0.90 },
};

function DepthMeter({ state }: { state: StatusState }) {
  const profile = PROFILES[state];
  return (
    // Wrapper tweens amplitude + opacity smoothly when state changes —
    // no keyframe restart, no timing jump.
    <motion.span
      className="flex h-2.5 items-end gap-[2px] origin-bottom"
      style={{translate:"0px -2px"}}
      animate={{ scaleY: profile.intensity, opacity: profile.opacity }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      {WAVE_HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className="block h-full w-[2px] rounded-[1px] origin-bottom"
          style={{ background: "var(--lumen-accent)" }}
          animate={{ scaleY: [h * 0.35, h, h * 0.5, h * 0.85, h * 0.3, h * 0.35] }}
          transition={{
            duration: WAVE_DURATION,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * (WAVE_DURATION / 14),
          }}
        />
      ))}
    </motion.span>
  );
}

function StatusTicker() {
  const { value, streaming, listening } = useComposer();
  const word: StatusState = streaming
    ? "composing"
    : listening
    ? "listening"
    : value.trim().length > 0
    ? "drafting"
    : "ready";
  const code = STATUS_CODE[word];
  const label = STATUS_LABEL[word];
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className="relative inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] opacity-70"
      role="status"
      aria-live="polite"
      aria-label={`Status: ${label.name} — ${label.desc}`}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <DepthMeter state={word} />
      {/* fixed 4ch box — no layout shift, ever */}
      <span
        className="relative inline-flex justify-end overflow-hidden tabular-nums"
        style={{ height: "1em", width: "5.5ch" }}
        aria-hidden
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={code}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block whitespace-nowrap leading-none"
          >
            {code}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* tooltip — appears on hover/focus, doesn't affect layout */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-foreground/10 bg-background/95 px-2.5 py-1.5 text-[10px] normal-case tracking-normal text-foreground shadow-md backdrop-blur"
            role="tooltip"
          >
            <span className="font-mono uppercase tracking-[0.18em] opacity-60">{code}</span>
            <span className="mx-1.5 opacity-30">·</span>
            <span className="font-medium">{label.name}</span>
            <span className="ml-1.5 opacity-60">{label.desc}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ───────── SessionMark — left-side crafted mono mark with ticking clock ───────── */
function SessionMark() {
  const [clock, setClock] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const [hh = "--", mm = "--", ss = "--"] = (clock ?? "--:--:--").split(":");
  return (
    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
      <span>S·04A</span>
      <span aria-hidden className="h-px w-8 bg-foreground/30" />
      <span className="tabular-nums">
        {hh}:{mm}
        <span className="opacity-50">:{ss}</span>
      </span>
    </span>
  );
}


/* ───────── composer fragments (greeting + input + controls) ───────── */


function Greeting({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <h1 className="text-center text-[36px] font-light leading-none tracking-tight md:text-[52px]">
        what&rsquo;s on your mind,
        <br />
        Emma?
      </h1>
    </div>
  );
}


/* helper — replace composer text from chips (interruptible exit + reveal) */
let fillGeneration = 0;
const FILL_EXIT_MS = 160;

function fillDuration(text: string) {
  return Math.min(480, 280 + text.length * 2.2);
}

function streamText(text: string) {
  const gen = ++fillGeneration;
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    composerStore.setValue(text);
    composerStore.setStreaming(false);
    return;
  }

  composerStore.setStreaming(true);
  composerStore.setValue(text);
  composerStore.bumpFillEpoch();

  window.setTimeout(() => {
    if (gen !== fillGeneration) return;
    composerStore.setStreaming(false);
  }, FILL_EXIT_MS + fillDuration(text));
}

function InputBlock({
  ctx,
  rows = 3,
  onSubmit,
}: {
  ctx: Ctx;
  rows?: number;
  onSubmit?: (prompt: string) => void;
}) {
  const { value, streaming, fillEpoch } = useComposer();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLTextAreaElement>(null);
  const isFilling = streaming && fillEpoch > 0;
  const fillMs = value ? fillDuration(value) : 380;

  useEffect(() => {
    const unsub = promptBus.subscribe((text) => {
      ref.current?.focus();
      streamText(text);
    });
    return () => { unsub(); };
  }, []);

  return (
    <motion.div layout className="relative">
      <AttachmentStrip />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          layout
          key={fillEpoch}
          className="relative"
          initial={
            reducedMotion || !isFilling
              ? false
              : {
                  opacity: 0,
                  y: 7,
                  filter: "blur(6px)",
                  clipPath: "inset(0 100% 0 0)",
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            clipPath: "inset(0 0% 0 0)",
          }}
          exit={
            reducedMotion
              ? { opacity: 0, transition: { duration: 0.08 } }
              : {
                  opacity: 0,
                  y: -5,
                  filter: "blur(5px)",
                  clipPath: "inset(0 0 0 100%)",
                  transition: {
                    duration: FILL_EXIT_MS / 1000,
                    ease: [0.4, 0, 1, 1],
                  },
                }
          }
          transition={{
            duration: reducedMotion ? 0 : fillMs / 1000,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <textarea
            ref={ref}
            autoFocus={isFilling}
            rows={rows}
            value={value}
            onChange={(e) => {
              fillGeneration++;
              composerStore.setStreaming(false);
              composerStore.setValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                const v = composerStore.get().value.trim();
                if (v.length > 0 && !composerStore.get().streaming) {
                  e.preventDefault();
                  composerStore.setValue("");
                  onSubmit?.(v);
                }
              }
            }}
            placeholder="Type a prompt …"
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed placeholder:opacity-40 focus:outline-none caret-foreground/70"
            style={{
              color: "inherit",
              caretColor: isFilling && value ? "transparent" : undefined,
            }}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────── AttachmentStrip — animated chips above the input ───────── */
function AttachmentStrip() {
  const items = useAttachments();
  return (
    <AnimatePresence initial={false}>
      {items.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <LayoutGroup id="att-strip">
            <div className="flex flex-wrap gap-1.5 pb-2">
              <AnimatePresence initial={false}>
                {items.map((a) => (
                  <motion.span
                    layout
                    key={a.id}
                    initial={{ opacity: 0, y: -6, scale: 0.85, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.7, filter: "blur(4px)", transition: { duration: 0.18 } }}
                    transition={{ type: "spring", stiffness: 480, damping: 28, mass: 0.5 }}
                    className="group/chip relative inline-flex max-w-[220px] items-center gap-1.5 overflow-hidden rounded-full border border-border/60 bg-foreground/4 py-1 pl-2 pr-1 text-[10.5px] backdrop-blur-sm"
                  >
                    {/* scan shimmer */}
                    <motion.span
                      aria-hidden
                      initial={{ x: "-120%" }}
                      animate={{ x: "120%" }}
                      transition={{ duration: 1.6, ease: "easeInOut", repeat: 0 }}
                      className="pointer-events-none absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-foreground/10 to-transparent"
                    />
                    <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground/80">
                      {kindIcon(a.kind)}
                    </span>
                    <span className="relative min-w-0 truncate font-mono tracking-tight text-foreground/85">{a.name}</span>
                    {a.meta && (
                      <span className="relative shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] opacity-50">
                        {a.meta}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => attachmentsStore.remove(a.id)}
                      aria-label="Remove attachment"
                      className="relative ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-foreground/50 transition hover:bg-foreground/10 hover:text-foreground"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────── SendButton — disabled when empty; "launch" interaction on send ───────── */
function SendButton({ ctx, onSubmit }: { ctx: Ctx; onSubmit?: (prompt: string) => void }) {
  const { value, streaming } = useComposer();
  const [sent, setSent] = useState(false);
  const disabled = streaming || sent || value.trim().length === 0;

  const onSend = () => {
    if (disabled) return;
    const prompt = composerStore.get().value.trim();
    setSent(true);
    if (onSubmit) {
      composerStore.setValue("");
      onSubmit(prompt);
    }
    window.setTimeout(() => {
      if (!onSubmit) composerStore.setValue("");
      setSent(false);
    }, 720);
  };

  return (
    <HoverTip label={disabled && !sent ? "Type to send" : sent ? "Sent" : "Send"} keys="↵">
      <motion.button
        type="button"
        onClick={onSend}
        disabled={disabled}
        aria-label="Send"
        whileHover={disabled ? undefined : { scale: 1.04 }}
        whileTap={disabled ? undefined : { scale: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={`${ctx.btn} relative flex h-9 w-9 items-center justify-center overflow-visible transition-opacity ${
          disabled && !sent ? "cursor-default opacity-50" : "cursor-pointer opacity-100"
        }`}
        style={{ color: disabled && !sent ? undefined : "var(--lumen-accent)" }}
      >

        {/* aura on send — matches button radius */}
        <AnimatePresence>
          {sent && (
            <motion.span
              key="aura"
              aria-hidden
              initial={{ scale: 1, opacity: 0.55 }}
              animate={{ scale: 1.9, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-[inherit] border"
              style={{ borderColor: "color-mix(in srgb, var(--lumen-accent) 55%, transparent)" }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.span
              key="check"
              initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 22 }}
              className="inline-flex"
            >
              <Check className="h-4 w-4" strokeWidth={2.6} />
            </motion.span>
          ) : (
            <motion.span
              key="arrow"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -22, opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 26 }}
              className="inline-flex"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </HoverTip>
  );
}

/* ───────── DictateButton — pulsing rings + animated waveform when listening ───────── */
function DictateButton({ ctx }: { ctx: Ctx }) {
  const { listening } = useComposer();
  const toggle = () => composerStore.setListening(!listening);

  return (
    <HoverTip label={listening ? "Listening — tap to stop" : "Dictate"} keys="⌘⇧V">
      <motion.button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        aria-label={listening ? "Stop dictation" : "Start dictation"}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={`${ctx.btn} relative flex h-9 w-9 items-center justify-center overflow-visible`}

      >
        {/* pulsing rings while listening — match button radius, smoother */}
        <AnimatePresence>
          {listening && (
            <>
              <motion.span
                key="ring1"
                aria-hidden
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-[inherit] border border-rose-500/55"
              />
              <motion.span
                key="ring2"
                aria-hidden
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.9], opacity: [0.35, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
                className="absolute inset-0 rounded-[inherit] border border-rose-500/35"
              />
            </>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {listening ? (
            // mic morphs into a live mini waveform (4 gently dancing bars)
            <motion.span
              key="wave"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 24 }}
              className="flex h-4 items-center gap-[2px]"
              aria-hidden
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="block w-[2px] rounded-[1px] bg-rose-500/85 origin-center"
                  style={{ height: "100%" }}
                  animate={{ scaleY: [0.4, 0.85, 0.55, 0.95, 0.45] }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.18,
                  }}
                />
              ))}
            </motion.span>
          ) : (
            <motion.span
              key="mic"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 24 }}
              className="inline-flex"
            >
              <Mic className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </HoverTip>
  );
}


/* ───────── AttachButton — popover "switchboard" for sources ───────── */
function AttachButton({ ctx }: { ctx: Ctx }) {
  const items = useAttachments();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "url" | "text">("menu");
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const ingest = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) =>
      attachmentsStore.add({ kind: kindFromFile(f), name: f.name, meta: prettyBytes(f.size) }),
    );
  };

  const captureScreen = async () => {
    const md = (navigator as any).mediaDevices;
    if (!md?.getDisplayMedia) {
      attachmentsStore.add({ kind: "image", name: "screen-capture.png", meta: "screen" });
      return;
    }
    try {
      const stream: MediaStream = await md.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement("canvas");
      canvas.width = settings.width || video.videoWidth;
      canvas.height = settings.height || video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      track.stop();
      const size = `${canvas.width}×${canvas.height}`;
      attachmentsStore.add({ kind: "image", name: `screen-${Date.now().toString(36)}.png`, meta: size });
    } catch {
      /* user cancelled */
    }
  };

  const sources = [
    { id: "upload", label: "Upload", glyph: <Upload className="h-3.5 w-3.5" />, hint: "From device",
      onClick: () => fileRef.current?.click() },
    { id: "screen", label: "Screen", glyph: <MonitorUp className="h-3.5 w-3.5" />, hint: "Capture region",
      onClick: () => { void captureScreen(); } },
    { id: "url",    label: "Link",   glyph: <Link2 className="h-3.5 w-3.5" />, hint: "Paste a URL",
      onClick: () => setMode("url") },
    { id: "text",   label: "Snippet",glyph: <ClipboardPaste className="h-3.5 w-3.5" />, hint: "Paste text",
      onClick: () => setMode("text") },
  ];

  const close = () => { setOpen(false); setMode("menu"); setUrlValue(""); setTextValue(""); };

  return (
    <div className="relative">
      <input ref={fileRef} type="file" multiple hidden onChange={(e) => { ingest(e.target.files); e.target.value = ""; }} />
      <input ref={imageRef} type="file" accept="image/*" multiple hidden onChange={(e) => { ingest(e.target.files); e.target.value = ""; }} />

      <HoverTip label="Attach" keys="⌘U">
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Attach"
          aria-expanded={open}
          whileTap={{ scale: 0.92 }}
          transition={SPRING_TURN}
          className={`${ctx.btn} relative flex h-9 w-9 items-center justify-center`}
        >
          <Paperclip className="h-4 w-4" />
          {items.length > 0 && (
            <motion.span
              key={items.length}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={SPRING_POP}
              className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-foreground px-1 font-mono text-[8px] font-semibold leading-none text-background"
            >
              {items.length}
            </motion.span>
          )}
        </motion.button>
      </HoverTip>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onMouseDown={close} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.55 }}
              style={{ transformOrigin: "bottom left" }}
              className={`${ctx.panel} absolute bottom-full left-0 z-50 mb-2 w-[280px] overflow-hidden p-1`}
            >
              <div className={`${ctx.panelInner} relative overflow-hidden`}>
                <div className="relative flex items-center justify-between border-b border-border/40 px-3 py-2">
                  <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] opacity-70">
                    <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-foreground/60" />
                    Attach
                  </span>
                  <span className="font-mono text-[9px] tabular-nums uppercase tracking-[0.18em] opacity-45">
                    {String(items.length).padStart(2, "0")} queued
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {mode === "menu" && (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.18 }}
                      className="grid grid-cols-2 gap-1 p-1.5"
                    >
                      {sources.map((s, i) => (
                        <motion.button
                          key={s.id}
                          type="button"
                          onClick={() => { s.onClick(); if (s.id === "upload" || s.id === "screen") close(); }}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.04 + i * 0.04, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          className="group/src relative flex flex-col items-start gap-1 overflow-hidden rounded-md border border-border/40 bg-foreground/2 p-2.5 text-left transition-colors hover:bg-foreground/6"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-foreground/85">
                            {s.glyph}
                          </span>
                          <span className="text-[11px] font-medium leading-tight text-foreground/90">{s.label}</span>
                          <span className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-55">{s.hint}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {mode === "url" && (
                    <motion.div
                      key="url"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 p-2.5"
                    >
                      <div className="flex items-center gap-2 rounded-md border border-border/50 bg-foreground/3 px-2">
                        <Link2 className="h-3.5 w-3.5 opacity-60" />
                        <input
                          autoFocus
                          value={urlValue}
                          onChange={(e) => setUrlValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && urlValue.trim()) {
                              try {
                                const u = new URL(urlValue.trim());
                                attachmentsStore.add({ kind: "url", name: u.hostname + u.pathname, meta: u.protocol.replace(":", "") });
                                close();
                              } catch {
                                attachmentsStore.add({ kind: "url", name: urlValue.trim(), meta: "link" });
                                close();
                              }
                            }
                          }}
                          placeholder="https://…"
                          className="flex-1 bg-transparent py-2 text-[11px] placeholder:opacity-40 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] opacity-55">
                        <button onClick={() => setMode("menu")} className="hover:opacity-100">← back</button>
                        <span>↵ to attach</span>
                      </div>
                    </motion.div>
                  )}

                  {mode === "text" && (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 p-2.5"
                    >
                      <textarea
                        autoFocus
                        rows={3}
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        placeholder="Paste a snippet…"
                        className="w-full resize-none rounded-md border border-border/50 bg-foreground/3 px-2 py-1.5 text-[11px] placeholder:opacity-40 focus:outline-none"
                      />
                      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] opacity-55">
                        <button onClick={() => setMode("menu")} className="hover:opacity-100">← back</button>
                        <button
                          onClick={() => {
                            const t = textValue.trim();
                            if (!t) return;
                            const first = t.split(/\s+/).slice(0, 4).join(" ");
                            attachmentsStore.add({ kind: "text", name: first || "snippet", meta: `${t.length} ch` });
                            close();
                          }}
                          className="rounded border border-border/60 px-2 py-0.5 hover:bg-foreground/10"
                        >
                          attach
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── ToolsButton — tools + connectors with live toggle ───────── */
function ToolsButton({ ctx }: { ctx: Ctx }) {
  const { tools, conns } = useTools();
  const [open, setOpen] = useState(false);
  const activeCount = tools.size + conns.size;

  return (
    <div className="relative">
      <HoverTip label="Tools & Connectors" keys="⌘T">
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Tools and Connectors"
          aria-expanded={open}
          whileTap={{ scale: 0.92 }}
          transition={SPRING_TURN}
          className={`${ctx.btn} relative flex h-9 w-9 items-center justify-center`}
        >
          <Wrench className="h-4 w-4" />
          {activeCount > 0 && (
            <motion.span
              key={activeCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={SPRING_POP}
              className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-(--lumen-accent) px-1 font-mono text-[8px] font-semibold leading-none text-background"
            >
              {activeCount}
            </motion.span>
          )}
        </motion.button>
      </HoverTip>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onMouseDown={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.55 }}
              style={{ transformOrigin: "bottom left" }}
              className={`${ctx.panel} absolute bottom-full left-0 z-50 mb-2 flex max-h-[min(70vh,460px)] w-[320px] flex-col overflow-hidden p-1`}
            >
              <div className={`${ctx.panelInner} relative flex min-h-0 flex-1 flex-col overflow-y-auto`}>
                {/* header */}
                <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
                  <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] opacity-70">
                    <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-foreground/60" />
                    Capabilities
                  </span>
                  <span className="font-mono text-[9px] tabular-nums uppercase tracking-[0.18em] opacity-45">
                    {String(activeCount).padStart(2, "0")} on
                  </span>
                </div>

                {/* Tools */}
                <div className="px-2 pb-1 pt-2">
                  <div className="mb-1 flex items-center gap-1.5 px-1 font-mono text-[9px] uppercase tracking-[0.2em] opacity-50">
                    <span>Tools</span>
                    <span className="h-px flex-1 bg-border/40" />
                  </div>
                  <div className="space-y-0.5">
                    {TOOL_DEFS.map((t, i) => {
                      const on = tools.has(t.id);
                      const Icon = t.icon;
                      return (
                        <motion.button
                          key={t.id}
                          type="button"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.04 + i * 0.03, duration: 0.22 }}
                          onClick={() => toolsStore.toggleTool(t.id)}
                          aria-pressed={on}
                          className="group/tool relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-foreground/5"
                        >
                          <motion.span
                            animate={{
                              backgroundColor: on ? "rgba(16,185,129,0.18)" : "rgba(127,127,127,0.10)",
                              color: on ? "rgb(16,185,129)" : "var(--muted-foreground)",
                            }}
                            transition={{ duration: 0.2 }}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </motion.span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="text-[11px] leading-tight text-foreground/90">{t.label}</span>
                            <span className="truncate text-[10px] leading-tight opacity-55">{t.desc}</span>
                          </span>
                          {/* mini toggle dot */}
                          <span className={`relative h-3.5 w-6 shrink-0 rounded-full transition-colors ${on ? "bg-(--lumen-accent)" : "bg-foreground/15"}`}>
                            <motion.span
                              animate={{ x: on ? 12 : 2 }}
                              transition={{ type: "spring", stiffness: 520, damping: 30 }}
                              className="absolute top-0.5 inline-block h-2.5 w-2.5 rounded-full bg-background shadow"
                            />
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Connectors — compact icon-card grid */}
                <div className="border-t border-border/40 px-2 pb-2 pt-2">
                  <div className="mb-1.5 flex items-center gap-1.5 px-1 font-mono text-[9px] uppercase tracking-[0.2em] opacity-50">
                    <span>Connectors</span>
                    <span className="h-px flex-1 bg-border/40" />
                    <span className="tabular-nums opacity-70">{conns.size}/{CONN_DEFS.length}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {CONN_DEFS.map((c, i) => {
                      const on = conns.has(c.id);
                      const linked = c.status === "linked";
                      const Icon = c.icon;
                      return (
                        <motion.button
                          key={c.id}
                          type="button"
                          title={c.label}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.04 + i * 0.025, duration: 0.22 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => { if (linked) toolsStore.toggleConn(c.id); }}
                          aria-pressed={on}
                          aria-label={c.label}
                          className={`${ctx.light ? "btn-mech-light" : "btn-mech"} relative flex aspect-square w-full items-center justify-center ${on ? "ring-1 ring-(--lumen-accent)" : ""}`}
                        >
                          <Icon className={`h-3.5 w-3.5 transition-colors ${on ? "accent-text" : ""}`} />
                          {on && (
                            <motion.span
                              aria-hidden
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute right-1 top-1 h-1 w-1 rounded-full bg-(--lumen-accent)"
                            />
                          )}
                          {!linked && (
                            <span
                              aria-hidden
                              className="absolute right-0.5 top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-500 text-[7px] font-bold leading-none text-white"
                            >
                              !
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* footer */}
                <div className="flex items-center justify-between border-t border-border/40 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] opacity-45">
                  <span className="flex items-center gap-1">
                    <Plug className="h-2.5 w-2.5" />
                    <span>tap to toggle</span>
                  </span>
                  <span className="tabular-nums">{String(activeCount).padStart(2, "0")} active</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


function PrimaryRow({ ctx, onSubmit }: { ctx: Ctx; onSubmit?: (prompt: string) => void }) {
  const [model, setModel] = useState<(typeof MODEL_OPTIONS)[number]>("Lumen 4");
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <AttachButton ctx={ctx} />
      <ToolsButton ctx={ctx} />
      <FancyPicker
        ctx={ctx} label="Model" value={model} compact
        className="min-w-0 flex-1 sm:flex-none"
        onChange={(v) => setModel(v as (typeof MODEL_OPTIONS)[number])}
        options={MODEL_OPTIONS.map((id, i) => ({
          id,
          glyph: <ModelGlyph index={i} />,
          desc:
            id === "Lumen 4 Mini" ? "Fastest, lightest tier — quick chats."
            : id === "Lumen 4" ? "Balanced default — good for most tasks."
            : "Highest reasoning tier — slower, deeper.",
        }))}
      />
      {/* desktop spacer pushes the action buttons to the right; on mobile the model picker fills instead */}
      <div className="hidden flex-1 sm:block" />
      <DictateButton ctx={ctx} />
      <SendButton ctx={ctx} onSubmit={onSubmit} />
    </div>
  );
}

function SecondaryRow({ ctx, vertical = false }: { ctx: Ctx; vertical?: boolean }) {
  const [style, setStyle] = useState("Auto");
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const selectors = (
    <>
      <FancyPicker
        ctx={ctx} label="Style" value={style} onChange={setStyle}
        options={STYLE_OPTIONS.map((id, i) => {
          const descs: Record<string, string> = {
            Auto: "Lumen picks the best tone automatically.",
            Formal: "Polished, professional phrasing.",
            Friendly: "Warm, conversational tone.",
            Concise: "Trim filler — fewer words.",
            Creative: "Vivid, playful, unexpected angles.",
          };
          return { id, glyph: <StyleGlyph index={i} />, desc: descs[id] };
        })}
      />
      <CycleButton
        ctx={ctx} label="Length" value={length} onChange={setLength}
        options={["Short", "Balanced", "Long"] as const}
        glyph={(i) => <LengthGlyph index={i} />}
      />
      <CycleButton
        ctx={ctx} label="Depth" value={depth} onChange={setDepth}
        options={["Quick", "Standard", "Deep"] as const}
        glyph={(i) => <DepthGlyph index={i} />}
        descriptions={{
          Quick: "Fast surface-level answer with minimal reasoning.",
          Standard: "Balanced analysis — the default reasoning depth.",
          Deep: "Slower, multi-step reasoning for harder problems.",
        }}
      />
    </>
  );
  const toggles = (
    <>
      <TogglePill
        ctx={ctx} on={memory} onClick={() => setMemory(!memory)} size={36}
        label={memory ? "Memory · on" : "Memory · off"}
        desc="Remember details about you across conversations and use them to personalize replies."
        icon={<Brain className="h-3.5 w-3.5" />}
        hideTipOnClick
      />
      <TogglePill
        ctx={ctx} on={web} onClick={() => setWeb(!web)} size={36}
        label={web ? "Web · on" : "Web · off"}
        desc="Let the model search the live web for fresh information and cite sources."
        icon={<Globe className="h-3.5 w-3.5" />}
        hideTipOnClick
      />
    </>
  );

  if (vertical) {
    return <div className="flex flex-col items-stretch gap-1.5">{selectors}{toggles}</div>;
  }

  // Two groups: selectors + toggles. On mobile they stack as two centered rows
  // (so Memory/Web sit together on their own centered row); on sm+ it's one row.
  return (
    <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:flex-wrap sm:justify-center">
      <div className="flex flex-wrap items-center justify-center gap-1.5">{selectors}</div>
      <div className="flex items-center justify-center gap-1.5">{toggles}</div>
    </div>
  );
}


function QuickChip({
  ctx, item, index,
}: { ctx: Ctx; item: typeof QUICK[number]; index: number }) {
  const [fired, setFired] = useState(false);

  const send = () => {
    if (fired) return;
    setFired(true);
    promptBus.emit(item.prompt);
    window.setTimeout(() => setFired(false), 520);
  };

  return (
    <motion.button
      onClick={send}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`group/chip ${ctx.btn} relative flex items-center gap-2 overflow-hidden px-3.5 py-2 text-[11px]`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 bg-linear-to-r from-transparent via-foreground/6 to-transparent transition-transform duration-700 ease-out group-hover/chip:translate-x-[400%]"
      />
      <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {fired ? (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={SPRING_POP}
              className="absolute inset-0 inline-flex items-center justify-center accent-text"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="icon"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={SPRING_POP}
              className="absolute inset-0 inline-flex items-center justify-center"
            >
              <item.icon className="h-3.5 w-3.5 opacity-70" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span>{item.label}</span>
      <span className="inline-flex w-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover/chip:w-3 group-hover/chip:opacity-60">
        <ArrowRight className="h-3 w-3" />
      </span>
    </motion.button>
  );
}

function QuickChips({ ctx, limit = 8 }: { ctx: Ctx; limit?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {QUICK.slice(0, limit).map((a, i) => (
        <QuickChip key={a.label} ctx={ctx} item={a} index={i} />
      ))}
    </div>
  );
}


/* ───────────────────────── PreferencesButton + Panel ───────────────────────── */

function PreferencesButton({ ctx }: { ctx: Ctx }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<PreferencesSource>("Preferences");
  const settings = useSettings();

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: PreferencesSource }>).detail;
      setSource(detail?.source ?? "Preferences");
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        setSource("Preferences");
        setOpen((value) => !value);
      }
    };
    window.addEventListener("layout:open-preferences", onOpen as EventListener);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("layout:open-preferences", onOpen as EventListener);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="relative">
      <HoverTip label="Preferences" keys="⌘," align="end">
        <motion.button
          onClick={() => {
            setSource("Preferences");
            setOpen((o) => !o);
          }}
          aria-label="Preferences"
          aria-expanded={open}
          whileTap={{ scale: 0.92 }}
          transition={SPRING_TURN}
          className={`${ctx.btn} flex h-8 w-8 items-center justify-center`}
        >
          <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={2} />
        </motion.button>
      </HoverTip>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onMouseDown={() => setOpen(false)} />
            {/* mobile: pinned to the top-right of the viewport so it can't clip; sm+: anchored under the button */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.55 }}
              style={{ transformOrigin: "top right" }}
              className={`${ctx.panel} fixed right-3 top-14 z-50 w-[min(360px,calc(100vw_-_1.5rem))] overflow-hidden p-1 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[360px]`}
            >
              <PreferencesPanel ctx={ctx} settings={settings} title={source} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PreferencesPanel({ ctx, settings, title = "Preferences" }: {
  ctx: Ctx;
  settings: Settings;
  title?: PreferencesSource;
}) {
  return (
    <div className={`${ctx.panelInner} flex max-h-[min(80vh,640px)] flex-col overflow-y-auto`}>
      {/* header */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] opacity-70">
          <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-foreground/60" />
          {title}
        </span>
        <button
          onClick={() => settingsStore.reset()}
          className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-50 transition-opacity hover:opacity-90"
        >
          Reset
        </button>
      </div>

      {/* Mode (light / dark) segmented */}
      <SectionHeader label="Mode" />
      <div className="px-3 pb-2">
        <div className="relative grid grid-cols-2 gap-1 rounded-md border border-foreground/10 bg-foreground/3 p-1">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark",  label: "Dark",  icon: Moon },
          ].map((m) => {
            const active = (m.id === "light") === settings.light;
            return (
              <button
                key={m.id}
                onClick={() => settingsStore.set("light", m.id === "light")}
                className={`relative flex items-center justify-center gap-1.5 rounded-[5px] py-1.5 text-[11px] transition-colors ${
                  active ? "text-foreground" : "text-foreground/55 hover:text-foreground/80"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mode-active"
                    className="absolute inset-0 rounded-[5px]"
                    style={{ background: "color-mix(in srgb, var(--lumen-accent) 18%, transparent)" }}
                    transition={{ type: "spring", stiffness: 480, damping: 32 }}
                  />
                )}
                <m.icon className="relative h-3 w-3" />
                <span className="relative">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme presets */}
      <SectionHeader label="Theme" />
      <div className="grid grid-cols-2 gap-1.5 px-3 pb-2">
        {THEME_PRESETS.map((p) => {
          const active = settings.themeId === p.id;
          const mode = settings.light ? p.light : p.dark;
          return (
            <motion.button
              key={p.id}
              onClick={() => settingsStore.set("themeId", p.id)}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_TURN}
              className={`group relative overflow-hidden rounded-md border p-2 text-left transition-all ${
                active
                  ? "accent-soft"
                  : "border-foreground/10 hover:border-foreground/25"
              }`}
              aria-pressed={active}
            >
              <div
                className="mb-1.5 h-7 w-full overflow-hidden rounded-sm border border-foreground/10"
                style={{ background: `linear-gradient(110deg, ${mode.bg} 0%, ${mode.bg} 52%, ${mode.panel} 52%, ${mode.panel} 64%, ${mode.accent} 64%, ${mode.accent} 100%)` }}
              />
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[10.5px] font-medium leading-none text-foreground">{p.name}</span>
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={SPRING_POP}
                    className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full accent-solid"
                  >
                    <Check className="h-2 w-2" strokeWidth={3} />
                  </motion.span>
                )}
              </div>
              <span className="mt-0.5 block truncate text-[9px] leading-tight opacity-55">{p.tagline}</span>
            </motion.button>
          );
        })}
      </div>

      <AccentCustomSection settings={settings} />

      {/* Button style picker — bigger previews, inner span when needed */}
      <SectionHeader label="Button style" right={<span className="font-mono text-[9px] tabular-nums opacity-50">10</span>} />
      <div className="grid grid-cols-2 gap-1.5 px-3 pb-3">
        {BUTTON_STYLES.map((s) => {
          const active = settings.buttonStyleId === s.id;
          const cls = settings.light ? s.lightClass : s.darkClass;
          return (
            <button
              key={s.id}
              onClick={() => settingsStore.set("buttonStyleId", s.id)}
              aria-pressed={active}
              className={`group relative flex items-center gap-2.5 rounded-md border p-2 pr-2 text-left transition-all ${
                active
                  ? "accent-soft"
                  : "border-foreground/10 hover:border-foreground/25"
              }`}
            >
              <span className={`${cls} flex h-9 w-12 shrink-0 items-center justify-center text-[11px] font-medium leading-none`}>
                Aa
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-[11px] text-foreground">{s.name}</span>
                <span className="truncate font-mono text-[9px] opacity-50">{s.id}</span>
              </span>
              {active && (
                <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full accent-solid">
                  <Check className="h-2 w-2" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-foreground/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] opacity-50">
        <span>auto-saved</span>
        {/* <Link to="/connectors" className="underline-offset-4 hover:underline">connectors lab →</Link> */}
      </div>
    </div>
  );
}

function AccentCustomSection({ settings }: { settings: Settings }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const accent = accentHsl(settings.hue, settings.saturation, settings.lightness);

  const applySwatch = (swatch: (typeof ACCENT_SWATCHES)[number]) => {
    settingsStore.set("hue", swatch.hue);
    settingsStore.set("saturation", swatch.saturation);
    settingsStore.set("lightness", swatch.lightness);
  };

  return (
    <>
      <SectionHeader label="Accent · custom" right={
        <span
          className="h-3 w-3 shrink-0 rounded-full border border-foreground/15"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      } />
      <div className="space-y-2.5 px-3 pb-3">
        <div className="flex gap-1.5">
          {ACCENT_SWATCHES.map((swatch) => {
            const active = matchesAccentSwatch(settings, swatch);
            return (
              <button
                key={`${swatch.hue}-${swatch.saturation}-${swatch.lightness}`}
                type="button"
                onClick={() => applySwatch(swatch)}
                aria-label={`Accent ${accentHsl(swatch.hue, swatch.saturation, swatch.lightness)}`}
                aria-pressed={active}
                className={`h-6 flex-1 rounded-md border transition-all ${
                  active
                    ? "border-foreground/40 ring-1 ring-foreground/25"
                    : "border-foreground/10 hover:border-foreground/25"
                }`}
                style={{ backgroundColor: accentHsl(swatch.hue, swatch.saturation, swatch.lightness) }}
              />
            );
          })}
        </div>

        <SatLightField
          hue={settings.hue}
          saturation={settings.saturation}
          lightness={settings.lightness}
          onChange={(s, l) => {
            settingsStore.set("saturation", s);
            settingsStore.set("lightness", l);
          }}
        />

        <HueStrip
          hue={settings.hue}
          onChange={(h) => settingsStore.set("hue", h)}
        />

        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex w-full items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] opacity-50 transition-opacity hover:opacity-80"
          aria-expanded={advancedOpen}
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          Advanced
        </button>

        {advancedOpen && (
          <div className="space-y-2 border-t border-foreground/10 pt-2">
            <Slider label="Hue" min={0} max={360} value={settings.hue}
              onChange={(v) => settingsStore.set("hue", v)}
              track="linear-gradient(90deg, #ff5a5a, #ffd000, #5aff5a, #5addff, #5a5aff, #ff5aff, #ff5a5a)" />
            <Slider label="Saturation" min={0} max={100} value={settings.saturation}
              onChange={(v) => settingsStore.set("saturation", v)}
              track={`linear-gradient(90deg, hsl(${settings.hue} 0% ${settings.lightness}%), hsl(${settings.hue} 100% ${settings.lightness}%))`} />
            <Slider label="Lightness" min={ACCENT_LIGHTNESS_MIN} max={ACCENT_LIGHTNESS_MAX} value={settings.lightness}
              onChange={(v) => settingsStore.set("lightness", v)}
              track={`linear-gradient(90deg, hsl(${settings.hue} ${settings.saturation}% ${ACCENT_LIGHTNESS_MIN}%), hsl(${settings.hue} ${settings.saturation}% 50%), hsl(${settings.hue} ${settings.saturation}% ${ACCENT_LIGHTNESS_MAX}%))`} />
          </div>
        )}
      </div>
    </>
  );
}

function SatLightField({ hue, saturation, lightness, onChange }: {
  hue: number; saturation: number; lightness: number;
  onChange: (saturation: number, lightness: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const update = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    onChange(
      Math.round(x * 100),
      Math.round(ACCENT_LIGHTNESS_MAX - y * (ACCENT_LIGHTNESS_MAX - ACCENT_LIGHTNESS_MIN)),
    );
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    update(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    update(e.clientX, e.clientY);
  };

  const thumbX = `${saturation}%`;
  const thumbY = `${((ACCENT_LIGHTNESS_MAX - lightness) / (ACCENT_LIGHTNESS_MAX - ACCENT_LIGHTNESS_MIN)) * 100}%`;

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Saturation and lightness"
      aria-valuemin={ACCENT_LIGHTNESS_MIN}
      aria-valuemax={ACCENT_LIGHTNESS_MAX}
      aria-valuenow={lightness}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 10 : 2;
        if (e.key === "ArrowLeft")  { e.preventDefault(); onChange(Math.max(0, saturation - step), lightness); }
        if (e.key === "ArrowRight") { e.preventDefault(); onChange(Math.min(100, saturation + step), lightness); }
        if (e.key === "ArrowUp")    { e.preventDefault(); onChange(saturation, Math.min(ACCENT_LIGHTNESS_MAX, lightness + step)); }
        if (e.key === "ArrowDown")  { e.preventDefault(); onChange(saturation, Math.max(ACCENT_LIGHTNESS_MIN, lightness - step)); }
      }}
      className="relative h-[88px] cursor-crosshair touch-none overflow-hidden rounded-lg border border-foreground/10"
      style={{
        backgroundColor: accentHsl(hue, 100, 50),
        backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
        style={{ left: thumbX, top: thumbY, backgroundColor: accentHsl(hue, saturation, lightness) }}
      />
    </div>
  );
}

function HueStrip({ hue, onChange }: { hue: number; onChange: (hue: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const update = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(Math.round(x * 360));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    update(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    update(e.clientX);
  };

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={hue}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 15 : 3;
        if (e.key === "ArrowLeft")  { e.preventDefault(); onChange(Math.max(0, hue - step)); }
        if (e.key === "ArrowRight") { e.preventDefault(); onChange(Math.min(360, hue + step)); }
      }}
      className="relative h-3 cursor-ew-resize touch-none rounded-full border border-foreground/10"
      style={{ background: "linear-gradient(90deg, #ff5a5a, #ffd000, #5aff5a, #5addff, #5a5aff, #ff5aff, #ff5a5a)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-foreground/80 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
        style={{ left: `${(hue / 360) * 100}%` }}
      />
    </div>
  );
}

function SectionHeader({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 font-mono text-[9px] uppercase tracking-[0.2em] opacity-50">
      <span>{label}</span>
      <span className="h-px flex-1 bg-foreground/10" />
      {right}
    </div>
  );
}

function Slider({ label, min, max, value, onChange, track }: {
  label: string; min: number; max: number; value: number; onChange: (v: number) => void; track: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="opacity-70">{label}</span>
        <span className="font-mono tabular-nums opacity-50">{Math.round(value)}</span>
      </div>
      <div className="relative h-4">
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full border border-foreground/10"
          style={{ background: track }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="lumen-range absolute inset-0 w-full appearance-none bg-transparent"
          aria-label={label}
        />
      </div>
    </label>
  );
}

/* ───────────────────────── chrome ───────────────────────── */



function TopBar({
  ctx, sideOpen, onSide, onTemp, temp, chatControls = true,
}: {
  ctx: Ctx; sideOpen?: boolean; onSide?: () => void; onTemp: () => void; temp: boolean; chatControls?: boolean;
  right?: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K opens search palette + listen to in-menu search button
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    const onOpen = () => setSearchOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("layout:open-search", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("layout:open-search", onOpen as EventListener);
    };
  }, []);

  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-3 px-4">
      <LeftPill ctx={ctx} sideOpen={!!sideOpen} onSide={onSide} onSearch={() => setSearchOpen(true)} />
      <div />

      {/* right cluster — individual floating controls, no group panel */}
      <div className="flex items-center gap-1.5">
        {chatControls && (
          <TogglePill
            ctx={ctx}
            on={temp}
            onClick={onTemp}
            label={temp ? "Temporary chat · on" : "Temporary chat"}
            desc="Hide this conversation from history and memory. Nothing is saved."
            icon={temp ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            tipAlign="end"
          />
        )}
        <PreferencesButton ctx={ctx} />
        <Profile ctx={ctx} />
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} ctx={ctx} />
    </div>
  );
}


/* ───────────────────────── 10 layouts ───────────────────────── */

type LayoutFn = (ctx: Ctx) => ReactNode;

const LAYOUTS: { id: string; name: string; tagline: string; render: LayoutFn }[] = [
  {
    id: "01", name: "Centered Classic",
    tagline: "Top bar · centered composer · chips below",
    render: (ctx) => <Centered ctx={ctx} />,
  },
  {
    id: "02", name: "Sidebar + Stage",
    tagline: "Collapsible rail left · composer center",
    render: (ctx) => <SidebarStage ctx={ctx} />,
  },
  {
    id: "03", name: "Split Greeting",
    tagline: "Left greeting · right composer panel",
    render: (ctx) => <SplitGreeting ctx={ctx} />,
  },
  {
    id: "04", name: "Bottom Dock",
    tagline: "Greeting top · composer pinned bottom",
    render: (ctx) => <BottomDock ctx={ctx} />,
  },
  {
    id: "05", name: "Floating Island",
    tagline: "Compact card · everything in one tile",
    render: (ctx) => <FloatingIsland ctx={ctx} />,
  },
  {
    id: "06", name: "Mega Header",
    tagline: "Display header · composer beneath",
    render: (ctx) => <MegaHeader ctx={ctx} />,
  },
  {
    id: "07", name: "Right Tool Rail",
    tagline: "Secondary controls live in right rail",
    render: (ctx) => <RightToolRail ctx={ctx} />,
  },
  {
    id: "08", name: "Stacked Cards",
    tagline: "Each section is its own framed card",
    render: (ctx) => <StackedCards ctx={ctx} />,
  },
  {
    id: "09", name: "Chips Aside",
    tagline: "Composer left · suggestions in right column",
    render: (ctx) => <ChipsAside ctx={ctx} />,
  },
  {
    id: "10", name: "Minimal Console",
    tagline: "Bare composer · controls collapse to icons",
    render: (ctx) => <MinimalConsole ctx={ctx} />,
  },
  {
    id: "11", name: "Nested Tile",
    tagline: "Outer wrapper · inner prompt tile + control tile",
    render: (ctx) => <NestedTile ctx={ctx} />,
  },
  {
    id: "12", name: "Framed Console",
    tagline: "Parent frame · divided sections inside",
    render: (ctx) => <FramedConsole ctx={ctx} />,
  },
  {
    id: "13", name: "Tray + Strip",
    tagline: "Outer tray · prompt tile · controls strip",
    render: (ctx) => <TrayStrip ctx={ctx} />,
  },
];

/* 01 */
function Centered({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-[760px]">
            <Greeting className="text-center" />
            <div className={`${ctx.panel} mt-6 p-5`}>
              <InputBlock ctx={ctx} />
              <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
            </div>
            <div className={`${ctx.panel} mt-3 px-3 py-2`}>
              <SecondaryRow ctx={ctx} />
            </div>
            <div className="mt-10 flex justify-center"><QuickChips ctx={ctx} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* 02 */
function SidebarStage({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(!side)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col px-10 py-12">
          <Greeting />
          <div className={`${ctx.btn} mt-8 p-5`}>
            <InputBlock ctx={ctx} rows={4} />
            <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
            <div className="mt-3 border-t border-border/40 pt-3"><SecondaryRow ctx={ctx} /></div>
          </div>
          <div className="mt-10"><QuickChips ctx={ctx} /></div>
        </main>
      </div>
    </div>
  );
}

/* 03 */
function SplitGreeting({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="grid flex-1 grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 border-r border-border px-10 py-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">Composer · 03</p>
            <Greeting />
            <p className="max-w-sm text-sm opacity-60">A studio for thoughts. Pick a model, attach a file, dictate, or just type.</p>
            <QuickChips ctx={ctx} limit={4} />
          </div>
          <div className="flex flex-col justify-center px-8 py-12">
            <div className={`${ctx.btn} p-5`}>
              <InputBlock ctx={ctx} rows={5} />
              <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
            </div>
            <div className="mt-3"><SecondaryRow ctx={ctx} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* 04 */
function BottomDock({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col items-center justify-center px-6">
          <Greeting className="text-center" />
          <div className="mt-6 max-w-2xl text-center text-sm opacity-60">
            Ask anything. Compose below. Suggested starting points →
          </div>
          <div className="mt-10"><QuickChips ctx={ctx} /></div>
        </main>
        <div className="border-t border-border px-6 py-4">
          <div className="mx-auto flex max-w-[820px] flex-col gap-2">
            <div className={`${ctx.btn} p-4`}>
              <InputBlock ctx={ctx} rows={2} />
              <div className="mt-2"><PrimaryRow ctx={ctx} /></div>
            </div>
            <div className="flex justify-center"><SecondaryRow ctx={ctx} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 05 */
function FloatingIsland({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className={`${ctx.btn} w-full max-w-[680px] p-6`}>
            <Greeting className="text-center" />
            <div className="mt-5 border-t border-border/40 pt-4">
              <InputBlock ctx={ctx} rows={3} />
            </div>
            <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
            <div className="mt-3 border-t border-border/40 pt-3"><SecondaryRow ctx={ctx} /></div>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <QuickChips ctx={ctx} limit={6} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* 06 */
function MegaHeader({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border px-8 pb-10 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBtn ctx={ctx} onClick={() => setSide(!side)} size={8}><Menu className="h-3.5 w-3.5" /></IconBtn>
              <span className="font-mono text-[12px] uppercase tracking-[0.22em]">Lumen Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <Pill ctx={ctx} onClick={() => setTemp(!temp)}>
                <EyeOff className="h-3.5 w-3.5" /> {temp ? "Temp on" : "Temporary"}
              </Pill>
              <IconBtn ctx={ctx} size={8}><Settings className="h-3.5 w-3.5" /></IconBtn>
              <Profile ctx={ctx} />
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">Layout 06 · Display</p>
            <h1 className="mt-3 text-[56px] leading-none tracking-tight">
              What's on your mind, <span className="uppercase">Emma?</span>
            </h1>
          </div>
        </div>
        <main className="flex flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-[760px]">
            <div className={`${ctx.btn} p-5`}>
              <InputBlock ctx={ctx} rows={3} />
              <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
            </div>
            <div className="mt-3"><SecondaryRow ctx={ctx} /></div>
            <div className="mt-10"><QuickChips ctx={ctx} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* 07 */
function RightToolRail({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1">
          <div className="flex flex-1 flex-col justify-center px-10">
            <Greeting />
            <div className={`${ctx.btn} mt-6 p-5`}>
              <InputBlock ctx={ctx} rows={5} />
              <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
            </div>
            <div className="mt-10"><QuickChips ctx={ctx} limit={5} /></div>
          </div>
          <aside className="w-[240px] shrink-0 border-l border-border p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">Controls</p>
            <SecondaryRow ctx={ctx} vertical />
          </aside>
        </main>
      </div>
    </div>
  );
}

/* 08 */
function StackedCards({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col items-center gap-3 overflow-y-auto px-6 py-8">
          <div className="w-full max-w-[720px] space-y-3">
            <div className={`${ctx.btn} p-5`}><Greeting /></div>
            <div className={`${ctx.btn} p-5`}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">Prompt</p>
              <InputBlock ctx={ctx} rows={3} />
            </div>
            <div className={`${ctx.btn} p-3`}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">Tools</p>
              <PrimaryRow ctx={ctx} />
            </div>
            <div className={`${ctx.btn} p-3`}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">Options</p>
              <SecondaryRow ctx={ctx} />
            </div>
            <div className={`${ctx.btn} p-3`}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">Suggestions</p>
              <QuickChips ctx={ctx} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* 09 */
function ChipsAside({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="grid flex-1 grid-cols-1 gap-6 px-8 py-10 md:grid-cols-[1fr_260px]">
          <div className="flex flex-col">
            <Greeting />
            <div className={`${ctx.btn} mt-6 p-5`}>
              <InputBlock ctx={ctx} rows={5} />
              <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
            </div>
            <div className="mt-3"><SecondaryRow ctx={ctx} /></div>
          </div>
          <aside>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">Start with</p>
            <div className="flex flex-col gap-1.5">
              {QUICK.map((a) => (
                <button key={a.label} className={`${ctx.btn} flex items-center gap-2 px-3 py-2 text-[11px]`}>
                  <a.icon className="h-3.5 w-3.5" /> <span className="flex-1 text-left">{a.label}</span>
                  <ChevronRight className="h-3 w-3 opacity-50" />
                </button>
              ))}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* 10 */
function MinimalConsole({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  const [showOpts, setShowOpts] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <IconBtn ctx={ctx} onClick={() => setSide(!side)} size={8}><Menu className="h-3.5 w-3.5" /></IconBtn>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-60">Lumen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconBtn ctx={ctx} onClick={() => setTemp(!temp)} dim={!temp} size={8}><EyeOff className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn ctx={ctx} size={8}><Settings className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn ctx={ctx} size={8}><User className="h-3.5 w-3.5" /></IconBtn>
          </div>
        </div>
        <main className="flex flex-1 flex-col items-center justify-center px-6">
          <Greeting className="text-center" />
          <div className={`${ctx.btn} mt-8 w-full max-w-[640px] p-4`}>
            <InputBlock ctx={ctx} rows={2} />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconBtn ctx={ctx} size={8}><Paperclip className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn ctx={ctx} size={8}><Wrench className="h-3.5 w-3.5" /></IconBtn>
                <DictateButton ctx={ctx} />
                <IconBtn ctx={ctx} size={8} onClick={() => setShowOpts(!showOpts)}><ChevronDown className={`h-3.5 w-3.5 transition-transform ${showOpts ? "rotate-180" : ""}`} /></IconBtn>
              </div>
              <SendButton ctx={ctx} />
            </div>
            {showOpts && (
              <div className="mt-3 border-t border-border/40 pt-3"><SecondaryRow ctx={ctx} /></div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* 11 — Nested Tile: outer panel hosts inner prompt tile + inner controls tile */
function NestedTile({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-[760px]">
            <Greeting className="text-center" />
            <div className={`${ctx.panel} mt-6 p-3`}>
              <div className={`${ctx.panelInner} p-4`}>
                <InputBlock ctx={ctx} />
                <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
              </div>
              <div className={`${ctx.panelInner} mt-3 px-3 py-2`}>
                <SecondaryRow ctx={ctx} />
              </div>
            </div>
            <div className="mt-10 flex justify-center"><QuickChips ctx={ctx} limit={6} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ChatHomeSurface({
  ctx,
  onSubmit,
}: {
  ctx: Ctx;
  onSubmit: (prompt: string) => void;
}) {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
      <div className="w-full max-w-[780px]">
        <Greeting className="text-center" />
        <motion.div
          layoutId="conversation-composer"
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
          className={`${ctx.panel} mt-6 p-3 sm:p-4`}
        >
          <div className="flex items-center justify-between px-2 pb-3 sm:px-4">
            <SessionMark />
            <StatusTicker />
          </div>

          <div className={`${ctx.panelInner} p-3 sm:p-4`}>
            <InputBlock ctx={ctx} rows={4} onSubmit={onSubmit} />
            <div className="mt-3"><PrimaryRow ctx={ctx} onSubmit={onSubmit} /></div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <SecondaryRow ctx={ctx} />
          </div>
        </motion.div>
        <div className="mt-10 flex justify-center"><QuickChips ctx={ctx} limit={5} /></div>
      </div>
    </main>
  );
}

function MessageAction({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <HoverTip label={label} side="top" align="start">
      <motion.button
        type="button"
        aria-label={label}
        aria-pressed={active || undefined}
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-[background-color,color,opacity] hover:bg-foreground/[0.07] ${
          active ? "text-(--lumen-accent) opacity-100" : "opacity-40 hover:opacity-85"
        }`}
      >
        {children}
      </motion.button>
    </HoverTip>
  );
}

function AssistantReasoningDisclosure({
  message,
}: {
  message: ConversationMessage;
}) {
  const [expanded, setExpanded] = useState(false);
  const formatSummary =
    message.variant === "steps"
      ? "Organized the response into ordered, actionable decisions."
      : message.variant === "table"
        ? "Compared the relevant areas side by side to make tradeoffs easier to scan."
        : message.variant === "rewrite"
          ? "Preserved the original intent while tightening the wording, tone, and hierarchy."
          : message.variant === "code"
            ? "Mapped the requested behavior to a focused implementation example."
            : "Focused on the most relevant constraint and kept the answer intentionally direct.";
  const activity = [
    "Considered the latest request and the earlier conversation context.",
    formatSummary,
    "Checked the response for clarity, feasibility, and fit with the current direction.",
  ];

  return (
    <div className="mt-3 max-w-[620px]">
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Hide" : "Show"} reasoning summary`}
        onClick={() => setExpanded((current) => !current)}
        className="flex items-center gap-1.5 text-[9.5px] opacity-45 transition-opacity hover:opacity-80"
      >
        <span>Reasoning summary</span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={SPRING_TURN}>
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ol className="mt-2.5 space-y-2 border-l border-foreground/10 pl-3">
              {activity.map((item, index) => (
                <li key={item} className="flex items-start gap-2 text-[9px] leading-relaxed opacity-55">
                  <span className="font-mono text-[7.5px] tabular-nums opacity-45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AssistantMessageContent({
  ctx,
  message,
}: {
  ctx: Ctx;
  message: ConversationMessage;
}) {
  const streamCaret = message.streaming ? (
    <motion.span
      aria-hidden
      className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-(--lumen-accent)"
      animate={{ opacity: [1, 0.25, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  ) : null;

  if (message.variant === "rewrite") {
    return (
      <div className="mt-3">
        {message.title ? <p className="mb-2 font-medium opacity-75">{message.title}</p> : null}
        <div className={`${ctx.panel} overflow-hidden p-1`}>
          <div className={`${ctx.panelInner} px-4 py-3.5`}>
            <div className="mb-3 flex items-center justify-between border-b border-foreground/10 pb-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] opacity-40">
                Draft
              </span>
              <Pencil className="h-3 w-3 opacity-35" aria-hidden />
            </div>
            <p className="whitespace-pre-line text-[11.5px] leading-[1.75] opacity-80">
              {message.content}
              {streamCaret}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {message.title ? <h3 className="font-medium opacity-80">{message.title}</h3> : null}
      <p className={`${message.title ? "mt-1.5" : ""} whitespace-pre-line opacity-72`}>
        {message.content}
        {streamCaret}
      </p>

      {!message.streaming && message.variant === "steps" && message.points?.length ? (
        <ol className="mt-4 overflow-hidden rounded-lg border border-foreground/10">
          {message.points.map((point, pointIndex) => (
            <li
              key={point}
              className="flex gap-3 border-b border-foreground/10 px-3.5 py-3 last:border-b-0"
            >
              <span className="font-mono text-[8px] tabular-nums opacity-35">
                {String(pointIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-[10.5px] leading-relaxed opacity-65">{point}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {!message.streaming && message.variant === "code" && message.code ? (
        <div className={`${ctx.panel} mt-4 overflow-hidden p-1`}>
          <div className={`${ctx.panelInner} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-foreground/10 px-3 py-2">
              <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.14em] opacity-45">
                <Code2 className="h-3 w-3" />
                {message.code.language}
              </span>
              <button
                type="button"
                aria-label="Copy code"
                onClick={() => navigator.clipboard?.writeText(message.code?.value ?? "")}
                className="flex h-6 w-6 items-center justify-center rounded-md opacity-40 transition-opacity hover:opacity-90"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <pre className="overflow-x-auto px-3.5 py-3 text-[9.5px] leading-relaxed opacity-75">
              <code>{message.code.value}</code>
            </pre>
          </div>
        </div>
      ) : null}

      {!message.streaming && message.variant === "table" && message.table ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-foreground/10">
          <table className="w-full min-w-[520px] border-collapse text-left text-[9.5px]">
            <thead className="bg-foreground/[0.035]">
              <tr>
                {message.table.headers.map((header) => (
                  <th
                    key={header}
                    className="border-b border-foreground/10 px-3 py-2.5 font-mono text-[8px] font-normal uppercase tracking-[0.12em] opacity-45"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {message.table.rows.map((row) => (
                <tr key={row.join("-")} className="border-b border-foreground/8 last:border-b-0">
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className="px-3 py-2.5 opacity-65">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function AgentProgressRow({
  ctx,
  progress,
}: {
  ctx: Ctx;
  progress: AgentProgress;
}) {
  const [expanded, setExpanded] = useState(false);
  const phases = ["thinking", "working", "streaming"] as const;
  const activeIndex = phases.indexOf(progress.phase);
  const activity = [
    "Reviewing the latest message and conversation context",
    "Choosing a response format that fits the request",
    "Composing the answer and checking the final structure",
  ];

  return (
    <motion.div
      role="status"
      aria-label={`${progress.label}. ${progress.detail}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex max-w-[620px] items-start gap-2.5 py-1"
    >
      <span className={`${ctx.btn} flex h-7 w-7 shrink-0 items-center justify-center`}>
        <Sparkles className="h-3.5 w-3.5 text-(--lumen-accent)" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "Show"} reasoning summary`}
          onClick={() => setExpanded((current) => !current)}
          className="flex items-center gap-1.5 text-left"
        >
          <motion.span
            className="bg-clip-text text-[10.5px] font-medium"
            style={{
              backgroundImage:
                "linear-gradient(90deg, color-mix(in srgb, currentColor 32%, transparent), currentColor, color-mix(in srgb, currentColor 32%, transparent))",
              backgroundSize: "220% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            animate={{ backgroundPosition: ["200% 0%", "-20% 0%"] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
          >
            {progress.label}
          </motion.span>
          <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={SPRING_TURN}>
            <ChevronRight className="h-3 w-3 opacity-35" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -4 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2.5 border-l border-foreground/10 pl-3">
                <p className="font-mono text-[7.5px] uppercase tracking-[0.14em] opacity-35">
                  Reasoning summary
                </p>
                <ol className="mt-2 space-y-2">
                  {activity.map((item, index) => (
                    <li key={item} className="flex items-start gap-2 text-[9px] leading-relaxed">
                      <span
                        className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                          index <= activeIndex ? "bg-(--lumen-accent)" : "bg-foreground/15"
                        }`}
                      />
                      <span className={index <= activeIndex ? "opacity-60" : "opacity-25"}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function conversationUrl(chatId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("chat", chatId);
  url.hash = "";
  return url.toString();
}

function ConversationFilesDialog({
  ctx,
  open,
  onOpenChange,
  files,
}: {
  ctx: Ctx;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: Attachment[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${ctx.panel} w-[calc(100vw-24px)] max-w-md gap-0 overflow-hidden border-0 p-1 text-foreground`}
      >
        <div className={`${ctx.panelInner} p-5`}>
          <DialogTitle className="text-[18px] font-normal tracking-tight">
            Files in this chat
          </DialogTitle>
          <DialogDescription className="mt-1 text-[10px] leading-relaxed opacity-50">
            Files and images shared in this conversation.
          </DialogDescription>
          {files.length ? (
            <div className="mt-5 divide-y divide-foreground/10 overflow-hidden rounded-lg border border-foreground/10">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 px-3 py-3">
                  <span className={`${ctx.btn} flex h-8 w-8 shrink-0 items-center justify-center`}>
                    {kindIcon(file.kind)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10.5px] font-medium">{file.name}</span>
                    <span className="mt-0.5 block font-mono text-[7.5px] uppercase tracking-[0.12em] opacity-35">
                      {file.kind} {file.meta ? `· ${file.meta}` : ""}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-foreground/15 px-4 py-8 text-center">
              <Files className="mx-auto h-5 w-5 opacity-25" />
              <p className="mt-2 text-[10px] opacity-45">No files have been shared yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteChatDialog({
  ctx,
  chat,
  onCancel,
  onConfirm,
}: {
  ctx: Ctx;
  chat: ChatThread | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={Boolean(chat)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className={`${ctx.panel} w-[calc(100vw-24px)] max-w-sm gap-0 overflow-hidden border-0 p-1 text-foreground`}
      >
        <div className={`${ctx.panelInner} p-5`}>
          <DialogTitle className="text-[18px] font-normal tracking-tight">Delete chat?</DialogTitle>
          <DialogDescription className="mt-2 text-[10.5px] leading-relaxed opacity-55">
            “{chat?.title}” will be removed from this workspace. This action cannot be undone.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className={`${ctx.btn} h-9 px-4 text-[10px]`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-9 rounded-md bg-red-500 px-4 text-[10px] text-white transition-colors hover:bg-red-600"
            >
              Delete chat
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConversationSurface({
  ctx,
  chat,
  messages,
  agentProgress,
  launching,
  pinned,
  onSubmit,
  onEditMessage,
  onRegenerate,
  onTogglePin,
  onRequestDelete,
}: {
  ctx: Ctx;
  chat: ChatThread;
  messages: ConversationMessage[];
  agentProgress?: AgentProgress;
  launching: boolean;
  pinned: boolean;
  onSubmit: (prompt: string) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onRegenerate: (messageId: string) => void;
  onTogglePin: () => void;
  onRequestDelete: () => void;
}) {
  const projectName =
    PROJECT_GROUPS.find((project) => project.chats.some((thread) => thread.id === chat.id))?.name ??
    "Recent chat";
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<HTMLElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, "up" | "down" | undefined>>({});
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(() => new Set());
  const [notice, setNotice] = useState("");
  const [filesOpen, setFilesOpen] = useState(false);
  const lastMessage = messages[messages.length - 1];
  const hasStreamingMessage = Boolean(lastMessage?.streaming);
  const chatFiles = messages.flatMap((message) => message.attachments ?? []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    let settleTimer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) return;
      const scrollToLatest = (behavior: ScrollBehavior) =>
        container.scrollTo({ top: container.scrollHeight, behavior });
      scrollToLatest(reducedMotion || hasStreamingMessage ? "auto" : "smooth");
      settleTimer = window.setTimeout(() => scrollToLatest("auto"), 180);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, [
    agentProgress?.phase,
    chat.id,
    hasStreamingMessage,
    lastMessage?.content,
    messages.length,
    reducedMotion,
  ]);

  const copyMessage = async (message: ConversationMessage) => {
    await navigator.clipboard?.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId((current) => (current === message.id ? null : current)), 1200);
  };

  const readMessage = (message: ConversationMessage) => {
    if (!("speechSynthesis" in window)) {
      setNotice("Read aloud is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(message.content));
    setNotice("Reading response aloud.");
  };

  const copyChatLink = async () => {
    await navigator.clipboard?.writeText(conversationUrl(chat.id));
    setNotice("Chat link copied.");
  };

  return (
    <>
    <main
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 sm:px-6"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[820px] flex-col pt-5 sm:pt-8">
        <div className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-4">
          <div className="min-w-0">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] opacity-45">{projectName}</span>
            <h1 className="mt-1 truncate text-[18px] font-light tracking-tight">{chat.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={copyChatLink}
              className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[9px] opacity-45 transition-opacity hover:opacity-90"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Conversation options"
                  className="flex h-8 w-8 items-center justify-center rounded-md opacity-45 transition-[background-color,opacity] hover:bg-foreground/[0.06] hover:opacity-90"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${ctx.panel} w-48 p-1 text-[11px]`}>
                <DropdownMenuItem
                  onSelect={() => setFilesOpen(true)}
                  className="text-[11px]"
                >
                  <Files className="h-3.5 w-3.5" />
                  View files in chat
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onTogglePin} className="text-[11px]">
                  {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  {pinned ? "Unpin chat" : "Pin chat"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={copyChatLink}
                  className="text-[11px]"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Copy chat link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={onRequestDelete}
                  className="text-[11px] text-red-500 focus:bg-red-500/10 focus:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <AnimatePresence>
          {notice ? (
            <motion.p
              role="status"
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -2, scale: 0.98 }}
              className="pointer-events-none fixed right-4 top-[68px] z-[70] rounded-md border border-border/60 bg-popover/95 px-2.5 py-1.5 text-[8.5px] text-popover-foreground shadow-lg backdrop-blur-sm sm:right-6"
            >
              {notice}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <section aria-label="Conversation" className="flex flex-1 flex-col pb-2 pt-6">
          <span className="self-center font-mono text-[8px] uppercase tracking-[0.18em] opacity-35">Today</span>

          <div className="mt-5 flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {messages.map((message, index) =>
                message.role === "user" ? (
                  <motion.div
                    key={message.id}
                    initial={
                      reducedMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: launching && index === 0 ? 56 : 12,
                            scale: launching && index === 0 ? 0.92 : 0.98,
                            filter: "blur(5px)",
                          }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={
                      reducedMotion
                        ? { duration: 0.1 }
                        : { type: "spring", stiffness: 330, damping: 27, mass: 0.75 }
                    }
                    className="group/message ml-auto flex max-w-[86%] flex-col items-end"
                  >
                    {editingId === message.id ? (
                      <div className={`${ctx.panel} w-full min-w-[300px] p-1`}>
                        <div className={`${ctx.panelInner} p-3`}>
                          <textarea
                            autoFocus
                            aria-label="Edit message text"
                            rows={3}
                            value={editValue}
                            onChange={(event) => setEditValue(event.target.value)}
                            className="w-full resize-none bg-transparent text-[12px] leading-relaxed outline-none"
                          />
                          <div className="mt-2 flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="h-7 rounded-md px-2.5 text-[9px] opacity-50 hover:bg-foreground/[0.06] hover:opacity-90"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!editValue.trim()}
                              onClick={() => {
                                onEditMessage(message.id, editValue.trim());
                                setEditingId(null);
                              }}
                              className={`${ctx.btn} accent-soft h-7 px-3 text-[9px] disabled:opacity-40`}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`${ctx.panelInner} px-4 py-3 text-[12px] leading-relaxed whitespace-pre-wrap`}
                      >
                        {message.content.length > 320 && !expandedMessageIds.has(message.id)
                          ? `${message.content.slice(0, 317)}…`
                          : message.content}
                        {message.content.length > 320 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedMessageIds((current) => {
                                const next = new Set(current);
                                if (next.has(message.id)) next.delete(message.id);
                                else next.add(message.id);
                                return next;
                              })
                            }
                            className="mt-2 block text-[9.5px] font-medium opacity-55 transition-opacity hover:opacity-90"
                          >
                            {expandedMessageIds.has(message.id) ? "Show less" : "Show more"}
                          </button>
                        ) : null}
                        {message.attachments?.length ? (
                          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-foreground/10 pt-3">
                            {message.attachments.map((file) => (
                              <span
                                key={file.id}
                                className="inline-flex items-center gap-1.5 rounded-md border border-foreground/10 px-2 py-1.5 text-[8.5px] opacity-65"
                              >
                                {kindIcon(file.kind)}
                                <span className="max-w-40 truncate">{file.name}</span>
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-0.5">
                      <div className="flex opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100">
                        <MessageAction
                          label={copiedId === message.id ? "Copied" : "Copy message"}
                          onClick={() => copyMessage(message)}
                        >
                          <Copy className="h-3 w-3" />
                        </MessageAction>
                        <MessageAction
                          label="Edit message"
                          onClick={() => {
                            setEditingId(message.id);
                            setEditValue(message.content);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </MessageAction>
                      </div>
                      <span className="px-1 font-mono text-[7.5px] uppercase tracking-[0.14em] opacity-30">
                        You · {message.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.article
                    key={message.id}
                    initial={
                      reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 12, filter: "blur(4px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                    aria-busy={message.streaming || undefined}
                    className="max-w-[94%] text-[12px] leading-relaxed"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`${ctx.btn} flex h-7 w-7 items-center justify-center`}>
                        <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--lumen-accent)" }} />
                      </span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] opacity-45">Lumen</span>
                      <span className="font-mono text-[7.5px] uppercase tracking-[0.14em] opacity-25">
                        {message.timestamp}
                      </span>
                    </div>
                    <AssistantReasoningDisclosure message={message} />
                    <AssistantMessageContent ctx={ctx} message={message} />
                    {!message.streaming ? (
                      <div className="mt-2 flex items-center gap-0.5">
                        <MessageAction
                          label={copiedId === message.id ? "Copied" : "Copy response"}
                          onClick={() => copyMessage(message)}
                        >
                          <Copy className="h-3 w-3" />
                        </MessageAction>
                        <MessageAction
                          label="Good response"
                          active={reactions[message.id] === "up"}
                          onClick={() =>
                            setReactions((current) => ({
                              ...current,
                              [message.id]: current[message.id] === "up" ? undefined : "up",
                            }))
                          }
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </MessageAction>
                        <MessageAction
                          label="Bad response"
                          active={reactions[message.id] === "down"}
                          onClick={() =>
                            setReactions((current) => ({
                              ...current,
                              [message.id]: current[message.id] === "down" ? undefined : "down",
                            }))
                          }
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </MessageAction>
                        <MessageAction label="Regenerate response" onClick={() => onRegenerate(message.id)}>
                          <RefreshCw className="h-3 w-3" />
                        </MessageAction>
                        <MessageAction label="Read aloud" onClick={() => readMessage(message)}>
                          <Volume2 className="h-3 w-3" />
                        </MessageAction>
                      </div>
                    ) : null}
                  </motion.article>
                ),
              )}
            </AnimatePresence>

            <AnimatePresence>
              {agentProgress && !hasStreamingMessage ? (
                <AgentProgressRow ctx={ctx} progress={agentProgress} />
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        <motion.div
          layoutId="conversation-composer"
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
          className={`${ctx.panel} sticky bottom-3 z-10 mt-4 p-3 shadow-lg sm:p-4`}
        >
          <div className={`${ctx.panelInner} p-3`}>
            <InputBlock ctx={ctx} rows={2} onSubmit={onSubmit} />
            <div className="mt-2"><PrimaryRow ctx={ctx} onSubmit={onSubmit} /></div>
          </div>
        </motion.div>
      </div>
    </main>
    <ConversationFilesDialog
      ctx={ctx}
      open={filesOpen}
      onOpenChange={setFilesOpen}
      files={chatFiles}
    />
    </>
  );
}

/* 12 — Framed Console: themed chat workspace + app surfaces */
function FramedConsole({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(true);
  const [temp, setTemp] = useState(false);
  const [activeView, setActiveView] = useState<WorkspaceView>("chat");
  const [selectedChat, setSelectedChat] = useState<ChatThread | null>(null);
  const [createdThreads, setCreatedThreads] = useState<ChatThread[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ConversationMessage[]>>(
    {},
  );
  const [agentProgressByThread, setAgentProgressByThread] = useState<
    Record<string, AgentProgress>
  >({});
  const [pinnedChatIds, setPinnedChatIds] = useState<Set<string>>(
    () => new Set(["navigation-ia"]),
  );
  const [deletedChatIds, setDeletedChatIds] = useState<Set<string>>(() => new Set());
  const [chatPendingDelete, setChatPendingDelete] = useState<ChatThread | null>(null);
  const [launchingThreadId, setLaunchingThreadId] = useState<string | null>(null);
  const responseTimers = useRef<number[]>([]);
  const assistantSequence = useRef(0);

  useEffect(() => {
    const chatId = new URL(window.location.href).searchParams.get("chat");
    const linkedChat = ALL_THREADS.find((chat) => chat.id === chatId);
    if (linkedChat) setSelectedChat(linkedChat);
  }, []);

  useEffect(() => {
    const timers = responseTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const scheduleReply = (threadId: string, prompt: string) => {
    const reply = createAssistantReply(prompt, assistantSequence.current++);
    const messageId = `${threadId}-assistant-${Date.now()}`;
    setAgentProgressByThread((current) => ({
      ...current,
      [threadId]: {
        phase: "thinking",
        label: "Understanding your request",
        detail: "Reading the latest message and conversation context.",
      },
    }));

    const workingTimer = window.setTimeout(() => {
      setAgentProgressByThread((current) => ({
        ...current,
        [threadId]: {
          phase: "working",
          label: "Shaping the response",
          detail: "Choosing the clearest structure for this kind of answer.",
        },
      }));
    }, 420);

    const streamTimer = window.setTimeout(() => {
      setMessagesByThread((current) => ({
        ...current,
        [threadId]: [
          ...(current[threadId] ?? []),
          {
            ...reply,
            id: messageId,
            content: "",
            streaming: true,
          },
        ],
      }));
      setLaunchingThreadId((current) => current === threadId ? null : current);
      setAgentProgressByThread((current) => ({
        ...current,
        [threadId]: {
          phase: "streaming",
          label: "Writing the response",
          detail: "Streaming the answer as it is composed.",
        },
      }));

      const chunks = reply.content.match(/\S+\s*/g) ?? [reply.content];
      let cursor = 0;
      const tokenTimer = window.setInterval(() => {
        cursor = Math.min(cursor + 2, chunks.length);
        const partial = chunks.slice(0, cursor).join("");
        const finished = cursor >= chunks.length;
        setMessagesByThread((current) => ({
          ...current,
          [threadId]: (current[threadId] ?? []).map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content: finished ? reply.content : partial,
                  streaming: !finished,
                }
              : message,
          ),
        }));

        if (finished) {
          window.clearInterval(tokenTimer);
          setAgentProgressByThread((current) => {
            const next = { ...current };
            delete next[threadId];
            return next;
          });
        }
      }, 38);
      responseTimers.current.push(tokenTimer);
    }, 840);

    responseTimers.current.push(workingTimer, streamTimer);
  };

  const submitToConversation = (chat: ChatThread, prompt: string) => {
    const attachments = attachmentsStore.get();
    const message: ConversationMessage = {
      id: `${chat.id}-user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: "Now",
      attachments: attachments.length ? [...attachments] : undefined,
    };
    setMessagesByThread((current) => ({
      ...current,
      [chat.id]: [...(current[chat.id] ?? seededConversation(chat)), message],
    }));
    attachmentsStore.clear();
    scheduleReply(chat.id, prompt);
  };

  const editConversationMessage = (
    chat: ChatThread,
    messageId: string,
    content: string,
  ) => {
    setMessagesByThread((current) => ({
      ...current,
      [chat.id]: (current[chat.id] ?? seededConversation(chat)).map((message) =>
        message.id === messageId ? { ...message, content, timestamp: "Edited" } : message,
      ),
    }));
  };

  const regenerateResponse = (chat: ChatThread, messageId: string) => {
    const currentMessages = messagesByThread[chat.id] ?? seededConversation(chat);
    const responseIndex = currentMessages.findIndex((message) => message.id === messageId);
    const prompt =
      currentMessages
        .slice(0, responseIndex)
        .reverse()
        .find((message) => message.role === "user")?.content ?? chat.summary;
    setMessagesByThread((current) => ({
      ...current,
      [chat.id]: (current[chat.id] ?? seededConversation(chat)).filter(
        (message) => message.id !== messageId,
      ),
    }));
    scheduleReply(chat.id, prompt);
  };

  const togglePinnedChat = (chatId: string) => {
    setPinnedChatIds((current) => {
      const next = new Set(current);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  };

  const beginConversation = (prompt: string) => {
    const attachments = attachmentsStore.get();
    const words = prompt.replace(/\s+/g, " ").trim().split(" ");
    const shortTitle = words.slice(0, 6).join(" ");
    const thread: ChatThread = {
      id: `local-${Date.now()}`,
      title: `${shortTitle}${words.length > 6 ? "…" : ""}`,
      summary: prompt,
      updated: "Now",
    };
    setCreatedThreads((current) => [thread, ...current]);
    setMessagesByThread((current) => ({
      ...current,
      [thread.id]: [
        {
          id: `${thread.id}-user`,
          role: "user",
          content: prompt,
          timestamp: "Now",
          attachments: attachments.length ? [...attachments] : undefined,
        },
      ],
    }));
    setLaunchingThreadId(thread.id);
    setSelectedChat(thread);
    setActiveView("chat");
    window.history.replaceState(null, "", conversationUrl(thread.id));
    attachmentsStore.clear();
    scheduleReply(thread.id, prompt);
  };

  const startNewChat = () => {
    setActiveView("chat");
    setSelectedChat(null);
    composerStore.setValue("");
    attachmentsStore.clear();
    const url = new URL(window.location.href);
    url.searchParams.delete("chat");
    window.history.replaceState(null, "", url);
  };

  const selectChat = (chat: ChatThread) => {
    setSelectedChat(chat);
    setActiveView("chat");
    composerStore.setValue("");
    window.history.replaceState(null, "", conversationUrl(chat.id));
  };

  const confirmDeleteChat = () => {
    if (!chatPendingDelete) return;
    const chatId = chatPendingDelete.id;
    setDeletedChatIds((current) => new Set(current).add(chatId));
    setCreatedThreads((current) => current.filter((chat) => chat.id !== chatId));
    setPinnedChatIds((current) => {
      const next = new Set(current);
      next.delete(chatId);
      return next;
    });
    setMessagesByThread((current) => {
      const next = { ...current };
      delete next[chatId];
      return next;
    });
    setAgentProgressByThread((current) => {
      const next = { ...current };
      delete next[chatId];
      return next;
    });
    setLaunchingThreadId((current) => (current === chatId ? null : current));
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("chat");
      window.history.replaceState(null, "", url);
    }
    setChatPendingDelete(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SideMenu
        ctx={ctx}
        open={side}
        onToggle={() => setSide(false)}
        activeView={activeView}
        selectedChatId={selectedChat?.id}
        onNavigate={setActiveView}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        additionalThreads={createdThreads}
        pinnedChatIds={pinnedChatIds}
        onTogglePinnedChat={togglePinnedChat}
        deletedChatIds={deletedChatIds}
        onRequestDeleteChat={setChatPendingDelete}
      />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          ctx={ctx}
          sideOpen={side}
          onSide={() => setSide(!side)}
          onTemp={() => setTemp(!temp)}
          temp={temp}
          chatControls={activeView === "chat"}
        />
        {activeView === "library" ? (
          <LibrarySurface ctx={ctx} />
        ) : activeView === "connectors" ? (
          <ConnectorsSurface ctx={ctx} />
        ) : (
          <LayoutGroup id="framed-conversation">
            {selectedChat ? (
              <ConversationSurface
                ctx={ctx}
                chat={selectedChat}
                messages={messagesByThread[selectedChat.id] ?? seededConversation(selectedChat)}
                agentProgress={agentProgressByThread[selectedChat.id]}
                launching={launchingThreadId === selectedChat.id}
                pinned={pinnedChatIds.has(selectedChat.id)}
                onSubmit={(prompt) => submitToConversation(selectedChat, prompt)}
                onEditMessage={(messageId, content) =>
                  editConversationMessage(selectedChat, messageId, content)
                }
                onRegenerate={(messageId) => regenerateResponse(selectedChat, messageId)}
                onTogglePin={() => togglePinnedChat(selectedChat.id)}
                onRequestDelete={() => setChatPendingDelete(selectedChat)}
              />
            ) : (
              <ChatHomeSurface ctx={ctx} onSubmit={beginConversation} />
            )}
          </LayoutGroup>
        )}
        <DeleteChatDialog
          ctx={ctx}
          chat={chatPendingDelete}
          onCancel={() => setChatPendingDelete(null)}
          onConfirm={confirmDeleteChat}
        />
      </div>
    </div>
  );
}

/* 13 — Tray + Strip: outer tray wraps prompt tile on top + horizontal controls strip below */
function TrayStrip({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-[760px]">
            <Greeting className="text-center" />
            <div className={`${ctx.panel} mt-6 p-3`}>
              <div className={`${ctx.panelInner} p-4`}>
                <InputBlock ctx={ctx} rows={3} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 px-2">
                <div className="flex items-center gap-1.5">
                  <IconBtn ctx={ctx} size={8}><Paperclip className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn ctx={ctx} size={8}><Wrench className="h-3.5 w-3.5" /></IconBtn>
                  <DictateButton ctx={ctx} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Pill ctx={ctx}><Brain className="h-3.5 w-3.5" /> Memory</Pill>
                  <Pill ctx={ctx}><Globe className="h-3.5 w-3.5" /> Web</Pill>
                  <SendButton ctx={ctx} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-center"><SecondaryRow ctx={ctx} /></div>
            <div className="mt-10 flex justify-center"><QuickChips ctx={ctx} limit={6} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ───────────────────────── gallery shell ───────────────────────── */

function LayoutGallery() {
  useEffect(() => { settingsStore.hydrate(); }, []);
  const settings = useSettings();
  const { light, themeId, hue, saturation, lightness, buttonStyleId } = settings;

  const preset = THEME_PRESETS.find((p) => p.id === themeId) ?? THEME_PRESETS[1];
  const mode = light ? preset.light : preset.dark;
  const accent = `hsl(${hue} ${saturation}% ${lightness}%)`;
  const themeVars = buildThemeVars(mode, accent, accentContrastFor(lightness));

  // Sync html.dark + every theme var so portaled Radix surfaces (Dialog, Popover,
  // Tooltip) pick up the active theme — they render outside the page wrapper.
  useEffect(() => {
    const root = document.documentElement;
    if (light) root.classList.remove("dark"); else root.classList.add("dark");
    for (const [k, v] of Object.entries(themeVars)) root.style.setProperty(k, v);
    return () => { root.classList.remove("dark"); };
  }, [light, themeVars]);

  const style = BUTTON_STYLES.find((s) => s.id === buttonStyleId) ?? BUTTON_STYLES[0];
  const btnClass = light ? style.lightClass : style.darkClass;
  const panelClass = light ? style.panelLight : style.panelDarkClass;
  const panelInnerClass = light ? style.panelInnerLight : style.panelInnerDark;

  const ctx: Ctx = {
    light,
    btn: btnClass,
    panel: panelClass,
    panelInner: panelInnerClass,
  };

  const wrap = light ? "" : "dark";
  const v12 = LAYOUTS.find((l) => l.id === "12") ?? LAYOUTS[0];

  return (
    <div className={wrap}>
      <div
        className="relative min-h-screen text-foreground transition-colors duration-500"
        style={{ background: mode.bg, color: mode.fg, ...themeVars } as any}
      >
        {v12.render(ctx)}
      </div>
    </div>
  );
}
