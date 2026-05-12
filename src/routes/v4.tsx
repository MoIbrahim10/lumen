import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v4")({ component: V4 });

function V4() {
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <header className="grid grid-cols-12 border-b border-foreground">
        <div className="col-span-3 border-r border-border px-6 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Lumen / 2026 — 05 — 12</div>
        <div className="col-span-6 px-6 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Issue No. 184 · Personal Console</div>
        <div className="col-span-3 border-l border-border px-6 py-4 text-right text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Emma M. · Pro</div>
      </header>

      <main className="grid grid-cols-12">
        {/* Big number / heading column */}
        <section className="col-span-3 border-r border-border px-6 py-10">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">00 — Greeting</p>
          <h1 className="mt-6 font-sans text-[44px] font-light leading-[0.95] tracking-tight">
            ASK<br />ANYTHING<span className="text-muted-foreground">.</span>
          </h1>
          <p className="mt-6 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
            Press return to send.<br />Shift + return for newline.<br />⌘K opens command.
          </p>
        </section>

        {/* Composer */}
        <section className="col-span-6 border-r border-border px-6 py-10">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">01 — Prompt</p>
          <textarea
            rows={6}
            placeholder="// Type the question, drop the file, paste the thought."
            className="mt-4 block w-full resize-none border-y border-foreground bg-transparent py-4 font-sans text-[20px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="mt-4 grid grid-cols-12 items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Hint label="Attach" keys={SHORTCUTS.attach}><button className="col-span-2 flex items-center gap-1.5 hover:text-foreground"><Paperclip className="h-3.5 w-3.5" /> File</button></Hint>
            <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="col-span-2 flex items-center gap-1.5 hover:text-foreground"><Mic className="h-3.5 w-3.5" /> Voice</button></Hint>
            <Hint label="Tools" keys={SHORTCUTS.tools}><button className="col-span-2 flex items-center gap-1.5 hover:text-foreground"><Wrench className="h-3.5 w-3.5" /> Tools</button></Hint>
            <Hint label="Model" keys={SHORTCUTS.model}><button className="col-span-3 text-left hover:text-foreground">Model — Lumen 4</button></Hint>
            <Hint label="Send" keys={SHORTCUTS.send}>
              <button className="col-span-3 flex items-center justify-end gap-1 border border-foreground bg-foreground py-1.5 text-background hover:opacity-90">
                <span className="px-1">SEND</span><ArrowUp className="mr-2 h-3.5 w-3.5" />
              </button>
            </Hint>
          </div>

          <p className="mt-12 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">03 — Quick actions</p>
          <ol className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] text-foreground">
            {QUICK_ACTIONS.map((a, i) => (
              <li key={a.label} className="flex items-baseline gap-3 border-b border-border py-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">0{i + 1}</span>
                <button className="flex-1 text-left font-sans hover:underline">{a.label}</button>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">↗</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Right rail: response config */}
        <section className="col-span-3 px-6 py-10">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">02 — Response</p>

          <div className="mt-5 space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Style</p>
            <div className="flex flex-wrap gap-1">
              {styles.map((s) => (
                <button key={s} onClick={() => setStyle(s)}
                  className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                    style === s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>{s}</button>
              ))}
              <Hint label="Create" keys={SHORTCUTS.newStyle}>
                <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n); } }}
                  className="flex items-center gap-0.5 border border-dashed border-border px-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground">
                  <Plus className="h-2.5 w-2.5" /> New
                </button>
              </Hint>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-[10px] uppercase tracking-[0.18em]">
            <Cycle label="Length" value={length} setValue={setLength} options={[...LENGTHS]} />
            <Cycle label="Depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
            <Switch label="Web search" on={web} setOn={setWeb} />
            <Switch label="Memory" on={memory} setOn={setMemory} />
            <Switch label="Temporary chat" on={temp} setOn={setTemp} />
          </div>
        </section>
      </main>

      <footer className="mt-0 grid grid-cols-12 border-t border-foreground">
        <div className="col-span-6 border-r border-border px-6 py-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">v4 · Brutalist Grid</div>
        <div className="col-span-6 px-6 py-4 text-right text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Index</Link>
        </div>
      </footer>
    </div>
  );
}
function Cycle({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])} className="flex w-full items-center justify-between border-b border-border pb-2 text-muted-foreground hover:text-foreground">
      <span>{label}</span><span className="text-foreground">{value}</span>
    </button>
  );
}
function Switch({ label, on, setOn }: any) {
  return (
    <button onClick={() => setOn(!on)} className="flex w-full items-center justify-between border-b border-border pb-2 text-muted-foreground hover:text-foreground">
      <span>{label}</span><span className={`px-1.5 py-0.5 ${on ? "bg-foreground text-background" : "border border-border"}`}>{on ? "ON" : "OFF"}</span>
    </button>
  );
}
