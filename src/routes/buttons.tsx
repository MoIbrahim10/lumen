import { createFileRoute, Link } from "@tanstack/react-router";
import { Paperclip, Mic, Wrench, ArrowUp, Globe, Brain, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/buttons")({ component: ButtonsLab });

type Style = {
  id: string;
  name: string;
  tagline: string;
  mood: string;
  mode: "light" | "dark";
  btn: string;
  send: string;
  chip: string;
  /** optional inner-span wrapper (for nested-frame styles) */
  inner?: boolean;
  bg: string;
  /** optional explicit route override (otherwise /v{idx+1}) */
  route?: string;
  /** optional override classes for individual control slots */
  sendClass?: string;
  chipClass?: string;
  /** wrap the showcase in a nested inner panel */
  panel?: string;
  panelInner?: string;
};

const STYLES: Style[] = [
  {
    id: "emboss",
    name: "Embossed Pill",
    tagline: "Carved aluminum",
    mood: "Calm · pharmaceutical · Braun",
    mode: "light",
    btn: "btn-emboss", send: "btn-emboss", chip: "btn-emboss",
    bg: "bg-[#e9e9e7]",
  },
  {
    id: "mech",
    name: "Mechanical Keycap",
    tagline: "Cherry switch energy",
    mood: "Heavy · machined · monospace",
    mode: "dark",
    btn: "btn-mech", send: "btn-mech", chip: "btn-mech",
    bg: "bg-[#0e0e0e]",
  },
  {
    id: "depth3d",
    name: "Soft Extruded",
    tagline: "Depth without color",
    mood: "Pillowy · chunky · rounded",
    mode: "light",
    btn: "btn-3d", send: "btn-3d", chip: "btn-3d",
    bg: "bg-[#ededeb]",
  },
  {
    id: "penrose",
    name: "Penrose Rhombus",
    tagline: "72° aperiodic",
    mood: "Quasicrystal lean · five-fold symmetry",
    mode: "light",
    btn: "btn-penrose", send: "btn-penrose", chip: "btn-penrose",
    inner: true,
    bg: "bg-[#f3efe6]",
  },
  {
    id: "squircle",
    name: "Iridescent Squircle",
    tagline: "Superellipse chrome",
    mood: "iOS curvature · oil-on-water shimmer",
    mode: "light",
    btn: "btn-squircle", send: "btn-squircle", chip: "btn-squircle",
    inner: true,
    bg: "bg-[#e8e5dc]",
  },
  {
    id: "liquid",
    name: "Liquid Glass",
    tagline: "Acrylic with molded ripples",
    mood: "Glossy 3D · diagonal liquid corners · high-end",
    mode: "light",
    btn: "btn-liquid", send: "btn-liquid", chip: "btn-liquid",
    inner: true,
    bg: "bg-[#e6e8ec]",
  },
  {
    id: "pebble",
    name: "River Pebble",
    tagline: "Polished organic blob",
    mood: "Asymmetric radii · zen stone · morphing on hover",
    mode: "light",
    btn: "btn-pebble", send: "btn-pebble", chip: "btn-pebble",
    bg: "bg-[#e8e4db]",
  },
  {
    id: "inflated",
    name: "Inflated Vinyl",
    tagline: "Pillow stack",
    mood: "Glossy bubble · tall depth stack · Y2K toy",
    mode: "light",
    btn: "btn-inflated", send: "btn-inflated", chip: "btn-inflated",
    inner: true,
    bg: "bg-[#ebe7dc]",
  },
];

function Btn({
  s,
  className = "",
  children,
  size = "md",
}: {
  s: Style;
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const pad =
    size === "sm" ? "h-8 px-3 text-xs" : size === "lg" ? "h-12 px-5 text-sm" : "h-10 px-4 text-sm";
  const cls = `${s.btn} ${pad} inline-flex items-center justify-center gap-2 ${className}`;
  if (s.inner) return <button className={cls}><span>{children}</span></button>;
  return <button className={cls}>{children}</button>;
}

function IconBtn({ s, children }: { s: Style; children: React.ReactNode }) {
  const sizing = s.inner ? "h-10 min-w-10" : "h-10 w-10";
  const cls = `${s.btn} ${sizing} inline-flex items-center justify-center`;
  if (s.inner) return <button className={cls}><span>{children}</span></button>;
  return <button className={cls}>{children}</button>;
}

function StyleCard({ s, idx }: { s: Style; idx: number }) {
  const isDark = s.mode === "dark";
  const text = isDark ? "text-neutral-100" : "text-neutral-900";
  const muted = isDark ? "text-neutral-500" : "text-neutral-500";
  return (
    <article className={`${s.bg} ${text} rounded-xl border border-black/5 overflow-hidden`}>
      {/* Header */}
      <header className="flex items-end justify-between px-6 pt-6">
        <div>
          <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${muted}`}>
            Style {String(idx + 1).padStart(2, "0")} · {s.id}
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-none">{s.name}</h2>
          <p className={`mt-2 text-xs ${muted}`}>{s.mood}</p>
        </div>
        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${muted}`}>
          {s.tagline}
        </span>
      </header>

      {/* Showcase grid */}
      <div className="px-6 py-8 space-y-6">
        {/* Row 1 — icon buttons */}
        <div>
          <p className={`mb-3 font-mono text-[10px] uppercase tracking-[0.2em] ${muted}`}>
            Icon controls
          </p>
          <div className="flex items-center gap-2">
            <IconBtn s={s}><Paperclip className="h-4 w-4" /></IconBtn>
            <IconBtn s={s}><Mic className="h-4 w-4" /></IconBtn>
            <IconBtn s={s}><Wrench className="h-4 w-4" /></IconBtn>
            <IconBtn s={s}><Globe className="h-4 w-4" /></IconBtn>
            <IconBtn s={s}><Brain className="h-4 w-4" /></IconBtn>
          </div>
        </div>

        {/* Row 2 — labelled buttons + dropdown */}
        <div>
          <p className={`mb-3 font-mono text-[10px] uppercase tracking-[0.2em] ${muted}`}>
            Selectors & actions
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Btn s={s}>
              GPT-5 <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Btn>
            <Btn s={s}>
              Friendly <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Btn>
            <Btn s={s} size="sm">Balanced</Btn>
            <Btn s={s} size="sm">Deep think</Btn>
          </div>
        </div>

        {/* Row 3 — quick action chips */}
        <div>
          <p className={`mb-3 font-mono text-[10px] uppercase tracking-[0.2em] ${muted}`}>
            Quick action chips
          </p>
          <div className="flex flex-wrap gap-2">
            {["Summarize doc", "Write email", "Generate UI", "Research", "Brainstorm"].map((q) => (
              <Btn s={s} key={q} size="sm">{q}</Btn>
            ))}
          </div>
        </div>

        {/* Row 4 — primary send */}
        <div>
          <p className={`mb-3 font-mono text-[10px] uppercase tracking-[0.2em] ${muted}`}>
            Primary send
          </p>
          <div className="flex items-center gap-3">
            <button
              className={`${s.send} h-12 w-12 inline-flex items-center justify-center`}
            >
              {s.inner ? <span><ArrowUp className="h-5 w-5" /></span> : <ArrowUp className="h-5 w-5" />}
            </button>
            <Btn s={s} size="lg" className="min-w-[160px]">Send message</Btn>
          </div>
        </div>
      </div>

      {/* Footer pick */}
      <footer className={`flex items-center justify-between border-t ${isDark ? "border-white/10" : "border-black/10"} px-6 py-4`}>
        <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${muted}`}>
          Mode · {s.mode}
        </span>
        <Link
          to={`/v${idx + 1}` as any}
          className={`font-mono text-[10px] uppercase tracking-[0.22em] underline-offset-4 hover:underline ${text}`}
        >
          Open homepage →
        </Link>
      </footer>
    </article>
  );
}

function ButtonsLab() {
  return (
    <div className="min-h-screen bg-[#f7f6f2] text-neutral-900">
      <header className="mx-auto max-w-7xl px-10 pt-20 pb-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">
              Lumen · Button Lab
            </p>
            <h1 className="mt-5 font-serif text-6xl leading-[1.02] tracking-tight md:text-7xl">
              Pick a button.
              <br />
              <span className="text-neutral-400">We'll build the room around it.</span>
            </h1>
          </div>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900"
          >
            ← Index
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Ten button languages, monochrome only. Each card shows the same five
          control families — icon, selector, chip, send — so you can compare
          rhythm, weight, and personality at a glance. Choose one and the entire
          homepage layout will be composed in its voice.
        </p>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-10 pb-24 md:grid-cols-2">
        {STYLES.map((s, i) => (
          <StyleCard key={s.id} s={s} idx={i} />
        ))}
      </main>

      <footer className="mx-auto max-w-7xl px-10 pb-16 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
        Neutral palette · 10 systems · Click "Open homepage" to preview in context
      </footer>
    </div>
  );
}
