import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Sparkles, Feather, Smile, Scissors, Wand2 } from "lucide-react";

export const Route = createFileRoute("/style-pills")({ component: StylePillsPage });

const STYLES = [
  { id: "auto", label: "Auto", icon: Sparkles },
  { id: "formal", label: "Formal", icon: Feather },
  { id: "friendly", label: "Friendly", icon: Smile },
  { id: "concise", label: "Concise", icon: Scissors },
  { id: "creative", label: "Creative", icon: Wand2 },
];

const spring = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.6 };

/* ───────── 1. Magnetic Track — sliding active capsule under labels ───────── */
function VariantTrack() {
  const [active, setActive] = useState("auto");
  return (
    <LayoutGroup id="track">
      <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1">
        {STYLES.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className="relative px-4 py-2 text-[12px] font-medium text-zinc-600 hover:text-zinc-900"
            >
              {on && (
                <motion.span
                  layoutId="track-pill"
                  transition={spring}
                  className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_-4px_rgba(0,0,0,0.1)]"
                />
              )}
              <span className={`relative flex items-center gap-1.5 ${on ? "text-zinc-900" : ""}`}>
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/* ───────── 2. Expanding Capsule — only active shows label, others icon-only ───────── */
function VariantExpand() {
  const [active, setActive] = useState("auto");
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 p-1.5">
      {STYLES.map((s) => {
        const on = active === s.id;
        return (
          <motion.button
            key={s.id}
            onClick={() => setActive(s.id)}
            layout
            transition={spring}
            className={`flex items-center gap-2 overflow-hidden rounded-full px-3 py-2 text-[12px] ${
              on ? "bg-white text-zinc-900" : "text-zinc-400 hover:text-white"
            }`}
          >
            <s.icon className="h-3.5 w-3.5 shrink-0" />
            <AnimatePresence initial={false}>
              {on && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={spring}
                  className="overflow-hidden whitespace-nowrap font-medium"
                >
                  {s.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ───────── 3. Spotlight Bar — animated gradient follows the hovered/active item ───────── */
function VariantSpotlight() {
  const [active, setActive] = useState("auto");
  const [hover, setHover] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [box, setBox] = useState({ x: 0, w: 0, opacity: 0 });
  const target = hover ?? active;

  useLayoutEffect(() => {
    const el = refs.current[target];
    if (!el) return;
    const parent = el.parentElement!;
    const pr = parent.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setBox({ x: r.left - pr.left, w: r.width, opacity: 1 });
  }, [target]);

  return (
    <div
      onMouseLeave={() => setHover(null)}
      className="relative inline-flex items-center gap-0 rounded-2xl border border-zinc-200 bg-white px-1 py-1"
    >
      <motion.span
        animate={{ x: box.x, width: box.w, opacity: box.opacity }}
        transition={spring}
        className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-orange-400"
      />
      {STYLES.map((s) => {
        const on = target === s.id;
        return (
          <button
            key={s.id}
            ref={(el) => (refs.current[s.id] = el)}
            onMouseEnter={() => setHover(s.id)}
            onClick={() => setActive(s.id)}
            className="relative z-10 flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium transition-colors duration-200"
            style={{ color: on ? "white" : "rgb(82 82 91)" }}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── 4. Stamp Pills — pressed pill scales + rotates with a stamp feel ───────── */
function VariantStamp() {
  const [active, setActive] = useState("auto");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STYLES.map((s) => {
        const on = active === s.id;
        return (
          <motion.button
            key={s.id}
            onClick={() => setActive(s.id)}
            whileTap={{ scale: 0.88, rotate: -2 }}
            animate={{
              scale: on ? 1.04 : 1,
              rotate: on ? -1.5 : 0,
              y: on ? -1 : 0,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={`flex items-center gap-1.5 rounded-md border-2 px-3.5 py-1.5 text-[12px] font-mono uppercase tracking-wider transition-colors ${
              on
                ? "border-zinc-900 bg-zinc-900 text-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ───────── 5. Orbiting Dot — single dot orbits between pills + ink underline ───────── */
function VariantOrbit() {
  const [active, setActive] = useState("auto");
  return (
    <LayoutGroup id="orbit">
      <div className="inline-flex items-end gap-5 px-2 pb-3 pt-2">
        {STYLES.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className="group relative flex flex-col items-center gap-2 px-1"
            >
              <motion.div
                animate={{
                  scale: on ? 1 : 0.9,
                  color: on ? "rgb(24 24 27)" : "rgb(161 161 170)",
                }}
                transition={spring}
                className="flex items-center gap-1.5 text-[12px] font-medium"
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </motion.div>
              <div className="relative h-[6px] w-full">
                {on && (
                  <>
                    <motion.span
                      layoutId="orbit-bar"
                      transition={spring}
                      className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-900"
                    />
                    <motion.span
                      layoutId="orbit-dot"
                      transition={spring}
                      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900"
                    />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/* ───────── page ───────── */

const VARIANTS = [
  {
    n: "01",
    name: "Magnetic Track",
    desc: "Soft inset capsule glides between labels with springy layout animation.",
    Comp: VariantTrack,
  },
  {
    n: "02",
    name: "Expanding Capsule",
    desc: "Inactive items collapse to icons; the active one expands to reveal its label.",
    Comp: VariantExpand,
  },
  {
    n: "03",
    name: "Spotlight Bar",
    desc: "A gradient spotlight chases your cursor and snaps to the selection on click.",
    Comp: VariantSpotlight,
  },
  {
    n: "04",
    name: "Stamp Pills",
    desc: "Each option lives free; the active one tilts and stamps in with a hard shadow.",
    Comp: VariantStamp,
  },
  {
    n: "05",
    name: "Orbit Underline",
    desc: "Minimal labels with a single dot that orbits across an ink underline.",
    Comp: VariantOrbit,
  },
];

function StylePillsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-6 py-16 text-zinc-900">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Style selector · 5 directions
        </p>
        <h1 className="mt-3 text-[40px] leading-[1.05] tracking-tight">
          Pick a personality for the pills.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-zinc-500">
          Same 5 styles, five different interaction languages. Click around — each
          one feels different. Tell me which to ship into the composer.
        </p>

        <div className="mt-12 space-y-10">
          {VARIANTS.map((v) => (
            <section
              key={v.n}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <div className="mb-5 flex items-baseline gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                  {v.n}
                </span>
                <h2 className="text-[18px] font-medium tracking-tight">{v.name}</h2>
              </div>
              <p className="mb-6 max-w-md text-[13px] text-zinc-500">{v.desc}</p>
              <div className="flex min-h-[80px] items-center rounded-xl bg-[#f4f4f3] p-6">
                <v.Comp />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
