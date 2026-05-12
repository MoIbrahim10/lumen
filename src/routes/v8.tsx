import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus, ChevronDown } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v8")({ component: V8 });

function V8() {
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="dark">
      <div className="relative flex min-h-screen flex-col text-foreground" style={{ backgroundColor: "#0B0B0B" }}>
        <header className="flex items-center justify-between px-10 py-7 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          <span>Lumen</span>
          <span>Reel No. 04 · Tuesday · 18:42</span>
          <span>Emma M.</span>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">— A quiet machine —</p>
          <h1 className="mt-8 max-w-5xl text-center font-serif text-[96px] font-light leading-[0.98] tracking-[-0.02em]">
            Begin<br /><em className="italic text-muted-foreground">anywhere.</em>
          </h1>

          {/* Composer — single underline */}
          <div className="mt-14 w-full max-w-2xl">
            <div className="flex items-end gap-3 border-b border-border pb-3">
              <textarea
                rows={1}
                placeholder="A sentence, a fragment, a thought…"
                className="block flex-1 resize-none bg-transparent pb-1 text-center font-serif text-2xl italic placeholder:text-muted-foreground focus:outline-none"
              />
              <Hint label="Send" keys={SHORTCUTS.send}>
                <button className="mb-1 flex h-9 w-9 items-center justify-center rounded-full border border-foreground text-foreground hover:bg-foreground hover:text-background">
                  <ArrowUp className="h-4 w-4" />
                </button>
              </Hint>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1 text-muted-foreground">
              <Hint label="Attach" keys={SHORTCUTS.attach}><button className="rounded-full p-2 hover:bg-white/5 hover:text-foreground"><Paperclip className="h-4 w-4" /></button></Hint>
              <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="rounded-full p-2 hover:bg-white/5 hover:text-foreground"><Mic className="h-4 w-4" /></button></Hint>
              <Hint label="Tools & connectors" keys={SHORTCUTS.tools}><button className="rounded-full p-2 hover:bg-white/5 hover:text-foreground"><Wrench className="h-4 w-4" /></button></Hint>
              <Hint label="Switch model" keys={SHORTCUTS.model}>
                <button className="ml-1 flex items-center gap-1 rounded-full px-3 py-1 text-xs hover:text-foreground">Lumen 4 · Cinematic <ChevronDown className="h-3 w-3 opacity-60" /></button>
              </Hint>
            </div>

            {/* Quick actions — minimal pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {QUICK_ACTIONS.map((a, i) => (
                <button key={a.label} className="hover:text-foreground">
                  {String(i + 1).padStart(2, "0")} · {a.label}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Bottom strip — discreet controls */}
        <footer className="border-t border-border px-10 py-4">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="opacity-60">Style</span>
              {styles.map((s) => (
                <button key={s} onClick={() => setStyle(s)} className={style === s ? "text-foreground" : "hover:text-foreground"}>{s}</button>
              ))}
              <Hint label="Create" keys={SHORTCUTS.newStyle}>
                <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n); } }} className="flex items-center gap-0.5 hover:text-foreground"><Plus className="h-3 w-3" /> new</button>
              </Hint>
            </div>
            <div className="flex flex-wrap items-center gap-x-5">
              <Cycle label="Length" value={length} setValue={setLength} options={[...LENGTHS]} />
              <Cycle label="Depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
              <Switch label="Web" on={web} setOn={setWeb} />
              <Switch label="Memory" on={memory} setOn={setMemory} />
              <Switch label="Temp" on={temp} setOn={setTemp} />
              <span className="opacity-50">v8</span>
              <Link to="/" className="hover:text-foreground">↩ index</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
function Cycle({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])} className="hover:text-foreground">
      {label} · <span className="text-foreground">{value}</span>
    </button>
  );
}
function Switch({ label, on, setOn }: any) {
  return (
    <button onClick={() => setOn(!on)} className="flex items-center gap-1.5 hover:text-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-foreground" : "bg-muted-foreground/40"}`} />{label}
    </button>
  );
}
