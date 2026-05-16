import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/studio")({ component: StudioPage });

/* ---------- color math (OKLCH-ish via CSS) ----------
   We build the whole palette from 4 inputs:
     L  (0..100)  page lightness — 0 = obsidian, 100 = paper
     S  (0..100)  accent saturation (chroma)
     I  (0..100)  intensity — surface contrast / step size
     H  (0..360)  accent hue
   Everything is emitted as oklch() so it stays perceptual.
------------------------------------------------------- */

type Theme = {
  bg: string;
  surface: string;
  surfaceInner: string;
  border: string;
  text: string;
  textDim: string;
  accent: string;
  accentText: string;
  isLight: boolean;
};

function buildTheme(L: number, S: number, I: number, H: number): Theme {
  const isLight = L >= 50;
  // base lightness 0..1, normalized
  const base = L / 100;

  // step driven by intensity (3% .. 12%)
  const step = 0.03 + (I / 100) * 0.09;

  // surfaces step away from the page bg
  const bgL = isLight ? 0.93 - (1 - base) * 0.08 : 0.08 + base * 0.10;
  const surfaceL = isLight ? bgL + step * 0.6 : bgL + step;
  const innerL = isLight ? bgL - step * 0.3 : bgL - step * 0.4;
  const borderL = isLight ? bgL - step * 1.2 : bgL + step * 1.6;

  // text contrast pinned high
  const textL = isLight ? 0.15 : 0.95;
  const dimL = isLight ? 0.45 : 0.62;

  // accent chroma scales 0..0.28
  const C = (S / 100) * 0.28;
  // accent lightness — bright enough to read in both modes
  const accentL = isLight ? 0.55 - (C * 0.4) : 0.78;
  // pick readable text on accent
  const accentText = accentL > 0.6 ? "oklch(0.12 0 0)" : "oklch(0.97 0 0)";

  return {
    bg: `oklch(${bgL} 0.005 ${H})`,
    surface: `oklch(${surfaceL} 0.006 ${H})`,
    surfaceInner: `oklch(${innerL} 0.006 ${H})`,
    border: `oklch(${borderL} 0.01 ${H})`,
    text: `oklch(${textL} 0.01 ${H})`,
    textDim: `oklch(${dimL} 0.01 ${H})`,
    accent: `oklch(${accentL} ${C} ${H})`,
    accentText,
    isLight,
  };
}

/* ---------- preview (Layout v12 Framed Console) ---------- */
function Preview({ t }: { t: Theme }) {
  const surfaceShadow = `inset 0 1px 0 rgba(255,255,255,${t.isLight ? 0.8 : 0.06}), 0 6px 0 ${t.border}, 0 14px 28px rgba(0,0,0,${t.isLight ? 0.14 : 0.5})`;
  return (
    <div className="rounded-2xl p-10" style={{ background: t.bg, color: t.text }}>
      <div className="mx-auto max-w-[720px]">
        {/* top bar */}
        <div className="mb-8 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: t.textDim }}>
            Lumen
          </span>
          <div className="flex items-center gap-2">
            {["⊘", "⚙"].map((c) => (
              <span
                key={c}
                className="grid h-8 w-8 place-items-center rounded-md border text-[12px]"
                style={{ background: t.surface, borderColor: t.border, color: t.text }}
              >
                {c}
              </span>
            ))}
            <span
              className="grid h-8 w-8 place-items-center rounded-md text-[10px] font-semibold"
              style={{ background: t.accent, color: t.accentText }}
            >
              EM
            </span>
          </div>
        </div>

        {/* greeting */}
        <h2 className="text-center text-[34px] leading-[1.05] tracking-tight">
          What&rsquo;s on your mind, <span className="uppercase">Emma?</span>
        </h2>

        {/* framed console */}
        <div
          className="mt-6 rounded-xl border p-4"
          style={{ background: t.surface, borderColor: t.border, boxShadow: surfaceShadow }}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: t.textDim }}>Compose</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: t.textDim }}>Lumen 4 · ready</span>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{ background: t.surfaceInner, borderColor: t.border, color: t.textDim }}
          >
            <div className="text-[14px]">Type a prompt …</div>
            <div className="mt-12 flex items-center justify-between">
              <div className="flex gap-1.5">
                {["@", "✦", "🎙"].map((c) => (
                  <span
                    key={c}
                    className="grid h-8 w-8 place-items-center rounded-md border text-[12px]"
                    style={{ background: t.surface, borderColor: t.border, color: t.text }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <span
                className="grid h-8 w-8 place-items-center rounded-md text-[14px]"
                style={{ background: t.accent, color: t.accentText }}
              >
                ↑
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {["Style · Auto", "Length · Balanced", "Depth · Standard", "Memory", "Web"].map((c) => (
              <span
                key={c}
                className="rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                style={{ background: t.surface, borderColor: t.border, color: t.textDim }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* chips */}
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {["Summarize document", "Write email", "Generate UI", "Research topic", "Brainstorm ideas"].map((c) => (
            <span
              key={c}
              className="rounded-md border px-3 py-1.5 text-[11px]"
              style={{ background: t.surface, borderColor: t.border, color: t.text }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- slider ---------- */
function Slider({
  label, value, onChange, min = 0, max = 100, gradient,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; gradient: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-neutral-300">{Math.round(value)}</span>
      </div>
      <div className="relative h-3 rounded-full" style={{ background: gradient }}>
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="studio-range absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
    </label>
  );
}

/* ---------- page ---------- */
function StudioPage() {
  const [L, setL] = useState(8);    // dark → starts near 07 Acid Lime feel
  const [S, setS] = useState(92);   // saturated accent
  const [I, setI] = useState(45);   // medium contrast
  const [H, setH] = useState(132);  // lime-green hue

  const t = useMemo(() => buildTheme(L, S, I, H), [L, S, I, H]);

  const presets: { name: string; L: number; S: number; I: number; H: number }[] = [
    { name: "Acid Lime",   L: 8,  S: 95, I: 40, H: 132 },
    { name: "Bone Paper",  L: 92, S: 30, I: 35, H: 50  },
    { name: "Obsidian",    L: 5,  S: 0,  I: 55, H: 0   },
    { name: "Plasma",      L: 10, S: 85, I: 50, H: 295 },
    { name: "Ocean",       L: 14, S: 60, I: 45, H: 200 },
    { name: "Ember",       L: 12, S: 90, I: 40, H: 30  },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <style>{`
        .studio-range::-webkit-slider-thumb{
          -webkit-appearance:none;appearance:none;
          height:22px;width:22px;border-radius:9999px;
          background:#fff;border:2px solid #0a0a0a;
          box-shadow:0 2px 6px rgba(0,0,0,0.5);cursor:pointer;
        }
        .studio-range::-moz-range-thumb{
          height:22px;width:22px;border-radius:9999px;
          background:#fff;border:2px solid #0a0a0a;
          box-shadow:0 2px 6px rgba(0,0,0,0.5);cursor:pointer;
        }
      `}</style>

      <header className="flex items-center justify-between border-b border-neutral-900 px-6 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">Color Studio</p>
          <h1 className="mt-1 font-mono text-sm uppercase tracking-[0.2em]">Build your own palette</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/colors" className="rounded-md border border-neutral-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">← Colors</Link>
          <Link to="/layout" className="rounded-md border border-neutral-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">Layouts</Link>
        </div>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[340px_1fr]">
        {/* controls */}
        <aside className="space-y-6 rounded-xl border border-neutral-900 bg-neutral-925 p-5" style={{ background: "#0f0f0f" }}>
          <Slider
            label="Lightness · dark ↔ light"
            value={L} onChange={setL}
            gradient="linear-gradient(to right, #0a0a0a, #2a2a2a, #888, #e8e8e8, #ffffff)"
          />
          <Slider
            label="Saturation"
            value={S} onChange={setS}
            gradient={`linear-gradient(to right, oklch(0.55 0 ${H}), oklch(0.55 0.14 ${H}), oklch(0.55 0.28 ${H}))`}
          />
          <Slider
            label="Intensity · surface contrast"
            value={I} onChange={setI}
            gradient="linear-gradient(to right, #2a2a2a, #666, #f0f0f0)"
          />
          <Slider
            label="Hue"
            value={H} onChange={setH} max={360}
            gradient="linear-gradient(to right, oklch(0.7 0.2 0), oklch(0.7 0.2 60), oklch(0.7 0.2 120), oklch(0.7 0.2 180), oklch(0.7 0.2 240), oklch(0.7 0.2 300), oklch(0.7 0.2 360))"
          />

          {/* swatches */}
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Tokens</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                ["bg", t.bg], ["surface", t.surface], ["inner", t.surfaceInner],
                ["border", t.border], ["text", t.text], ["dim", t.textDim],
                ["accent", t.accent], ["on accent", t.accentText],
              ].map(([n, v]) => (
                <div key={n} className="overflow-hidden rounded-md border border-neutral-800">
                  <div className="h-10" style={{ background: v }} />
                  <div className="px-1.5 py-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* presets */}
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Starting points</div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { setL(p.L); setS(p.S); setI(p.I); setH(p.H); }}
                  className="rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-[11px] hover:border-neutral-700"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* preview */}
        <div>
          <Preview t={t} />
        </div>
      </div>
    </div>
  );
}
