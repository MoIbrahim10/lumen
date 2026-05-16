import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Paperclip, Mic, Wrench, ArrowUp, Globe, Brain, ChevronDown, Sun, Moon,
  SlidersHorizontal, Menu, EyeOff, FileText, Mail, Code2, Search,
  ScanSearch, Lightbulb, Presentation, Image as ImageIcon,
  ChevronsLeft, Plus, History, Library, FolderClosed, Cpu, Plug,
  Settings, User, ChevronRight, PanelLeft, X,
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

function HoverTip({ label, keys, children, side = "bottom" }: {
  label: string; keys?: string; children: ReactNode; side?: "top" | "bottom";
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
            className={`pointer-events-none absolute left-1/2 z-[60] -translate-x-1/2 ${pos} flex items-center gap-2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-popover-foreground shadow-lg`}
          >
            <span className="opacity-80">{label}</span>
            {keys && (
              <kbd className="rounded-sm border border-border bg-muted/40 px-1.5 py-[1px] text-[9px] tracking-[0.1em]">
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

function SideMenu({ ctx, open, onToggle, placement = "left" }: {
  ctx: Ctx; open: boolean; onToggle: () => void; placement?: "left" | "right";
}) {
  void placement;
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 36, mass: 0.7 }}
          className="flex shrink-0 flex-col gap-2 overflow-hidden border-r border-border bg-background/40"
        >
          <div className="flex w-[240px] items-center justify-between px-3 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">Menu</span>
            <IconBtn ctx={ctx} onClick={onToggle} size={8} tip="Close menu" keys="⌘B">
              <ChevronsLeft className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
          <nav className="flex w-[240px] flex-col gap-1.5 px-2">
            {NAV_ITEMS.map((i, idx) => (
              <motion.button
                key={i.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + idx * 0.035, type: "spring", stiffness: 400, damping: 30 }}
                className={`${ctx.btn} flex h-10 items-center justify-between gap-2 px-3 text-[11px]`}
              >
                <span className="flex items-center gap-2.5">
                  <i.icon className="h-3.5 w-3.5 opacity-70" />
                  {i.label}
                </span>
                <kbd className="font-mono text-[9px] tracking-[0.1em] opacity-40">{i.keys}</kbd>
              </motion.button>
            ))}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
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
      <Dropdown ctx={ctx} value={style} onChange={setStyle} options={["Auto", "Formal", "Friendly", "Concise", "Creative"]} label="Style" />
      <Dropdown ctx={ctx} value={length} onChange={setLength} options={["Short", "Balanced", "Long"]} label="Length" />
      <Dropdown ctx={ctx} value={depth} onChange={setDepth} options={["Quick", "Standard", "Deep"]} label="Depth" />
      <Pill ctx={ctx} onClick={() => setMemory(!memory)}>
        <Brain className="h-3.5 w-3.5" /> Memory {memory ? "on" : "off"}
      </Pill>
      <Pill ctx={ctx} onClick={() => setWeb(!web)}>
        <Globe className="h-3.5 w-3.5" /> Web {web ? "on" : "off"}
      </Pill>
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

  // ⌘K opens search palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-14 items-center justify-between gap-3 px-4">
      {/* left cluster — sidebar toggle + search, grouped */}
      <div className={`${ctx.panel} flex items-center gap-1 p-1`}>
        {onSide && (
          <IconBtn ctx={ctx} onClick={onSide} size={8} tip={sideOpen ? "Close menu" : "Open menu"} keys="⌘B">
            <motion.span
              key={sideOpen ? "open" : "closed"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              className="flex"
            >
              {sideOpen ? <ChevronsLeft className="h-3.5 w-3.5" /> : <PanelLeft className="h-3.5 w-3.5" />}
            </motion.span>
          </IconBtn>
        )}
        <IconBtn ctx={ctx} onClick={() => setSearchOpen(true)} size={8} tip="Search" keys="⌘K">
          <Search className="h-3.5 w-3.5" />
        </IconBtn>
      </div>

      {/* right cluster — temp + preferences + profile, grouped */}
      <div className={`${ctx.panel} flex items-center gap-1 p-1`}>
        <IconBtn ctx={ctx} onClick={onTemp} dim={!temp} size={8} tip={temp ? "Temporary chat on" : "Temporary chat"} keys="⌘⇧T">
          <EyeOff className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn ctx={ctx} size={8} tip="Preferences" keys="⌘,">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </IconBtn>
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
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
