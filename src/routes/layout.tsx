import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import {
  Paperclip, Mic, Wrench, ArrowUp, Globe, Brain, ChevronDown, Sun, Moon,
  Settings, User, Menu, EyeOff, Gauge, Ruler, FileText, Mail, Code2,
  ScanSearch, Lightbulb, Presentation, Image as ImageIcon, ChevronRight,
  PanelLeft, X,
} from "lucide-react";

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

function IconBtn({ ctx, children, onClick, dim = false, size = 9 }: {
  ctx: Ctx; children: ReactNode; onClick?: () => void; dim?: boolean; size?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`${ctx.btn} flex items-center justify-center ${dim ? "opacity-40" : ""}`}
      style={{ width: size * 4, height: size * 4 }}
    >
      {children}
    </button>
  );
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
        className={`${ctx.btn} flex h-9 items-center gap-2 px-2 text-[11px]`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] text-background">EM</span>
        <span>Emma</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg ${align === "right" ? "right-0" : "left-0"}`}>
            {["Account", "Billing", "Workspace", "Sign out"].map((o) => (
              <div key={o} className="block px-3 py-2 text-xs hover:bg-muted cursor-pointer">{o}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SideMenu({ ctx, open, onToggle, placement = "left" }: {
  ctx: Ctx; open: boolean; onToggle: () => void; placement?: "left" | "right";
}) {
  const items = ["New chat", "Library", "Projects", "Memory", "Connectors", "Models", "History"];
  return (
    <aside
      className={`flex shrink-0 flex-col gap-2 border-${placement === "left" ? "r" : "l"} border-border bg-background/40 transition-all`}
      style={{ width: open ? 220 : 56 }}
    >
      <div className={`flex items-center ${open ? "justify-between" : "justify-center"} px-2 py-3`}>
        {open && <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Menu</span>}
        <IconBtn ctx={ctx} onClick={onToggle} size={8}>
          {open ? <X className="h-3.5 w-3.5" /> : <PanelLeft className="h-3.5 w-3.5" />}
        </IconBtn>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {items.map((i) => (
          <button key={i} className={`${ctx.btn} flex h-9 items-center ${open ? "justify-start px-3" : "justify-center"} text-[11px]`}>
            {open ? i : i[0]}
          </button>
        ))}
      </nav>
    </aside>
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
        <IconBtn ctx={ctx}><Paperclip className="h-4 w-4" /></IconBtn>
        <IconBtn ctx={ctx}><Wrench className="h-4 w-4" /></IconBtn>
        <Dropdown ctx={ctx} value={model} onChange={setModel} options={["Lumen 4", "Lumen 4 Mini", "Lumen 4 Pro"]} label="Model" />
      </div>
      <div className="flex items-center gap-1.5">
        <IconBtn ctx={ctx}><Mic className="h-4 w-4" /></IconBtn>
        <IconBtn ctx={ctx}><ArrowUp className="h-4 w-4" /></IconBtn>
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
  return (
    <div className="flex h-14 items-center justify-between gap-3 border-b border-border px-4">
      <div className="flex items-center gap-3">
        {onSide && (
          <IconBtn ctx={ctx} onClick={onSide} size={8}>
            <Menu className="h-3.5 w-3.5" />
          </IconBtn>
        )}
        <span className="font-mono text-[12px] uppercase tracking-[0.22em]">Lumen</span>
      </div>
      <div className="flex items-center gap-2">
        <Pill ctx={ctx} onClick={onTemp}>
          <EyeOff className="h-3.5 w-3.5" /> {temp ? "Temporary on" : "Temporary"}
        </Pill>
        <IconBtn ctx={ctx} size={8}><Settings className="h-3.5 w-3.5" /></IconBtn>
        {right ?? <Profile ctx={ctx} />}
      </div>
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
];

/* 01 */
function Centered({ ctx }: { ctx: Ctx }) {
  const [side, setSide] = useState(false);
  const [temp, setTemp] = useState(false);
  return (
    <div className="flex h-full">
      {side && <SideMenu ctx={ctx} open={side} onToggle={() => setSide(false)} />}
      <div className="flex flex-1 flex-col">
        <TopBar ctx={ctx} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-[760px]">
            <Greeting className="text-center" />
            <div className={`${ctx.btn} mt-6 p-5`}>
              <InputBlock ctx={ctx} />
              <div className="mt-3"><PrimaryRow ctx={ctx} /></div>
            </div>
            <div className={`${ctx.btn} mt-3 px-3 py-2`}>
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
        <TopBar ctx={ctx} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
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
        <TopBar ctx={ctx} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
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
        <TopBar ctx={ctx} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
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
        <TopBar ctx={ctx} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
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
        <TopBar ctx={ctx} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
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
        <TopBar ctx={ctx} onSide={() => setSide(!side)} onTemp={() => setTemp(!temp)} temp={temp} />
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

/* ───────────────────────── gallery shell ───────────────────────── */

function LayoutGallery() {
  const [light, setLight] = useState(true);
  const [active, setActive] = useState(0);

  const ctx: Ctx = {
    light,
    btn: light ? "btn-mech-light" : "btn-mech",
  };

  const bg = light ? "#ededeb" : "#0a0a0a";
  const fg = light ? "#111" : "#f0f0f0";
  const wrap = light ? "" : "dark";
  const current = LAYOUTS[active];

  return (
    <div className={wrap}>
      <div className="min-h-screen text-foreground" style={{ background: bg, color: fg }}>
        {/* gallery header */}
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">Style 02 · Mechanical Keycap</p>
            <h2 className="mt-1 font-mono text-sm uppercase tracking-[0.2em]">Layout Gallery — 10 directions</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLight(!light)}
              className={`${ctx.btn} flex items-center gap-2 px-3 py-1.5 text-[11px]`}
            >
              {light ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {light ? "Light" : "Dark"}
            </button>
            <Link to="/" className={`${ctx.btn} px-3 py-1.5 text-[11px]`}>← Home</Link>
          </div>
        </header>

        {/* tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-border px-6 py-3">
          {LAYOUTS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setActive(i)}
              className={`${ctx.btn} px-3 py-1.5 text-[11px] ${active === i ? "" : "opacity-60"}`}
            >
              {l.id} · {l.name}
            </button>
          ))}
        </div>

        {/* meta */}
        <div className="px-6 pt-4 font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
          {current.id} — {current.tagline}
        </div>

        {/* stage */}
        <div className="p-6">
          <div
            className="overflow-hidden rounded-lg border border-border"
            style={{ background: bg, height: "calc(100vh - 220px)", minHeight: 640 }}
          >
            {current.render(ctx)}
          </div>
        </div>
      </div>
    </div>
  );
}
