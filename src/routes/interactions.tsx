import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  MotionConfig,
} from "motion/react";
import {
  ChevronDown, Plus, Check, Heart, Bell, Search, Trash2, Copy, Settings,
  ArrowRight, Star, X, Menu as MenuIcon, Sparkles, Volume2,
} from "lucide-react";

export const Route = createFileRoute("/interactions")({ component: InteractionsPage });

/* shared spring presets — physics that feels alive but not bouncy */
const spring = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.6 };
const softSpring = { type: "spring" as const, stiffness: 220, damping: 28 };
const snap = { type: "spring" as const, stiffness: 600, damping: 40 };

/* ---------- 1. magnetic button ---------- */
function MagneticButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      whileTap={{ scale: 0.94 }}
      style={{ x, y }}
      className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-lg shadow-white/10"
    >
      <span className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" /> Hover me
      </span>
    </motion.button>
  );
}

/* ---------- 2. press button with ripple ---------- */
function RippleButton() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setBursts((b) => [...b, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 700);
  };
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={spring}
      className="relative overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-3 text-sm"
    >
      <span className="relative z-10 flex items-center gap-2">
        <Plus className="h-4 w-4" /> Click for ripple
      </span>
      {bursts.map((b) => (
        <motion.span
          key={b.id}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ left: b.x, top: b.y }}
          className="pointer-events-none absolute -ml-12 -mt-12 h-24 w-24 rounded-full bg-white/30"
        />
      ))}
    </motion.button>
  );
}

/* ---------- 3. icon button stack ---------- */
function IconRow() {
  const icons = [Heart, Bell, Star, Copy, Trash2, Settings];
  const [liked, setLiked] = useState<number | null>(null);
  return (
    <div className="flex gap-2">
      {icons.map((Icon, i) => (
        <motion.button
          key={i}
          onClick={() => setLiked(i)}
          whileHover={{ y: -3, scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          transition={spring}
          className="grid h-10 w-10 place-items-center rounded-lg border border-neutral-800 bg-neutral-900"
        >
          <motion.span
            animate={liked === i ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Icon className={`h-4 w-4 ${liked === i ? "text-rose-400" : "text-neutral-300"}`} />
          </motion.span>
        </motion.button>
      ))}
    </div>
  );
}

/* ---------- 4. segmented control with shared layout pill ---------- */
function Segmented() {
  const items = ["Auto", "Concise", "Creative"];
  const [active, setActive] = useState("Auto");
  return (
    <div className="relative inline-flex rounded-full border border-neutral-800 bg-neutral-950 p-1">
      {items.map((i) => (
        <button
          key={i}
          onClick={() => setActive(i)}
          className="relative z-10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider"
        >
          {active === i && (
            <motion.span
              layoutId="seg-pill"
              transition={softSpring}
              className="absolute inset-0 rounded-full bg-white"
            />
          )}
          <span className={`relative z-10 ${active === i ? "text-black" : "text-neutral-400"}`}>
            {i}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- 5. toggle switch ---------- */
function Toggle({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn(!on)}
      className="flex items-center gap-3 text-sm text-neutral-300"
    >
      <motion.div
        animate={{ background: on ? "#4ade80" : "#262626" }}
        transition={{ duration: 0.2 }}
        className="relative h-6 w-11 rounded-full"
      >
        <motion.div
          layout
          transition={snap}
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${on ? "right-0.5" : "left-0.5"}`}
        />
      </motion.div>
      {label}
    </button>
  );
}

/* ---------- 6. dropdown menu ---------- */
function Dropdown() {
  const [open, setOpen] = useState(false);
  const items = ["New chat", "Library", "Memory", "Sign out"];
  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm"
      >
        Menu
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring}>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={spring}
              style={{ transformOrigin: "top left" }}
              className="absolute z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 p-1 shadow-2xl"
            >
              {items.map((label, i) => (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="block w-full rounded-md px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-900"
                >
                  {label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 7. accordion ---------- */
function Accordion() {
  const items = [
    { q: "What is Lumen?", a: "A studio for thoughts — type, dictate, attach, compose." },
    { q: "How does memory work?", a: "Memory persists across sessions, scoped to your workspace." },
    { q: "Can I bring my own model?", a: "Yes, connect any provider through the tools menu." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="w-full max-w-md divide-y divide-neutral-800 rounded-lg border border-neutral-800 bg-neutral-950">
      {items.map((it, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
          >
            {it.q}
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={spring}>
              <Plus className="h-4 w-4" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ height: { ...softSpring }, opacity: { duration: 0.15 } }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-3 text-xs text-neutral-400">{it.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ---------- 8. tabs with sliding indicator ---------- */
function Tabs() {
  const tabs = ["Overview", "Activity", "Files", "Members"];
  const [active, setActive] = useState("Overview");
  return (
    <div className="border-b border-neutral-800">
      <div className="flex gap-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className="relative pb-3 text-sm"
          >
            <span className={active === t ? "text-white" : "text-neutral-500"}>{t}</span>
            {active === t && (
              <motion.span
                layoutId="tab-underline"
                transition={softSpring}
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-white"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- 9. springy slider ---------- */
function SpringySlider() {
  const [value, setValue] = useState(50);
  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
        <span>Intensity</span>
        <motion.span key={value} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-neutral-300">
          {value}
        </motion.span>
      </div>
      <div className="relative h-2 rounded-full bg-neutral-800">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          animate={{ width: `${value}%` }}
          transition={softSpring}
        />
        <motion.div
          className="absolute -top-1.5 h-5 w-5 -translate-x-1/2 rounded-full bg-white shadow-lg"
          animate={{ left: `${value}%` }}
          transition={softSpring}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
        <input
          type="range" min={0} max={100} value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

/* ---------- 10. drag-to-confirm ---------- */
function DragConfirm() {
  const [done, setDone] = useState(false);
  const x = useMotionValue(0);
  const bg = useTransform(x, [0, 240], ["#171717", "#22c55e"]);
  const opacity = useTransform(x, [0, 120, 220], [1, 0.6, 0]);
  return (
    <motion.div
      style={{ background: bg }}
      className="relative h-12 w-72 overflow-hidden rounded-full border border-neutral-800"
    >
      <motion.span style={{ opacity }} className="absolute inset-0 grid place-items-center text-xs text-neutral-400">
        Slide to confirm →
      </motion.span>
      {done && (
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 grid place-items-center text-xs font-medium text-black"
        >
          Confirmed
        </motion.span>
      )}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 240 }}
        dragElastic={0.08}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.point.x > 0 && x.get() > 200) {
            x.set(240); setDone(true);
            setTimeout(() => { setDone(false); x.set(0); }, 1200);
          } else { x.set(0); }
        }}
        whileTap={{ scale: 0.95 }}
        className="absolute left-1 top-1 grid h-10 w-10 cursor-grab place-items-center rounded-full bg-white text-black active:cursor-grabbing"
      >
        <ArrowRight className="h-4 w-4" />
      </motion.div>
    </motion.div>
  );
}

/* ---------- 11. modal ---------- */
function Modal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }} transition={spring}
        onClick={() => setOpen(true)}
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm"
      >
        Open modal
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={spring}
              className="fixed left-1/2 top-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium">Delete project?</h3>
                  <p className="mt-1 text-xs text-neutral-400">This action cannot be undone.</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-neutral-900">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setOpen(false)} className="rounded-md border border-neutral-800 px-3 py-1.5 text-xs">Cancel</button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-rose-500 px-3 py-1.5 text-xs text-white"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- 12. toast stack ---------- */
function Toasts() {
  const [list, setList] = useState<{ id: number; text: string }[]>([]);
  const fire = () => {
    const id = Date.now();
    setList((l) => [...l, { id, text: "Saved to library" }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 2500);
  };
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }} onClick={fire}
        className="rounded-lg bg-white px-4 py-2 text-sm text-black"
      >
        Trigger toast
      </motion.button>
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {list.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={spring}
              className="pointer-events-auto flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm shadow-2xl"
            >
              <Check className="h-4 w-4 text-emerald-400" /> {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ---------- 13. side drawer ---------- */
function Drawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-lg border border-neutral-800 bg-neutral-900"
      >
        <MenuIcon className="h-4 w-4" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={softSpring}
              className="fixed inset-y-0 left-0 z-50 w-80 border-r border-neutral-800 bg-neutral-950 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">Menu</span>
                <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-neutral-900"><X className="h-4 w-4" /></button>
              </div>
              <nav className="flex flex-col gap-1">
                {["New chat", "Library", "Projects", "Memory", "Connectors", "History"].map((n, i) => (
                  <motion.button
                    key={n}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.04 }}
                    className="rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-900"
                  >
                    {n}
                  </motion.button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- 14. command search with morphing input ---------- */
function CommandInput() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-md">
      <motion.div
        layout transition={softSpring}
        className={`flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 ${open ? "px-4 py-3" : "px-3 py-2"}`}
      >
        <motion.div layout><Search className="h-4 w-4 text-neutral-500" /></motion.div>
        <motion.input
          layout
          onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
          placeholder="Search anything…"
          className="flex-1 bg-transparent text-sm placeholder:text-neutral-600 focus:outline-none"
        />
        <AnimatePresence>
          {open && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="rounded border border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400"
            >
              ESC
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ---------- 15. counter with rolling digit ---------- */
function Counter() {
  const [n, setN] = useState(1);
  return (
    <div className="flex items-center gap-2">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setN(Math.max(0, n - 1))}
        className="grid h-10 w-10 place-items-center rounded-lg border border-neutral-800 bg-neutral-900">−</motion.button>
      <div className="relative h-10 w-16 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={n}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={spring}
            className="absolute inset-0 grid place-items-center text-lg tabular-nums"
          >
            {n}
          </motion.span>
        </AnimatePresence>
      </div>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setN(n + 1)}
        className="grid h-10 w-10 place-items-center rounded-lg border border-neutral-800 bg-neutral-900">+</motion.button>
    </div>
  );
}

/* ---------- 16. volume meter (motion value chain) ---------- */
function Volume() {
  const [v, setV] = useState(60);
  const bars = Array.from({ length: 16 });
  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500">
        <Volume2 className="h-3.5 w-3.5" /> Volume
      </div>
      <div className="flex items-end gap-1">
        {bars.map((_, i) => {
          const lit = i / bars.length < v / 100;
          return (
            <motion.div
              key={i}
              animate={{
                height: lit ? 8 + (i + 1) * 1.5 : 4,
                backgroundColor: lit ? "#ffffff" : "#262626",
              }}
              transition={{ ...softSpring, delay: lit ? i * 0.015 : 0 }}
              className="w-2 rounded-sm"
            />
          );
        })}
      </div>
      <input
        type="range" min={0} max={100} value={v}
        onChange={(e) => setV(Number(e.target.value))}
        className="mt-3 w-full accent-white"
      />
    </div>
  );
}

/* ---------- layout ---------- */
function Cell({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={softSpring}
      className="flex flex-col rounded-2xl border border-neutral-900 bg-neutral-950/50 p-6"
    >
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">{title}</div>
      <div className="mb-6 text-xs text-neutral-400">{hint}</div>
      <div className="flex flex-1 items-center justify-center py-4">{children}</div>
    </motion.div>
  );
}

function InteractionsPage() {
  return (
    <MotionConfig transition={spring}>
      <div className="min-h-screen bg-neutral-950 text-neutral-200">
        <header className="flex items-center justify-between border-b border-neutral-900 px-6 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">Interactions</p>
            <h1 className="mt-1 font-mono text-sm uppercase tracking-[0.2em]">Motion-powered micro-UX</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/studio" className="rounded-md border border-neutral-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">Studio</Link>
            <Link to="/layout" className="rounded-md border border-neutral-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">Layouts</Link>
          </div>
        </header>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          <Cell title="01 · Magnetic" hint="Cursor pulls the button toward it.">
            <MagneticButton />
          </Cell>
          <Cell title="02 · Ripple" hint="Click anywhere on the surface.">
            <RippleButton />
          </Cell>
          <Cell title="03 · Icon stack" hint="Lift on hover, bounce on press, react to selection.">
            <IconRow />
          </Cell>
          <Cell title="04 · Segmented" hint="Shared layout pill morphs between options.">
            <Segmented />
          </Cell>
          <Cell title="05 · Toggles" hint="State change with a spring.">
            <div className="flex flex-col gap-3">
              <Toggle label="Memory" />
              <Toggle label="Web search" />
              <Toggle label="Temporary" />
            </div>
          </Cell>
          <Cell title="06 · Dropdown" hint="Staggered items, scale-in origin.">
            <Dropdown />
          </Cell>
          <Cell title="07 · Accordion" hint="Height animates with a spring.">
            <Accordion />
          </Cell>
          <Cell title="08 · Tabs" hint="Indicator slides between tabs.">
            <div className="w-full max-w-md"><Tabs /></div>
          </Cell>
          <Cell title="09 · Slider" hint="Thumb and fill share the same spring.">
            <SpringySlider />
          </Cell>
          <Cell title="10 · Drag confirm" hint="Drag handle to the right.">
            <DragConfirm />
          </Cell>
          <Cell title="11 · Modal" hint="Backdrop fade, dialog scale-in.">
            <Modal />
          </Cell>
          <Cell title="12 · Toast" hint="Stack with layout animation.">
            <Toasts />
          </Cell>
          <Cell title="13 · Drawer" hint="Slides in, items stagger.">
            <Drawer />
          </Cell>
          <Cell title="14 · Search" hint="Container morphs as it focuses.">
            <CommandInput />
          </Cell>
          <Cell title="15 · Counter" hint="Digits roll on change.">
            <Counter />
          </Cell>
          <Cell title="16 · Meter" hint="Bars cascade in.">
            <Volume />
          </Cell>
        </div>
      </div>
    </MotionConfig>
  );
}
