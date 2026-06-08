import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import { motion } from "motion/react";
import {
  Github, FileText, Hash, FolderClosed, Calendar, Database,
  type LucideIcon,
} from "lucide-react";


// export const Route = createFileRoute("/connectors")({ component: ConnectorsLab });

type Status = "active" | "linked" | "needs_auth";
type Conn = { id: string; label: string; icon: LucideIcon; status: Status };

const DEMO: Conn[] = [
  { id: "github",   label: "GitHub",       icon: Github,       status: "active"     },
  { id: "notion",   label: "Notion",       icon: FileText,     status: "linked"     },
  { id: "slack",    label: "Slack",        icon: Hash,         status: "needs_auth" },
  { id: "drive",    label: "Drive",        icon: FolderClosed, status: "linked"     },
  { id: "calendar", label: "Calendar",     icon: Calendar,     status: "needs_auth" },
  { id: "db",       label: "Postgres",     icon: Database,     status: "linked"     },
];

function useLocalToggle(initial: Conn[]) {
  const [conns, setConns] = useState(initial);
  const toggle = (id: string) => setConns((cs) =>
    cs.map((c) => c.id === id && c.status !== "needs_auth"
      ? { ...c, status: c.status === "active" ? "linked" : "active" } as Conn
      : c
    )
  );
  return { conns, toggle };
}

/* ───────── 10 variants ───────── */

/* 1 — Icon Grid (current production style) */
function V01_IconGrid() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {conns.map((c) => {
        const on = c.status === "active";
        const needs = c.status === "needs_auth";
        const Icon = c.icon;
        return (
          <motion.button
            key={c.id}
            onClick={() => toggle(c.id)}
            whileTap={{ scale: 0.9 }}
            title={c.label}
            className={`relative flex aspect-square items-center justify-center rounded-md border transition-all ${
              on ? "border-emerald-500/60 bg-emerald-500/[0.12] text-emerald-600"
                 : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {on && (
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-emerald-500"
              />
            )}
            {needs && (
              <span className="absolute right-0 top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-500/30 text-amber-600">
                <span className="font-mono text-[7px] font-bold">!</span>
              </span>
            )}
            <Icon className="h-4 w-4" />
          </motion.button>
        );
      })}
    </div>
  );
}

/* 2 — Pill List */
function V02_PillList() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="flex flex-wrap gap-1.5">
      {conns.map((c) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const Icon = c.icon;
        return (
          <motion.button
            key={c.id}
            onClick={() => toggle(c.id)}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all ${
              on   ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700"
              : needs ? "border-amber-400/50 bg-amber-50 text-amber-700"
              : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span>{c.label}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${
              on ? "bg-emerald-500" : needs ? "bg-amber-500" : "bg-neutral-400/50"
            }`} />
          </motion.button>
        );
      })}
    </div>
  );
}

/* 3 — Stacked Cards */
function V03_StackedCards() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="grid grid-cols-3 gap-2">
      {conns.map((c) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const Icon = c.icon;
        return (
          <div key={c.id} className={`rounded-lg border bg-white p-2.5 ${on ? "border-emerald-400/70" : "border-neutral-200"}`}>
            <div className="flex items-center justify-between">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${on ? "bg-emerald-500/15 text-emerald-600" : "bg-neutral-100 text-neutral-700"}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {on && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </div>
            <div className="mt-2 text-[11px] font-medium text-neutral-900">{c.label}</div>
            <button
              onClick={() => toggle(c.id)}
              disabled={needs}
              className={`mt-1 w-full rounded-md py-1 text-[10px] font-medium transition-colors ${
                needs ? "bg-amber-50 text-amber-700 cursor-default"
                : on  ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {needs ? "Authenticate" : on ? "Connected" : "Connect"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* 4 — Mono Chips (text only) */
function V04_MonoChips() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
      {conns.map((c) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const glyph = on ? "●" : needs ? "!" : "○";
        return (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className={`group inline-flex items-center gap-1.5 ${
              on ? "text-emerald-600" : needs ? "text-amber-600" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span className="w-2 text-center">{glyph}</span>
            <span className="lowercase tracking-tight">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* 5 — Avatar Stack */
function V05_AvatarStack() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="flex items-center -space-x-2">
      {conns.map((c, i) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const Icon = c.icon;
        return (
          <motion.button
            key={c.id}
            onClick={() => toggle(c.id)}
            whileHover={{ y: -4, scale: 1.08, zIndex: 20 }}
            style={{ zIndex: 10 - i }}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white ${
              on ? "bg-emerald-500 text-white shadow-md"
              : needs ? "bg-amber-100 text-amber-700"
              : "bg-neutral-100 text-neutral-700"
            }`}
            title={c.label}
          >
            <Icon className="h-4 w-4" />
            {on && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
            {needs && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />}
          </motion.button>
        );
      })}
    </div>
  );
}

/* 6 — Switchboard */
function V06_Switchboard() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="grid grid-cols-2 gap-1">
      {conns.map((c) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const Icon = c.icon;
        return (
          <div key={c.id} className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded ${on ? "bg-emerald-500/15 text-emerald-600" : needs ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-700"}`}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-[11px] text-neutral-900">{c.label}</span>
            </div>
            {needs ? (
              <span className="font-mono text-[8px] uppercase tracking-wider text-amber-600">Auth</span>
            ) : (
              <button
                onClick={() => toggle(c.id)}
                aria-pressed={on}
                className={`relative h-4 w-7 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-neutral-300"}`}
              >
                <motion.span
                  animate={{ x: on ? 12 : 2 }}
                  transition={{ type: "spring", stiffness: 520, damping: 30 }}
                  className="absolute top-0.5 inline-block h-3 w-3 rounded-full bg-white shadow"
                />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* 7 — Terminal */
function V07_Terminal() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="rounded-md bg-neutral-950 p-2 font-mono text-[11px] text-neutral-300">
      {conns.map((c) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const tag = on ? "[on] " : needs ? "[auth?] " : "[off] ";
        const color = on ? "text-emerald-400" : needs ? "text-amber-400" : "text-neutral-500";
        return (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className="block w-full text-left hover:bg-white/[0.04] px-1.5 rounded"
          >
            <span className="text-neutral-600">$ conn </span>
            <span className={color}>{tag}</span>
            <span className="text-neutral-200">{c.label.toLowerCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

/* 8 — Mech Keycap */
function V08_MechKeycap() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="flex flex-wrap gap-1.5">
      {conns.map((c) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className={`btn-mech-light relative flex h-11 w-11 items-center justify-center ${on ? "ring-2 ring-emerald-500/60" : ""}`}
            title={c.label}
          >
            <Icon className={`h-4 w-4 ${on ? "text-emerald-600" : ""}`} />
            {on && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            {needs && <span className="absolute right-0.5 top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white">!</span>}
          </button>
        );
      })}
    </div>
  );
}

/* 9 — Glass Tile */
function V09_GlassTile() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div
      className="grid grid-cols-3 gap-2 rounded-lg p-3"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
    >
      {conns.map((c) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const Icon = c.icon;
        return (
          <motion.button
            key={c.id}
            onClick={() => toggle(c.id)}
            whileTap={{ scale: 0.94 }}
            className="relative flex aspect-square flex-col items-center justify-center gap-1 rounded-md border backdrop-blur-md transition-all"
            style={{
              background: on ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.06)",
              borderColor: on ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.15)",
              boxShadow: on ? "0 0 24px -4px rgba(16,185,129,0.4)" : "none",
            }}
          >
            <Icon className={`h-4 w-4 ${on ? "text-emerald-300" : needs ? "text-amber-300" : "text-white/70"}`} />
            <span className="text-[9px] font-medium text-white/85">{c.label}</span>
            {needs && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />}
          </motion.button>
        );
      })}
    </div>
  );
}

/* 10 — Index Card */
function V10_IndexCard() {
  const { conns, toggle } = useLocalToggle(DEMO);
  return (
    <div className="grid grid-cols-2 gap-2">
      {conns.map((c) => {
        const on = c.status === "active"; const needs = c.status === "needs_auth";
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className="group flex items-center gap-2 rounded-sm border border-amber-900/15 px-2.5 py-2 text-left transition-all hover:border-amber-900/30"
            style={{
              background: "repeating-linear-gradient(0deg, #f6f1e6 0, #f6f1e6 14px, #ebe3cf 14px, #ebe3cf 15px)",
            }}
          >
            <Icon className="h-3.5 w-3.5 text-amber-900/70" />
            <span className="flex-1 font-serif text-[12px] italic text-amber-950">{c.label}</span>
            <span className={`font-mono text-[9px] uppercase tracking-wider underline decoration-dotted underline-offset-2 ${
              on ? "text-emerald-700" : needs ? "text-amber-700" : "text-amber-900/40"
            }`}>
              {on ? "on" : needs ? "auth" : "off"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const VARIANTS: { id: string; name: string; tagline: string; render: ComponentType }[] = [
  { id: "01", name: "Icon Grid",     tagline: "Current — compact squares, pulse dot when active", render: V01_IconGrid },
  { id: "02", name: "Pill List",     tagline: "Horizontal pills with trailing status dot",         render: V02_PillList },
  { id: "03", name: "Stacked Cards", tagline: "Card per connector with explicit CTA",              render: V03_StackedCards },
  { id: "04", name: "Mono Chips",    tagline: "Text-only with leading glyph (●/○/!)",              render: V04_MonoChips },
  { id: "05", name: "Avatar Stack",  tagline: "Overlapping circles, lift on hover",                render: V05_AvatarStack },
  { id: "06", name: "Switchboard",   tagline: "Two-col rows with real toggle on right",            render: V06_Switchboard },
  { id: "07", name: "Terminal",      tagline: "Monospace command-line with [on]/[off]/[auth?]",    render: V07_Terminal },
  { id: "08", name: "Mech Keycap",   tagline: "3D keycap, depresses on tap",                       render: V08_MechKeycap },
  { id: "09", name: "Glass Tile",    tagline: "Frosted dark squares with glow when active",        render: V09_GlassTile },
  { id: "10", name: "Index Card",    tagline: "Ruled paper card with serif label",                 render: V10_IndexCard },
];

function StatusLegend() {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> active</span>
      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-neutral-400/60" /> linked</span>
      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> needs auth</span>
    </div>
  );
}

function VariantCard({ v, i }: { v: typeof VARIANTS[number]; i: number }) {
  const R = v.render;
  return (
    <article className="overflow-hidden rounded-xl border border-neutral-200 bg-[#fafaf8]">
      <header className="flex items-end justify-between px-5 pt-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            Variant {String(i + 1).padStart(2, "0")} · {v.id}
          </p>
          <h2 className="mt-2 font-serif text-2xl leading-none text-neutral-900">{v.name}</h2>
          <p className="mt-1.5 text-[11px] text-neutral-500">{v.tagline}</p>
        </div>
      </header>
      <div className="px-5 pb-5 pt-5">
        <div className="rounded-lg bg-white p-4 ring-1 ring-neutral-200/80">
          <R />
        </div>
      </div>
      <footer className="flex items-center justify-between border-t border-neutral-200/80 px-5 py-3">
        <StatusLegend />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-400">
          Click to toggle
        </span>
      </footer>
    </article>
  );
}

function ConnectorsLab() {
  return (
    <div className="min-h-screen bg-[#f7f6f2] text-neutral-900">
      <header className="mx-auto max-w-7xl px-10 pt-20 pb-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">
              Lumen · Connectors Lab
            </p>
            <h1 className="mt-5 font-serif text-6xl leading-[1.02] tracking-tight md:text-7xl">
              Pick a connector look.
              <br />
              <span className="text-neutral-400">Ten ways to wear the same six tools.</span>
            </h1>
          </div>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900"
          >
            ← Layout
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Same six connectors (GitHub, Notion, Slack, Drive, Calendar, Postgres),
          same three states (active · linked · needs auth). Click any item in any
          variant — they all toggle for real. Pick one and tell me to wire it
          into the composer.
        </p>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-10 pb-24 md:grid-cols-2">
        {VARIANTS.map((v, i) => <VariantCard key={v.id} v={v} i={i} />)}
      </main>

      <footer className="mx-auto max-w-7xl px-10 pb-16 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
        10 variants · all interactive · monochrome chrome, accent reserved for state
      </footer>
    </div>
  );
}
