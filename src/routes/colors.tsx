import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/colors")({ component: ColorsPage });

type Palette = {
  id: string;
  name: string;
  mood: string;
  bg: string;
  surface: string;
  surfaceInner: string;
  border: string;
  text: string;
  textDim: string;
  accent: string;
  accentText: string;
};

const PALETTES: Palette[] = [
  {
    id: "01", name: "Graphite Ink", mood: "default · neutral keycap",
    bg: "#ededeb", surface: "#fafafa", surfaceInner: "#f3f3f1",
    border: "#c2c2c2", text: "#111", textDim: "#6b6b6b",
    accent: "#111", accentText: "#fafafa",
  },
  {
    id: "02", name: "Obsidian", mood: "deep matte · cinema black",
    bg: "#0a0a0a", surface: "#161616", surfaceInner: "#0e0e0e",
    border: "#000", text: "#f0f0f0", textDim: "#8a8a8a",
    accent: "#f0f0f0", accentText: "#0a0a0a",
  },
  {
    id: "03", name: "Bone Paper", mood: "warm off-white editorial",
    bg: "#f4efe7", surface: "#fbf8f2", surfaceInner: "#f0ebe1",
    border: "#d9d1c1", text: "#1a1612", textDim: "#7a7064",
    accent: "#2d2620", accentText: "#fbf8f2",
  },
  {
    id: "04", name: "Midnight Indigo", mood: "after-hours tech",
    bg: "#0c0d1a", surface: "#161830", surfaceInner: "#0f1124",
    border: "#1f2240", text: "#e9eaf5", textDim: "#7a7e9b",
    accent: "#7c7cff", accentText: "#0c0d1a",
  },
  {
    id: "05", name: "Forest Moss", mood: "organic · grounded",
    bg: "#0f1a14", surface: "#172620", surfaceInner: "#101a15",
    border: "#1f3329", text: "#e7eee8", textDim: "#7c9387",
    accent: "#8fc99a", accentText: "#0f1a14",
  },
  {
    id: "06", name: "Ember Charcoal", mood: "warm dark · ember accent",
    bg: "#141210", surface: "#1f1c19", surfaceInner: "#141210",
    border: "#2a2622", text: "#f1ece6", textDim: "#8b8378",
    accent: "#e85d3a", accentText: "#141210",
  },
  {
    id: "07", name: "Acid Lime", mood: "raw · electric · bold",
    bg: "#0a0a0a", surface: "#161616", surfaceInner: "#0e0e0e",
    border: "#000", text: "#f0f0f0", textDim: "#8a8a8a",
    accent: "#c6ff3a", accentText: "#0a0a0a",
  },
  {
    id: "08", name: "Cream & Cocoa", mood: "soft · approachable",
    bg: "#f6f0e6", surface: "#fdfaf3", surfaceInner: "#f1ebe0",
    border: "#d5c9b5", text: "#3a2a1d", textDim: "#8a7866",
    accent: "#7a4a2a", accentText: "#fdfaf3",
  },
  {
    id: "09", name: "Arctic Frost", mood: "crisp · airy SaaS",
    bg: "#e9eef4", surface: "#fbfcfe", surfaceInner: "#eef2f8",
    border: "#c4cdd9", text: "#0f1c2e", textDim: "#5b6b80",
    accent: "#2e6b8a", accentText: "#fbfcfe",
  },
  {
    id: "10", name: "Plasma Violet", mood: "synth · futurist",
    bg: "#0d0a14", surface: "#1a1326", surfaceInner: "#120d1c",
    border: "#241a36", text: "#efe9f8", textDim: "#8a7fa1",
    accent: "#b78cff", accentText: "#0d0a14",
  },
  {
    id: "11", name: "Sand Dune", mood: "warm neutral · desert",
    bg: "#e8dfd0", surface: "#f3ecdd", surfaceInner: "#e2d8c6",
    border: "#c4b89e", text: "#3a2e1c", textDim: "#8a7d63",
    accent: "#c2956b", accentText: "#3a2e1c",
  },
  {
    id: "12", name: "Ocean Deep", mood: "trustworthy · marine",
    bg: "#08182a", surface: "#102742", surfaceInner: "#0a1c30",
    border: "#1a3553", text: "#e6eef6", textDim: "#7b94ad",
    accent: "#5cbdb9", accentText: "#08182a",
  },
  {
    id: "13", name: "Noir Gold", mood: "luxury · editorial",
    bg: "#0d0d0d", surface: "#1a1a1a", surfaceInner: "#101010",
    border: "#262626", text: "#f1ede1", textDim: "#8a8273",
    accent: "#c9a84c", accentText: "#0d0d0d",
  },
  {
    id: "14", name: "Blush Studio", mood: "soft warm · creative",
    bg: "#f4ebe8", surface: "#fbf5f3", surfaceInner: "#efe6e2",
    border: "#d9c9c2", text: "#2a1f1c", textDim: "#85706a",
    accent: "#c44569", accentText: "#fbf5f3",
  },
  {
    id: "15", name: "Terminal Green", mood: "hacker · CRT",
    bg: "#070a07", surface: "#0e140e", surfaceInner: "#080c08",
    border: "#13221a", text: "#d4f5d4", textDim: "#5a7c5e",
    accent: "#3dff7a", accentText: "#070a07",
  },
];

/* preview card mirrors Layout v12 (Framed Console) — outer panel + inner tile */
function PalettePreview({ p }: { p: Palette }) {
  const surfaceShadow = `inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 0 ${p.border}, 0 10px 22px rgba(0,0,0,0.25)`;
  return (
    <div
      className="rounded-xl p-5 transition-transform hover:-translate-y-0.5"
      style={{ background: p.bg, color: p.text }}
    >
      {/* meta */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: p.textDim }}>
            {p.id} · {p.mood}
          </div>
          <div className="mt-1 text-[15px] font-medium">{p.name}</div>
        </div>
        <div className="flex gap-1">
          {[p.bg, p.surface, p.surfaceInner, p.border, p.accent].map((c, i) => (
            <span key={i} className="h-4 w-4 rounded-sm" style={{ background: c, border: `1px solid ${p.border}` }} />
          ))}
        </div>
      </div>

      {/* greeting */}
      <h3 className="text-[22px] leading-[1.1] tracking-tight">
        What&rsquo;s on your mind, <span className="uppercase">Emma?</span>
      </h3>

      {/* v12 framed console */}
      <div
        className="mt-4 rounded-xl border p-3"
        style={{ background: p.surface, borderColor: p.border, boxShadow: surfaceShadow }}
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: p.textDim }}>
            Compose
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: p.textDim }}>
            Lumen 4
          </span>
        </div>
        {/* inner tile */}
        <div
          className="rounded-lg border p-3 text-[12px]"
          style={{
            background: p.surfaceInner,
            borderColor: p.border,
            color: p.textDim,
          }}
        >
          Type a prompt …
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {["@", "⌘", "🎙"].map((c) => (
                <span
                  key={c}
                  className="grid h-6 w-6 place-items-center rounded-md border text-[10px]"
                  style={{ background: p.surface, borderColor: p.border, color: p.text }}
                >
                  {c}
                </span>
              ))}
            </div>
            <span
              className="grid h-6 w-6 place-items-center rounded-md text-[11px]"
              style={{ background: p.accent, color: p.accentText }}
            >
              ↑
            </span>
          </div>
        </div>
        {/* secondary row pills */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1">
          {["Style · Auto", "Length · Balanced", "Memory", "Web"].map((t) => (
            <span
              key={t}
              className="rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-wider"
              style={{ background: p.surface, borderColor: p.border, color: p.textDim }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* chip row */}
      <div className="mt-4 flex flex-wrap gap-1">
        {["Summarize", "Write email", "Generate UI", "Research"].map((t) => (
          <span
            key={t}
            className="rounded-md border px-2 py-1 text-[10px]"
            style={{ background: p.surface, borderColor: p.border, color: p.text }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function ColorsPage() {
  const [dark, setDark] = useState(false);
  const pageBg = dark ? "#0a0a0a" : "#ededeb";
  const pageFg = dark ? "#f0f0f0" : "#111";

  return (
    <div className="min-h-screen" style={{ background: pageBg, color: pageFg }}>
      <header className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: dark ? "#222" : "#d4d4d2" }}>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">Layout 12 · Framed Console</p>
          <h1 className="mt-1 font-mono text-sm uppercase tracking-[0.2em]">Color Directions — 15 palettes</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ borderColor: dark ? "#333" : "#c2c2c2" }}
          >
            Page · {dark ? "Dark" : "Light"}
          </button>
          <Link
            to="/layout"
            className="rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ borderColor: dark ? "#333" : "#c2c2c2" }}
          >
            ← Layouts
          </Link>
        </div>
      </header>

      <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
        {PALETTES.map((p) => (
          <PalettePreview key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
