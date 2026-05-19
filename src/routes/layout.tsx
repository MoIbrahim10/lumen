import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import {
  Paperclip, Mic, Wrench, ArrowUp, Globe, Brain, ChevronDown, Sun, Moon,
  SlidersHorizontal, Menu, EyeOff, FileText, Mail, Code2, Search,
  ScanSearch, Lightbulb, Presentation, Image as ImageIcon,
  Plus, History, Library, FolderClosed, Cpu, Plug,
  Settings, User, ChevronRight, PanelLeft, X, ArrowRight, Check,
  Sparkles, Feather, Smile, Scissors, Wand2,
  Upload, Link2, ClipboardPaste, Github, Database, Calendar,
  Hash, Film, FileAudio, MonitorUp,
} from "lucide-react";
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup,
  CommandItem, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/layout")({ component: LayoutGallery });

/* ───────────────────────── shared bits ───────────────────────── */

// Unified spring presets — all icon feedback uses these for consistent feel.
const SPRING_POP = { type: "spring" as const, stiffness: 500, damping: 18, mass: 0.6 };
const SPRING_TURN = { type: "spring" as const, stiffness: 500, damping: 22 };
const SPRING_SETTLE = { type: "spring" as const, stiffness: 360, damping: 26 };


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
  let snap = { value: "", streaming: false, listening: false };
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
  };
})();

function useComposer() {
  return useSyncExternalStore(composerStore.subscribe, composerStore.get, composerStore.get);
}

/* ───────── attachmentsStore — files + links + pasted snippets in the composer ───────── */
type AttachKind = "file" | "image" | "audio" | "video" | "url" | "text";
type Attachment = { id: string; kind: AttachKind; name: string; meta?: string };

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
  hue: 220,
  saturation: 12,
  lightness: 92,
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

export const BUTTON_STYLES: { id: ButtonStyleId; name: string; lightClass: string; darkClass: string }[] = [
  { id: "mech",     name: "Mechanical",  lightClass: "btn-mech-light",  darkClass: "btn-mech" },
  { id: "clean",    name: "Cupertino",   lightClass: "btn-clean",       darkClass: "btn-clean" },
  { id: "emboss",   name: "Embossed",    lightClass: "btn-emboss",      darkClass: "btn-emboss" },
  { id: "depth3d",  name: "Soft 3D",     lightClass: "btn-3d",          darkClass: "btn-3d" },
  { id: "penrose",  name: "Penrose",     lightClass: "btn-penrose",     darkClass: "btn-penrose" },
  { id: "squircle", name: "Squircle",    lightClass: "btn-squircle",    darkClass: "btn-squircle" },
  { id: "liquid",   name: "Liquid",      lightClass: "btn-liquid",      darkClass: "btn-liquid" },
  { id: "pebble",   name: "Pebble",      lightClass: "btn-pebble",      darkClass: "btn-pebble" },
  { id: "inflated", name: "Inflated",    lightClass: "btn-inflated",    darkClass: "btn-inflated" },
  { id: "paper",    name: "Paper",       lightClass: "btn-paper",       darkClass: "btn-paper" },
];

export const THEME_PRESETS: { id: ThemePresetId; name: string; bg: string; fg: string; accent: string; tagline: string }[] = [
  { id: "obsidian", name: "Obsidian",     bg: "#0a0a0a", fg: "#f0f0f0", accent: "#a78bfa", tagline: "Pure black · violet pulse" },
  { id: "graphite", name: "Graphite Ink", bg: "#ededeb", fg: "#111111", accent: "#3b3b3b", tagline: "Newsprint · soft graphite" },
  { id: "ocean",    name: "Ocean Deep",   bg: "#0c1f2e", fg: "#e6f1ff", accent: "#5cbdb9", tagline: "Submarine indigo · teal" },
  { id: "plasma",   name: "Plasma Violet",bg: "#15101f", fg: "#f3eaff", accent: "#e879f9", tagline: "Midnight · neon plasma" },
];




function HoverTip({ label, keys, desc, children, side = "bottom" }: {
  label: string; keys?: string; desc?: string; children: ReactNode; side?: "top" | "bottom";
}) {
  const [hover, setHover] = useState(false);
  const pos = side === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]";
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 480, damping: 30, mass: 0.5 }}
            className={`pointer-events-none absolute left-1/2 z-[60] -translate-x-1/2 ${pos} ${
              desc
                ? "w-[240px] flex-col items-start"
                : "flex items-center gap-2 whitespace-nowrap"
            } flex rounded-lg border border-border/60 bg-popover/95 px-3 py-2 text-popover-foreground shadow-xl backdrop-blur-sm`}
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
              <kbd className="rounded-sm border border-border bg-muted/40 px-1.5 py-[1px] font-mono text-[9px] tracking-[0.1em]">
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
  ctx, on, onClick, label, desc, icon,
}: {
  ctx: Ctx; on: boolean; onClick: () => void;
  label: string; desc: string; icon: ReactNode;
}) {
  return (
    <HoverTip label={label} desc={desc}>
      <motion.button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        aria-label={`${label} ${on ? "on" : "off"}`}
        whileTap={{ scale: 0.92 }}
        transition={SPRING_TURN}
        className={`${ctx.btn} relative flex h-[30px] w-[30px] items-center justify-center`}
      >
        <motion.span
          key={`t-${on}`}
          initial={{ scale: 0.7, rotate: on ? -16 : 16 }}
          animate={{
            scale: [0.7, 1.18, 1],
            rotate: [on ? -16 : 16, on ? 6 : -6, 0],
            color: on ? "#10b981" : "var(--muted-foreground)",
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
  ctx, label, value, options, onChange, align = "left",
}: {
  ctx: Ctx;
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (v: string) => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const current = options.find((o) => o.id === value) ?? options[0];
  const longest = options.reduce((a, b) => (a.id.length >= b.id.length ? a : b)).id;
  const activeId = hoverId ?? value;
  const activeIndex = Math.max(0, options.findIndex((o) => o.id === activeId));
  const total = options.length;

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.97 }}
        className={`${ctx.btn} flex h-9 items-center gap-1.5 px-3 text-[11px] cursor-pointer select-none`}
      >
        <span className="opacity-60">{label}</span>
        <span className="relative inline-block text-left">
          <span className="invisible">{longest}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={current.id}
              initial={{ y: -8, opacity: 0, filter: "blur(2px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: 8, opacity: 0, filter: "blur(2px)" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {current.id}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.span
          animate={{ rotate: open ? -180 : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="ml-0.5 inline-flex"
        >
          <ChevronDown className="h-3 w-3 opacity-60" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); }}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.55 }}
              style={{ transformOrigin: align === "right" ? "bottom right" : "bottom left" }}
              onMouseLeave={() => setHoverId(null)}
              className={`${ctx.panel} absolute bottom-full z-50 mb-2 w-[260px] overflow-hidden p-1 ${align === "right" ? "right-0" : "left-0"}`}
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
                            className="absolute inset-x-1 inset-y-0.5 rounded-md bg-foreground/[0.06]"
                          />
                        )}
                        {/* left rail for selected */}
                        {selected && (
                          <motion.span
                            layoutId={`picker-rail-${label}`}
                            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.5 }}
                            className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full bg-foreground"
                          />
                        )}

                        {/* index + caret column */}
                        <span className="relative z-10 mt-[1px] flex w-7 shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] opacity-60 tabular-nums">
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
                              className="inline-block h-1.5 w-1.5 rounded-full bg-foreground"
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
        )}
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
    <HoverTip label={`${label} · ${value}`} desc={desc}>
      <motion.button
        type="button"
        onClick={cycle}
        aria-label={`${label}: ${value}`}
        animate={{ scale: bump ? [1, 0.96, 1] : 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={`${ctx.btn} flex items-center gap-1.5 ${showLabel ? "px-3" : "px-2.5"} py-1.5 text-[11px] cursor-pointer select-none`}
      >
        {showLabel && <span className="opacity-60">{label}</span>}
        <motion.span
          key={`g-${index}`}
          initial={{ rotate: -14, scale: 0.7 }}
          animate={{ rotate: [-14, 8, 0], scale: [0.7, 1.18, 1] }}
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




function Profile({ ctx, align = "right" }: { ctx: Ctx; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`${ctx.btn} flex h-9 w-9 items-center justify-center p-0`}
        aria-label="Profile"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] text-background">EM</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg ${align === "right" ? "right-0" : "left-0"}`}>
            <div className="border-b border-border px-3 py-2 text-[11px] opacity-60">Emma · emma@lumen.app</div>
            {["Account", "Billing", "Workspace", "Sign out"].map((o) => (
              <div key={o} className="block px-3 py-2 text-xs hover:bg-muted cursor-pointer">{o}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { label: "New chat", icon: Plus, keys: "⌘N" },
  { label: "Library", icon: Library, keys: "⌘L" },
  { label: "Projects", icon: FolderClosed, keys: "⌘P" },
  { label: "Memory", icon: Brain, keys: "⌘⇧M" },
  { label: "Connectors", icon: Plug, keys: "⌘⇧C" },
  { label: "Models", icon: Cpu, keys: "⌘M" },
  { label: "History", icon: History, keys: "⌘H" },
];

function LeftPill({ ctx, sideOpen, onSide, onSearch }: {
  ctx: Ctx; sideOpen: boolean; onSide?: () => void; onSearch: () => void;
}) {
  return (
    <div className={`${ctx.panel} fixed top-3 left-4 z-40 flex items-center gap-1 p-1`}>
      {onSide && (
        <motion.button
          onClick={onSide}
          aria-label={sideOpen ? "Close menu" : "Open menu"}
          whileTap={{ scale: 0.92 }}
          transition={SPRING_TURN}
          className={`${ctx.btn} flex h-8 w-8 items-center justify-center`}
        >
          <PanelLeft
            className="h-[15px] w-[15px] transition-transform duration-300 ease-out"
            strokeWidth={2}
            style={{ transform: sideOpen ? "scaleX(-1)" : "scaleX(1)" }}
          />
        </motion.button>
      )}
      <motion.button
        onClick={onSearch}
        aria-label="Search"
        whileTap={{ scale: 0.92 }}
        transition={SPRING_TURN}
        className={`${ctx.btn} flex h-8 w-8 items-center justify-center`}
      >
        <Search className="h-[15px] w-[15px]" strokeWidth={2} />
      </motion.button>
    </div>
  );
}


function SideMenu({ ctx, open }: { ctx: Ctx; open: boolean; onToggle?: () => void; placement?: "left" | "right" }) {
  return (
    <aside
      aria-hidden={!open}
      className="relative shrink-0 overflow-hidden bg-[#f1f1ef] border-r border-zinc-200/60"
      style={{
        width: open ? 260 : 0,
        transition: "width 360ms cubic-bezier(0.32, 0.72, 0, 1)",
        willChange: "width",
      }}
    >
      <div
        className="flex h-full flex-col pt-[60px] px-2 pb-3"
        style={{
          width: 260,
          opacity: open ? 1 : 0,
          transition: "opacity 200ms ease-out",
          transitionDelay: open ? "180ms" : "0ms",
        }}
      >
        <div className="px-2 pb-2 pt-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">Menu</span>
        </div>
        <nav className="flex flex-col gap-1.5 overflow-y-auto">
          {NAV_ITEMS.map((i) => (
            <button
              key={i.label}
              className={`${ctx.btn} flex h-10 items-center justify-between gap-2 px-3 text-[11px]`}
            >
              <span className="flex items-center gap-2.5">
                <i.icon className="h-3.5 w-3.5 opacity-70" />
                {i.label}
              </span>
              <kbd className="font-mono text-[9px] tracking-[0.1em] opacity-40">{i.keys}</kbd>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[560px]">
        <Command className="[&_[cmdk-input]]:h-12">
          <CommandInput placeholder="Type a command or search your threads…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              <CommandItem><Plus className="h-4 w-4" /> New chat <CommandShortcut>⌘N</CommandShortcut></CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Chat">
              <CommandItem><History className="h-4 w-4" /> Manage chat history</CommandItem>
              <CommandItem><Cpu className="h-4 w-4" /> View all available models</CommandItem>
              <CommandItem><Paperclip className="h-4 w-4" /> View all uploaded attachments</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Profiles">
              <CommandItem>✓ Default</CommandItem>
              <CommandItem><Plus className="h-4 w-4" /> Create new profile</CommandItem>
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted/40 px-1.5 py-[1px] font-mono">↵</kbd>
            <span>type to search or start a new chat</span>
          </div>
        </Command>
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
      className="flex h-2.5 items-end gap-[2px] translate-y-[1px] origin-bottom"
      animate={{ scaleY: profile.intensity, opacity: profile.opacity }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      {WAVE_HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className="block h-full w-[2px] rounded-[1px] bg-foreground origin-bottom"
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
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
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
      <h1 className="text-center text-[36px] font-light leading-[1] tracking-tight md:text-[52px]">
        <span className="opacity-90">what&rsquo;s on your</span>
        <span className="ml-2 italic font-normal" style={{ fontFamily: "ui-serif, Georgia, serif" }}>
          mind
        </span>
        <span className="opacity-90">,</span>
        <br />
        <span className="relative inline-block">
          <span className="font-mono text-[28px] uppercase tracking-[0.08em] md:text-[40px]">
            Emma
          </span>
          <span className="ml-0.5 inline-block animate-pulse text-foreground/70">?</span>
          <span
            aria-hidden
            className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
          />
        </span>
      </h1>
    </div>
  );
}


/* helper — stream text into the composer (used by Send + promptBus) */
function streamText(text: string) {
  composerStore.setValue("");
  composerStore.setStreaming(true);
  let i = 0;
  const tick = () => {
    i += 1;
    composerStore.setValue(text.slice(0, i));
    if (i < text.length) {
      const ch = text[i - 1];
      const delay = ch === " " ? 14 : 18 + Math.random() * 22;
      window.setTimeout(tick, delay);
    } else {
      composerStore.setStreaming(false);
    }
  };
  tick();
}

function InputBlock({ ctx, rows = 3 }: { ctx: Ctx; rows?: number }) {
  const { value, streaming } = useComposer();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const unsub = promptBus.subscribe((text) => {
      ref.current?.focus();
      streamText(text);
    });
    return () => { unsub(); };
  }, []);

  return (
    <div className="relative">
      <AttachmentStrip />
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => composerStore.setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            const v = composerStore.get().value.trim();
            if (v.length > 0 && !composerStore.get().streaming) {
              e.preventDefault();
              // brief "sent" pulse via store reset
              composerStore.setValue("");
            }
          }
        }}
        placeholder="Type a prompt …"
        className="w-full resize-none bg-transparent text-[15px] leading-relaxed placeholder:opacity-40 focus:outline-none"
        style={{ color: "inherit" }}
      />
      {streaming && (
        <motion.span
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left center" }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent"
        />
      )}
    </div>
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
                    className="group/chip relative inline-flex max-w-[220px] items-center gap-1.5 overflow-hidden rounded-full border border-border/60 bg-foreground/[0.04] py-1 pl-2 pr-1 text-[10.5px] backdrop-blur-sm"
                  >
                    {/* scan shimmer */}
                    <motion.span
                      aria-hidden
                      initial={{ x: "-120%" }}
                      animate={{ x: "120%" }}
                      transition={{ duration: 1.6, ease: "easeInOut", repeat: 0 }}
                      className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
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
function SendButton({ ctx }: { ctx: Ctx }) {
  const { value, streaming } = useComposer();
  const [sent, setSent] = useState(false);
  const disabled = streaming || sent || value.trim().length === 0;

  const onSend = () => {
    if (disabled) return;
    setSent(true);
    // emit a brief success state, then clear and reset
    window.setTimeout(() => {
      composerStore.setValue("");
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
              className="absolute inset-0 rounded-[inherit] border border-foreground/45"
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
                          className="group/src relative flex flex-col items-start gap-1 overflow-hidden rounded-md border border-border/40 bg-foreground/[0.02] p-2.5 text-left transition-colors hover:bg-foreground/[0.06]"
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
                      <div className="flex items-center gap-2 rounded-md border border-border/50 bg-foreground/[0.03] px-2">
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
                        className="w-full resize-none rounded-md border border-border/50 bg-foreground/[0.03] px-2 py-1.5 text-[11px] placeholder:opacity-40 focus:outline-none"
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
              className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-emerald-500 px-1 font-mono text-[8px] font-semibold leading-none text-background"
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
                          className="group/tool relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-foreground/[0.05]"
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
                          <span className={`relative h-3.5 w-6 shrink-0 rounded-full transition-colors ${on ? "bg-emerald-500/80" : "bg-foreground/15"}`}>
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
                  <div className="grid grid-cols-6 gap-1">
                    {CONN_DEFS.map((c, i) => {
                      const on = conns.has(c.id);
                      const linked = c.status === "linked";
                      const Icon = c.icon;
                      return (
                        <motion.button
                          key={c.id}
                          type="button"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.04 + i * 0.025, duration: 0.22 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { if (linked) toolsStore.toggleConn(c.id); }}
                          aria-pressed={on}
                          title={
                            on ? `${c.label} · active`
                              : linked ? `${c.label} · tap to enable`
                              : `${c.label} · authenticate to connect`
                          }
                          className={`group/conn relative flex aspect-square items-center justify-center rounded-md border transition-all ${
                            on
                              ? "border-emerald-500/60 bg-emerald-500/[0.12] text-emerald-600 dark:text-emerald-400"
                              : "border-border/50 bg-foreground/[0.02] text-foreground/75 hover:bg-foreground/[0.06]"
                          }`}
                        >
                          {on && (
                            <motion.span
                              aria-hidden
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-emerald-500"
                            />
                          )}
                          {!linked && (
                            <span
                              aria-hidden
                              className="absolute right-0 top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            >
                              <span className="font-mono text-[7px] font-bold leading-none">!</span>
                            </span>
                          )}
                          <Icon className="h-3.5 w-3.5" />
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


function PrimaryRow({ ctx }: { ctx: Ctx }) {
  const [model, setModel] = useState<(typeof MODEL_OPTIONS)[number]>("Lumen 4");
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <AttachButton ctx={ctx} />
        <ToolsButton ctx={ctx} />
        <FancyPicker
          ctx={ctx} label="Model" value={model}
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
      </div>
      <div className="flex items-center gap-1.5">
        <DictateButton ctx={ctx} />
        <SendButton ctx={ctx} />
      </div>
    </div>
  );
}

function SecondaryRow({ ctx, vertical = false }: { ctx: Ctx; vertical?: boolean }) {
  const [style, setStyle] = useState("Auto");
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  return (
    <div className={`flex ${vertical ? "flex-col items-stretch" : "flex-wrap items-center"} gap-1.5`}>
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
      <TogglePill
        ctx={ctx} on={memory} onClick={() => setMemory(!memory)}
        label={memory ? "Memory · on" : "Memory · off"}
        desc="Remember details about you across conversations and use them to personalize replies."
        icon={<Brain className="h-3.5 w-3.5" />}
      />
      <TogglePill
        ctx={ctx} on={web} onClick={() => setWeb(!web)}
        label={web ? "Web · on" : "Web · off"}
        desc="Let the model search the live web for fresh information and cite sources."
        icon={<Globe className="h-3.5 w-3.5" />}
      />


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
    window.setTimeout(() => setFired(false), 900);
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
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent transition-transform duration-700 ease-out group-hover/chip:translate-x-[400%]"
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
              className="absolute inset-0 inline-flex items-center justify-center text-emerald-500"
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
  const settings = useSettings();
  return (
    <div className="relative">
      <HoverTip label="Preferences" keys="⌘,">
        <motion.button
          onClick={() => setOpen((o) => !o)}
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
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.55 }}
              style={{ transformOrigin: "top right" }}
              className={`${ctx.panel} absolute top-full right-0 z-50 mt-2 w-[360px] overflow-hidden p-1`}
            >
              <PreferencesPanel ctx={ctx} settings={settings} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PreferencesPanel({ ctx, settings }: { ctx: Ctx; settings: Settings }) {
  return (
    <div className={`${ctx.panelInner} flex max-h-[min(80vh,640px)] flex-col overflow-y-auto`}>
      {/* header */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] opacity-70">
          <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-foreground/60" />
          Preferences
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
        <div className="relative grid grid-cols-2 gap-1 rounded-md border border-foreground/10 bg-foreground/[0.03] p-1">
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
                    className="absolute inset-0 rounded-[5px] bg-foreground/[0.08]"
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
          return (
            <motion.button
              key={p.id}
              onClick={() => settingsStore.set("themeId", p.id)}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_TURN}
              className={`group relative overflow-hidden rounded-md border p-2 text-left transition-all ${
                active
                  ? "border-emerald-500/60 bg-emerald-500/[0.05]"
                  : "border-foreground/10 hover:border-foreground/25"
              }`}
              aria-pressed={active}
            >
              <div
                className="mb-1.5 h-6 w-full rounded-sm border border-foreground/10"
                style={{ background: `linear-gradient(135deg, ${p.bg} 0%, ${p.bg} 55%, ${p.accent} 55%, ${p.accent} 100%)` }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-medium leading-none text-foreground">{p.name}</span>
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={SPRING_POP}
                    className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 text-background"
                  >
                    <Check className="h-2 w-2" strokeWidth={3} />
                  </motion.span>
                )}
              </div>
              <span className="mt-0.5 block text-[9px] leading-tight opacity-55">{p.tagline}</span>
            </motion.button>
          );
        })}
      </div>

      {/* HSL sliders */}
      <SectionHeader label="Accent · custom" />
      <div className="space-y-2.5 px-3 pb-3">
        <Slider label="Hue"        min={0}   max={360} value={settings.hue}        onChange={(v) => settingsStore.set("hue", v)}
                track={`linear-gradient(90deg, #ff5a5a, #ffd000, #5aff5a, #5addff, #5a5aff, #ff5aff, #ff5a5a)`} />
        <Slider label="Saturation" min={0}   max={100} value={settings.saturation} onChange={(v) => settingsStore.set("saturation", v)}
                track={`linear-gradient(90deg, hsl(${settings.hue} 0% 60%), hsl(${settings.hue} 100% 55%))`} />
        <Slider label="Lightness"  min={20}  max={95}  value={settings.lightness}  onChange={(v) => settingsStore.set("lightness", v)}
                track={`linear-gradient(90deg, hsl(${settings.hue} ${settings.saturation}% 25%), hsl(${settings.hue} ${settings.saturation}% 95%))`} />
        <div className="flex items-center justify-between rounded-md border border-foreground/10 bg-foreground/[0.03] px-2 py-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-55">Preview</span>
          <div className="flex items-center gap-1.5">
            <span
              className="h-4 w-4 rounded-full border border-foreground/15"
              style={{ background: `hsl(${settings.hue} ${settings.saturation}% ${settings.lightness}%)` }}
            />
            <span className="font-mono text-[9px] tabular-nums opacity-65">
              {Math.round(settings.hue)}·{Math.round(settings.saturation)}·{Math.round(settings.lightness)}
            </span>
          </div>
        </div>
      </div>

      {/* Button style picker */}
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
              className={`group relative flex items-center gap-2 rounded-md border p-1.5 pr-2 text-left transition-all ${
                active
                  ? "border-emerald-500/60 bg-emerald-500/[0.04]"
                  : "border-foreground/10 hover:border-foreground/25"
              }`}
            >
              <span className={`${cls} flex h-7 w-7 shrink-0 items-center justify-center text-[11px]`}>
                <span>Aa</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[10.5px] leading-tight text-foreground">{s.name}</span>
                <span className="truncate text-[9px] leading-tight opacity-50">{s.id}</span>
              </span>
              {active && (
                <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-background">
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
        <Link to="/connectors" className="underline-offset-4 hover:underline">connectors lab →</Link>
      </div>
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
  ctx, sideOpen, onSide, onTemp, temp, right,
}: {
  ctx: Ctx; sideOpen?: boolean; onSide?: () => void; onTemp: () => void; temp: boolean;
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
    <div className="flex h-14 items-center justify-between gap-3 px-4">
      <LeftPill ctx={ctx} sideOpen={!!sideOpen} onSide={onSide} onSearch={() => setSearchOpen(true)} />
      <div />

      {/* right cluster — temp + preferences + profile, matches composer */}
      <div className={`${ctx.panel} flex items-center gap-1 p-1`}>
        <HoverTip label={temp ? "Temporary chat on" : "Temporary chat"} keys="⌘⇧T">
          <motion.button
            onClick={onTemp}
            aria-label={temp ? "Temporary chat on" : "Temporary chat"}
            aria-pressed={temp}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_TURN}
            className={`${ctx.btn} flex h-8 w-8 items-center justify-center ${temp ? "text-emerald-600 dark:text-emerald-400" : ""}`}
          >
            <EyeOff className="h-[15px] w-[15px]" strokeWidth={2} />
          </motion.button>
        </HoverTip>
        <PreferencesButton ctx={ctx} />
        <span className="mx-0.5 h-4 w-px bg-foreground/10" aria-hidden />
        {right ?? <Profile ctx={ctx} />}
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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
            <h1 className="mt-3 text-[56px] leading-[1] tracking-tight">
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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
      <div className="flex flex-1 flex-col">
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

/* 12 — Framed Console: single outer wrapper, divider between prompt + controls */
function FramedConsole({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex min-h-screen">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-[780px]">
            <Greeting className="text-center" />
            <div className={`${ctx.panel} mt-6 p-4`}>
              <div className="flex items-center justify-between px-4 pb-3">
                <SessionMark />
                <StatusTicker />
              </div>

              <div className={`${ctx.panelInner} p-4`}>
                <InputBlock ctx={ctx} rows={4} />
                <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                <SecondaryRow ctx={ctx} />
              </div>
            </div>
            <div className="mt-10 flex justify-center"><QuickChips ctx={ctx} limit={5} /></div>
          </div>
        </main>
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
      <div className="flex flex-1 flex-col">
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
  const [light, setLight] = useState(true);
  const [active, setActive] = useState(0);

  const ctx: Ctx = {
    light,
    btn: light ? "btn-mech-light" : "btn-mech",
    panel: light ? "panel-mech-light" : "panel-mech",
    panelInner: light ? "panel-inner-mech-light" : "panel-inner-mech",
  };

  const bg = light ? "#ededeb" : "#0a0a0a";
  const fg = light ? "#111" : "#f0f0f0";
  const wrap = light ? "" : "dark";
  const current = LAYOUTS[active];

  const v12 = LAYOUTS.find((l) => l.id === "12") ?? LAYOUTS[0];
  void active; void setActive;

  return (
    <div className={wrap}>
      <div className="relative min-h-screen text-foreground" style={{ background: bg, color: fg }}>
        {v12.render(ctx)}

        {/* floating theme toggle */}
        <button
          onClick={() => setLight(!light)}
          className={`${ctx.btn} fixed bottom-5 right-5 z-50 flex h-9 w-9 items-center justify-center`}
          aria-label="Toggle theme"
        >
          {light ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
