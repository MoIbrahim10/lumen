import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus, Search, MessageSquare, Star, FolderKanban, Bot, Bookmark, Share2, Settings,
  Paperclip, Mic, Image as ImageIcon, Globe, Brain, Sparkles, ArrowUp, ChevronDown,
  Command, Clock, FileText, Mail, Code2, Presentation, Lightbulb, Layers, ScanSearch,
  PanelLeftClose, History, Zap, CircleDot,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const styles = ["Auto", "Formal", "Friendly", "Concise", "Creative", "Technical"] as const;

function Home() {
  const [style, setStyle] = useState<(typeof styles)[number]>("Auto");
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="dark">
      <div
        className="relative min-h-screen w-full overflow-hidden text-foreground"
        style={{
          background:
            "radial-gradient(1200px 600px at 80% -10%, oklch(0.26 0 0) 0%, transparent 60%), radial-gradient(900px 500px at -10% 110%, oklch(0.24 0 0) 0%, transparent 55%), oklch(0.13 0 0)",
        }}
      >
        {/* Ambient grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />

        <div className="relative flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main */}
          <main className="flex flex-1 flex-col">
            <TopBar />

            <div className="flex flex-1 flex-col items-center justify-center px-8 pb-24">
              <div className="w-full max-w-[760px]">
                {/* Status pill */}
                <div className="mb-8 flex justify-center">
                  <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 backdrop-blur-xl">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground/80" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Lumen · Online · 12 memories loaded
                    </span>
                  </div>
                </div>

                {/* Greeting */}
                <h1 className="text-center font-serif text-[56px] font-light leading-[1.05] tracking-tight md:text-[64px]">
                  What are we working on,
                  <br />
                  <span className="italic text-muted-foreground">Emma?</span>
                </h1>
                <p className="mt-5 text-center text-[15px] text-muted-foreground">
                  Tuesday evening · You left a draft to Hannah open.{" "}
                  <button className="text-foreground underline-offset-4 hover:underline">Continue where you left off →</button>
                </p>

                {/* Composer */}
                <Composer />

                {/* AI Controls */}
                <AIControls
                  style={style}
                  setStyle={setStyle}
                  length={length}
                  setLength={setLength}
                  depth={depth}
                  setDepth={setDepth}
                  web={web}
                  setWeb={setWeb}
                  memory={memory}
                  setMemory={setMemory}
                  temp={temp}
                  setTemp={setTemp}
                />

                {/* Quick actions */}
                <QuickActions />

                {/* Recent files */}
                <RecentFiles />
              </div>
            </div>

            <FooterBar />
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar() {
  const items = [
    { icon: MessageSquare, label: "Recent chats", count: 184 },
    { icon: Star, label: "Favorites", count: 12 },
    { icon: FolderKanban, label: "Projects", count: 6 },
    { icon: Bot, label: "AI agents", count: 4 },
    { icon: Bookmark, label: "Saved prompts", count: 28 },
    { icon: Share2, label: "Shared", count: 3 },
  ];
  const recent = [
    "Letter to Hannah, third draft",
    "Stripe Q1 — paraphrased notes",
    "Lisbon, three quiet days",
    "Decision tree — the offer",
    "Memo to staff, honest tone",
  ];
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-white/5 bg-white/[0.015] backdrop-blur-xl md:flex">
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <CircleDot className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm tracking-tight">Lumen</span>
        </div>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <button className="mx-4 mt-5 flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left text-sm hover:bg-white/[0.06]">
        <span className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New conversation
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">⌘N</span>
      </button>

      <button className="mx-4 mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-foreground">
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search chats
        </span>
        <span className="font-mono text-[10px]">⌘K</span>
      </button>

      <nav className="mt-6 px-2">
        {items.map((it) => (
          <button
            key={it.label}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          >
            <span className="flex items-center gap-2.5">
              <it.icon className="h-4 w-4" />
              {it.label}
            </span>
            <span className="font-mono text-[10px]">{it.count}</span>
          </button>
        ))}
      </nav>

      <div className="mt-7 px-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Recent</p>
      </div>
      <div className="mt-2 flex-1 overflow-auto px-2 pb-4">
        {recent.map((t, i) => (
          <button
            key={t}
            className="block w-full truncate rounded-md px-3 py-2 text-left text-[13px] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          >
            {t}
            <span className="ml-2 font-mono text-[10px] text-muted-foreground/60">
              {i === 0 ? "2h" : i === 1 ? "Mon" : i === 2 ? "Sun" : i === 3 ? "Fri" : "Thu"}
            </span>
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-white/[0.04]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/5 text-[11px]">
            EM
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px]">Emma Müller</p>
            <p className="truncate text-[11px] text-muted-foreground">Pro · 12 memories</p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}

/* ---------- Top bar ---------- */
function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-8 py-3.5 backdrop-blur-xl">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Home</span>
        <span className="opacity-40">/</span>
        <span className="text-foreground">New conversation</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Command className="h-3.5 w-3.5" />
          <span className="font-mono">⌘K</span>
          <span>Command</span>
        </button>
        <button className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          <History className="h-3.5 w-3.5" /> History
        </button>
        <button className="rounded-md border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          Workspace · Personal
        </button>
      </div>
    </header>
  );
}

/* ---------- Composer ---------- */
function Composer() {
  return (
    <div className="mt-10">
      <div
        className="group relative rounded-[20px] border border-white/10 bg-white/[0.04] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl transition-colors focus-within:border-white/20"
      >
        {/* Soft top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <textarea
          rows={3}
          placeholder="Ask anything. Paste a thought. Drop a file."
          className="block w-full resize-none bg-transparent px-6 pt-5 text-[16px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
        />

        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <div className="flex items-center gap-1">
            <IconBtn icon={Paperclip} hint="Attach file · ⌘U" />
            <IconBtn icon={ImageIcon} hint="Add image" />
            <IconBtn icon={Mic} hint="Dictate · ⌘⇧V" />
            <IconBtn icon={Layers} hint="Connectors" />
            <IconBtn icon={Sparkles} hint="Tools" />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              <Brain className="h-3.5 w-3.5" />
              Lumen 4 · Sonnet
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-[0_8px_24px_-8px_rgba(255,255,255,0.4)] hover:opacity-90">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-2 px-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Drop files anywhere · ⏎ to send · ⇧⏎ for newline
      </p>
    </div>
  );
}

function IconBtn({ icon: Icon, hint }: { icon: any; hint: string }) {
  return (
    <button
      title={hint}
      className="group/btn relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-black/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground opacity-0 backdrop-blur-md transition-opacity group-hover/btn:opacity-100">
        {hint}
      </span>
    </button>
  );
}

/* ---------- AI Controls ---------- */
function AIControls(props: any) {
  const { style, setStyle, length, setLength, depth, setDepth, web, setWeb, memory, setMemory, temp, setTemp } = props;
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
      <Segmented value={style} setValue={setStyle} options={["Auto", "Formal", "Friendly", "Concise", "Creative", "Technical"]} />
      <Pill label="Length" value={length} setValue={setLength} options={["Short", "Balanced", "Long"]} />
      <Pill label="Depth" value={depth} setValue={setDepth} options={["Quick", "Standard", "Deep"]} />
      <Toggle icon={Globe} label="Web" on={web} setOn={setWeb} />
      <Toggle icon={Brain} label="Memory" on={memory} setOn={setMemory} />
      <Toggle icon={Zap} label="Temporary" on={temp} setOn={setTemp} />
    </div>
  );
}

function Segmented({ value, setValue, options }: any) {
  return (
    <div className="flex items-center rounded-full border border-white/8 bg-white/[0.03] p-0.5 backdrop-blur-xl">
      {options.map((o: string) => (
        <button
          key={o}
          onClick={() => setValue(o)}
          className={`rounded-full px-3 py-1 text-[11px] transition-colors ${
            value === o ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Pill({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  const next = () => setValue(options[(i + 1) % options.length]);
  return (
    <button
      onClick={next}
      className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
    >
      <span className="font-mono uppercase tracking-wider opacity-60">{label}</span>
      <span className="text-foreground">{value}</span>
    </button>
  );
}

function Toggle({ icon: Icon, label, on, setOn }: any) {
  return (
    <button
      onClick={() => setOn(!on)}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
        on
          ? "border-white/20 bg-white/10 text-foreground"
          : "border-white/8 bg-white/[0.03] text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span className={`ml-0.5 h-1.5 w-1.5 rounded-full ${on ? "bg-foreground" : "bg-muted-foreground/40"}`} />
    </button>
  );
}

/* ---------- Quick actions ---------- */
function QuickActions() {
  const items = [
    { icon: FileText, label: "Summarize document" },
    { icon: Mail, label: "Write email" },
    { icon: Code2, label: "Generate UI" },
    { icon: ScanSearch, label: "Research topic" },
    { icon: Lightbulb, label: "Brainstorm ideas" },
    { icon: Code2, label: "Code assistant" },
    { icon: Presentation, label: "Create presentation" },
    { icon: ImageIcon, label: "Analyze image" },
  ];
  return (
    <div className="mt-10">
      <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Or start with
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((it) => (
          <button
            key={it.label}
            className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.025] px-3.5 py-2 text-[13px] text-muted-foreground transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-foreground"
          >
            <it.icon className="h-3.5 w-3.5" />
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Recent files ---------- */
function RecentFiles() {
  const files = [
    { name: "Stripe-Q1-2026.pdf", meta: "2.4 MB · paraphrased Mon" },
    { name: "lisbon-itinerary.md", meta: "8 KB · edited Sun" },
    { name: "offer-letter.docx", meta: "42 KB · drafted Fri" },
  ];
  return (
    <div className="mt-12 rounded-2xl border border-white/8 bg-white/[0.02] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Recent files</p>
        </div>
        <button className="text-[11px] text-muted-foreground hover:text-foreground">View all</button>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
        {files.map((f) => (
          <button
            key={f.name}
            className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left hover:border-white/15 hover:bg-white/[0.05]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px]">{f.name}</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{f.meta}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Footer bar ---------- */
function FooterBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/5 bg-black/20 px-8 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>v · Lumen</span>
        <span className="opacity-50">·</span>
        <span>Context 12 / 200</span>
        <span className="opacity-50">·</span>
        <span>Memory · synced</span>
      </div>
      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>⌘K · Command</span>
        <span>⌘N · New</span>
        <span>⌘/ · Shortcuts</span>
      </div>
    </div>
  );
}
