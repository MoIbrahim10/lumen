import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import {
  Paperclip, Mic, Wrench, ArrowUp, Globe, Brain, ChevronDown, Sun, Moon,
  SlidersHorizontal, Menu, EyeOff, FileText, Mail, Code2, Search,
  ScanSearch, Lightbulb, Presentation, Image as ImageIcon,
  Plus, History, Library, FolderClosed, Cpu, Plug,
  Settings, User, ChevronRight, PanelLeft, X, ArrowRight, Check,
  Sparkles, Feather, Smile, Scissors, Wand2,

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
        className={`${ctx.btn} flex items-center gap-1.5 px-3 py-1.5 text-[11px] cursor-pointer select-none`}
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
          animate={{ rotate: open ? 180 : 0 }}
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
              initial={{ opacity: 0, y: -8, scale: 0.95, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, scale: 0.95, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.55 }}
              style={{ transformOrigin: align === "right" ? "top right" : "top left" }}
              onMouseLeave={() => setHoverId(null)}
              className={`absolute top-full z-50 mt-2 w-[260px] overflow-hidden rounded-xl border border-border/60 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-md ${align === "right" ? "right-0" : "left-0"}`}
            >
              {/* dotted grid backdrop */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                }}
              />

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

function LeftPill({ sideOpen, onSide, onSearch }: {
  sideOpen: boolean; onSide?: () => void; onSearch: () => void;
}) {
  return (
    <div
      className="fixed top-3 left-4 z-40 flex items-center p-1 bg-[#f1f1ef] border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-lg"
      style={{ height: 40 }}
    >
      {onSide && (
        <>
          <button
            onClick={onSide}
            aria-label={sideOpen ? "Close menu" : "Open menu"}
            className="p-2 hover:bg-black/[0.04] text-zinc-500 hover:text-zinc-900 rounded-md transition-colors duration-150 cursor-pointer"
          >
            <PanelLeft
              className="h-[18px] w-[18px] transition-transform duration-300 ease-out"
              strokeWidth={2}
              style={{ transform: sideOpen ? "scaleX(-1)" : "scaleX(1)" }}
            />
          </button>
          <span className="w-px h-4 bg-zinc-300/60 mx-1" aria-hidden />
        </>
      )}
      <button
        onClick={onSearch}
        aria-label="Search"
        className="p-2 hover:bg-black/[0.04] text-zinc-500 hover:text-zinc-900 rounded-md transition-colors duration-150 cursor-pointer"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
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

const STATUS_STATES = ["ready", "listening", "thinking", "composing"] as const;
type StatusState = (typeof STATUS_STATES)[number];

/* grayscale depth meter — 5 bars, animation profile per state */
const METER_PROFILES: Record<StatusState, { heights: number[]; duration: number; opacity: number }> = {
  ready:     { heights: [0.30, 0.30, 0.30, 0.30, 0.30], duration: 2.4, opacity: 0.35 },
  listening: { heights: [0.35, 0.55, 0.40, 0.65, 0.30], duration: 1.1, opacity: 0.55 },
  thinking:  { heights: [0.45, 0.75, 0.95, 0.70, 0.40], duration: 0.7, opacity: 0.75 },
  composing: { heights: [0.90, 0.55, 0.85, 0.60, 0.95], duration: 0.45, opacity: 0.85 },
};

function DepthMeter({ state }: { state: StatusState }) {
  const profile = METER_PROFILES[state];
  return (
    <span className="flex h-2.5 items-end gap-[2px] translate-y-[1px]" aria-hidden>
      {profile.heights.map((h, i) => (
        <motion.span
          key={i}
          className="block h-full w-[2px] rounded-[1px] bg-foreground origin-bottom"
          animate={{
            scaleY: state === "ready" ? [h, h, h] : [h * 0.4, h, h * 0.5, h * 0.85, h * 0.3],
            opacity: profile.opacity,
          }}
          transition={{
            duration: profile.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * (profile.duration / 12),
          }}
        />
      ))}
    </span>
  );
}

function StatusTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % STATUS_STATES.length), 3200);
    return () => clearInterval(t);
  }, []);
  const word = STATUS_STATES[idx];

  return (
    <motion.span
      layout
      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] opacity-70"
    >
      <DepthMeter state={word} />
      <span className="relative inline-flex overflow-hidden" style={{ height: "1em" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={word}
            initial={{ y: "-100%", opacity: 0, filter: "blur(3px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "100%", opacity: 0, filter: "blur(3px)" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block leading-none"
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
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
    <h1 className={`text-[34px] leading-[1.05] tracking-tight md:text-[42px] ${className}`}>
      What's on your mind, <span className="uppercase">Emma?</span>
    </h1>
  );
}

function InputBlock({ ctx, rows = 3 }: { ctx: Ctx; rows?: number }) {
  const [value, setValue] = useState("");
  const [streaming, setStreaming] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const unsub = promptBus.subscribe((text) => {
      setValue("");
      setStreaming(true);
      ref.current?.focus();
      let i = 0;
      const tick = () => {
        i += 1;
        setValue(text.slice(0, i));
        if (i < text.length) {
          // variable speed: faster for spaces, slight jitter for life
          const ch = text[i - 1];
          const delay = ch === " " ? 14 : 18 + Math.random() * 22;
          window.setTimeout(tick, delay);
        } else {
          setStreaming(false);
        }
      };
      tick();
    });
    return () => { unsub(); };
  }, []);


  return (
    <div className="relative">
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => setValue(e.target.value)}
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


function PrimaryRow({ ctx }: { ctx: Ctx }) {
  const [model, setModel] = useState<(typeof MODEL_OPTIONS)[number]>("Lumen 4");
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <IconBtn ctx={ctx} tip="Attach file" keys="⌘U"><Paperclip className="h-4 w-4" /></IconBtn>
        <IconBtn ctx={ctx} tip="Tools & connectors" keys="⌘T"><Wrench className="h-4 w-4" /></IconBtn>
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
        <IconBtn ctx={ctx} tip="Dictate" keys="⌘⇧V"><Mic className="h-4 w-4" /></IconBtn>
        <IconBtn ctx={ctx} tip="Send" keys="↵"><ArrowUp className="h-4 w-4" /></IconBtn>
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
      {/* fixed pill stays in same place; menu bg expands from behind it */}
      <LeftPill sideOpen={!!sideOpen} onSide={onSide} onSearch={() => setSearchOpen(true)} />
      <div />


      {/* right cluster — temp + preferences + profile */}
      <div className="flex items-center bg-white border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] rounded-lg p-1 gap-0.5">
        <button
          onClick={onTemp}
          aria-label={temp ? "Temporary chat on" : "Temporary chat"}
          className={`p-2 hover:bg-zinc-50 hover:text-zinc-900 rounded-md transition-all duration-200 cursor-pointer ${temp ? "text-zinc-900" : "text-zinc-400"}`}
        >
          <EyeOff className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <button
          aria-label="Preferences"
          className="p-2 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 rounded-md transition-all duration-200 cursor-pointer"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <span className="w-px h-4 bg-zinc-200/60 mx-1" aria-hidden />
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
                <IconBtn ctx={ctx} size={8}><Mic className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn ctx={ctx} size={8} onClick={() => setShowOpts(!showOpts)}><ChevronDown className={`h-3.5 w-3.5 transition-transform ${showOpts ? "rotate-180" : ""}`} /></IconBtn>
              </div>
              <IconBtn ctx={ctx} size={8}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
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
                  <IconBtn ctx={ctx} size={8}><Mic className="h-3.5 w-3.5" /></IconBtn>
                </div>
                <div className="flex items-center gap-1.5">
                  <Pill ctx={ctx}><Brain className="h-3.5 w-3.5" /> Memory</Pill>
                  <Pill ctx={ctx}><Globe className="h-3.5 w-3.5" /> Web</Pill>
                  <IconBtn ctx={ctx} size={8}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
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
