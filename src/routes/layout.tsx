import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import {
  Paperclip, Mic, Wrench, ArrowUp, Globe, Brain, ChevronDown, Sun, Moon,
  SlidersHorizontal, Menu, EyeOff, FileText, Mail, Code2, Search,
  ScanSearch, Lightbulb, Presentation, Image as ImageIcon,
  Plus, History, Library, FolderClosed, Cpu, Plug,
  Settings, User, ChevronRight, PanelLeft, X,
  Sparkles, Feather, Smile, Scissors, Wand2,
} from "lucide-react";
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup,
  CommandItem, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/layout")({ component: LayoutGallery });

/* ───────────────────────── shared bits ───────────────────────── */

type Ctx = {
  light: boolean;
  btn: string;
  panel: string;
  panelInner: string;
};

const QUICK = [
  { icon: FileText, label: "Summarize document" },
  { icon: Mail, label: "Write email" },
  { icon: Code2, label: "Generate UI" },
  { icon: ScanSearch, label: "Research topic" },
  { icon: Lightbulb, label: "Brainstorm ideas" },
  { icon: Code2, label: "Code assistant" },
  { icon: Presentation, label: "Create presentation" },
  { icon: ImageIcon, label: "Create image" },
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
            initial={{ opacity: 0, y: side === "top" ? 4 : -4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === "top" ? 4 : -4, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 520, damping: 32, mass: 0.5 }}
            className={`pointer-events-none absolute left-1/2 z-[60] -translate-x-1/2 ${pos} ${desc ? "flex-col items-start max-w-[200px] whitespace-normal" : "flex items-center gap-2 whitespace-nowrap"} flex rounded-md border border-border bg-popover px-2.5 py-1.5 text-popover-foreground shadow-lg`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-80">{label}</span>
            {desc && (
              <span className="mt-0.5 text-[11px] leading-snug opacity-60 normal-case tracking-normal">
                {desc}
              </span>
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
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className={`${ctx.btn} relative flex h-[30px] w-[30px] items-center justify-center`}
      >
        <motion.span
          animate={{ color: on ? "#10b981" : "var(--muted-foreground)" }}
          transition={{ duration: 0.2 }}
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

/* ───────── Style picker — horizontal ribbon unfurl ───────── */

const STYLE_OPTIONS = [
  { id: "Auto", icon: Sparkles },
  { id: "Formal", icon: Feather },
  { id: "Friendly", icon: Smile },
  { id: "Concise", icon: Scissors },
  { id: "Creative", icon: Wand2 },
];

function StylePicker({ ctx, value, onChange }: {
  ctx: Ctx; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const longest = STYLE_OPTIONS.reduce((a, b) => (a.id.length >= b.id.length ? a : b)).id;
  const indicatorId = hover ?? value;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${ctx.btn} flex items-center gap-1.5 px-3 py-1.5 text-[11px]`}
      >
        <span className="opacity-60">Style</span>
        <span className="relative inline-block text-left">
          <span className="invisible">{longest}</span>
          <span className="absolute inset-0">{value}</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="inline-flex"
        >
          <ChevronDown className="h-3 w-3 opacity-60" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); }}
            />
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
              animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
              exit={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
              transition={{
                clipPath: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.18 },
              }}
              style={{ transformOrigin: "left center" }}
              onMouseLeave={() => setHover(null)}
              className="absolute left-0 top-full z-50 mt-2 flex items-center gap-0.5 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg"
            >
              <LayoutGroup id="style-picker">
                {STYLE_OPTIONS.map((s, i) => {
                  const lit = indicatorId === s.id;
                  const selected = value === s.id;
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.06 + i * 0.035,
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => { onChange(s.id); setOpen(false); }}
                      onMouseEnter={() => setHover(s.id)}
                      className="relative flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider"
                    >
                      {lit && (
                        <motion.span
                          layoutId="style-indicator"
                          transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.5 }}
                          className="absolute inset-0 rounded-[4px] bg-foreground"
                        />
                      )}
                      <span
                        className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                          lit ? "text-background" : selected ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <s.icon className="h-3 w-3" />
                        {s.id}
                      </span>
                    </motion.button>
                  );
                })}
              </LayoutGroup>
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
            transition={{ type: "spring", stiffness: 380, damping: 28, delay: i * 0.04 }}
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
            strokeWidth="1"
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
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
      />
    </svg>
  );
}


function CycleButton({
  ctx, label, options, value, onChange, glyph,
}: {
  ctx: Ctx;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  glyph: (i: number) => ReactNode;
}) {
  const index = Math.max(0, options.indexOf(value));
  const [bump, setBump] = useState(0);

  const cycle = () => {
    const next = options[(index + 1) % options.length];
    onChange(next);
    setBump((b) => b + 1);
  };

  return (
    <HoverTip label={`${label}: ${value}`}>
      <motion.button
        type="button"
        onClick={cycle}
        aria-label={`${label}: ${value}`}
        animate={{ scale: bump ? [1, 0.96, 1] : 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={`${ctx.btn} flex items-center gap-1.5 px-3 py-1.5 text-[11px] cursor-pointer select-none`}
      >
        <span className="opacity-60">{label}</span>
        <motion.span
          key={`g-${index}`}
          initial={{ rotate: -8, scale: 0.85, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 460, damping: 24 }}
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

/* ───────── composer fragments (greeting + input + controls) ───────── */

function Greeting({ className = "" }: { className?: string }) {
  return (
    <h1 className={`text-[34px] leading-[1.05] tracking-tight md:text-[42px] ${className}`}>
      What's on your mind, <span className="uppercase">Emma?</span>
    </h1>
  );
}

function InputBlock({ ctx, rows = 3 }: { ctx: Ctx; rows?: number }) {
  return (
    <textarea
      rows={rows}
      placeholder="Type a prompt …"
      className="w-full resize-none bg-transparent text-[15px] leading-relaxed placeholder:opacity-40 focus:outline-none"
      style={{ color: "inherit" }}
    />
  );
}

function PrimaryRow({ ctx }: { ctx: Ctx }) {
  const [model, setModel] = useState("Lumen 4");
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <IconBtn ctx={ctx} tip="Attach file" keys="⌘U"><Paperclip className="h-4 w-4" /></IconBtn>
        <IconBtn ctx={ctx} tip="Tools & connectors" keys="⌘T"><Wrench className="h-4 w-4" /></IconBtn>
        <Dropdown ctx={ctx} value={model} onChange={setModel} options={["Lumen 4", "Lumen 4 Mini", "Lumen 4 Pro"]} label="Model" />
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
      <StylePicker ctx={ctx} value={style} onChange={setStyle} />
      <CycleButton
        ctx={ctx} label="Length" value={length} onChange={setLength}
        options={["Short", "Balanced", "Long"] as const}
        glyph={(i) => <LengthGlyph index={i} />}
      />
      <CycleButton
        ctx={ctx} label="Depth" value={depth} onChange={setDepth}
        options={["Quick", "Standard", "Deep"] as const}
        glyph={(i) => <DepthGlyph index={i} />}
      />
      <TogglePill
        ctx={ctx} on={memory} onClick={() => setMemory(!memory)}
        label="Memory" desc="Recall facts across chats"
        icon={<Brain className="h-3.5 w-3.5" />}
      />
      <TogglePill
        ctx={ctx} on={web} onClick={() => setWeb(!web)}
        label="Web" desc="Search the live web for answers"
        icon={<Globe className="h-3.5 w-3.5" />}
      />

    </div>
  );
}


function QuickChips({ ctx, limit = 8 }: { ctx: Ctx; limit?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {QUICK.slice(0, limit).map((a) => (
        <button key={a.label} className={`${ctx.btn} flex items-center gap-1.5 px-3 py-1.5 text-[11px]`}>
          <a.icon className="h-3.5 w-3.5" /> {a.label}
        </button>
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
            <div className="mt-6 flex justify-center"><QuickChips ctx={ctx} /></div>
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
          <div className="mt-6"><QuickChips ctx={ctx} /></div>
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
          <div className="mt-6"><QuickChips ctx={ctx} /></div>
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
            <div className="mt-6"><QuickChips ctx={ctx} /></div>
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
            <div className="mt-6"><QuickChips ctx={ctx} limit={5} /></div>
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
            <div className="mt-6 flex justify-center"><QuickChips ctx={ctx} limit={6} /></div>
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
    <div className="flex h-full">
      <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />
      <div className="flex flex-1 flex-col">
        <TopBar ctx={ctx} sideOpen={side} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-[780px]">
            <Greeting className="text-center" />
            <div className={`${ctx.panel} mt-6 p-4`}>
              <div className="flex items-center justify-between px-2 pb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">Compose</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-40">Lumen 4 · ready</span>
              </div>
              <div className={`${ctx.panelInner} p-4`}>
                <InputBlock ctx={ctx} rows={4} />
                <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                <SecondaryRow ctx={ctx} />
              </div>
            </div>
            <div className="mt-6 flex justify-center"><QuickChips ctx={ctx} limit={5} /></div>
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
            <div className="mt-6 flex justify-center"><QuickChips ctx={ctx} limit={6} /></div>
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
