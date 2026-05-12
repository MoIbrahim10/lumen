import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus, ChevronDown } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v10")({ component: V10 });

const rows = [
  ["0184", "Letter to Hannah, third draft", "Drafting", "Lumen 4", "Considered", "12m", "2h ago"],
  ["0183", "Stripe Q1 2026 — paraphrased notes", "Reading", "Lumen 4", "Plain", "38m", "Mon"],
  ["0182", "Lisbon, three days, quiet pace", "Planning", "Lumen 4", "Editorial", "21m", "Sun"],
  ["0181", "Reading list, May", "Listing", "Lumen 3", "Direct", "06m", "Sat"],
  ["0180", "Decision tree — the offer", "Thinking", "Lumen 4", "Considered", "44m", "Fri"],
  ["0179", "Memo to staff, honest tone", "Drafting", "Lumen 4", "Direct", "18m", "Thu"],
];

function V10() {
  const [style, setStyle] = useState("Considered");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="dark">
      <div className="min-h-screen text-foreground" style={{ backgroundColor: "#101010" }}>
        <header className="border-b border-border px-8 pt-5 pb-4">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Lumen / Archive</span>
            <span>Console · Emma M. · Pro</span>
          </div>

          {/* Composer dock */}
          <div className="mx-auto mt-3 max-w-[1280px] rounded-md border border-border" style={{ backgroundColor: "#161616" }}>
            <div className="flex items-start gap-3 px-4 pt-3">
              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">/ new</span>
              <textarea
                rows={2}
                placeholder="Open a new thread, or query the archive…"
                className="block w-full resize-none bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <Hint label="Attach" keys={SHORTCUTS.attach}><button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/5 hover:text-foreground"><Paperclip className="h-3.5 w-3.5" /></button></Hint>
                <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/5 hover:text-foreground"><Mic className="h-3.5 w-3.5" /></button></Hint>
                <Hint label="Tools" keys={SHORTCUTS.tools}><button className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/5 hover:text-foreground"><Wrench className="h-3.5 w-3.5" /></button></Hint>
                <Hint label="Model" keys={SHORTCUTS.model}>
                  <button className="ml-1 flex items-center gap-1 rounded border border-border px-2 py-0.5 hover:text-foreground">Lumen 4 <ChevronDown className="h-3 w-3 opacity-60" /></button>
                </Hint>
                <span className="ml-2 opacity-50">|</span>
                <Cycle label="Length" value={length} setValue={setLength} options={[...LENGTHS]} />
                <Cycle label="Depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
                <Switch label="Web" on={web} setOn={setWeb} />
                <Switch label="Memory" on={memory} setOn={setMemory} />
                <Switch label="Temp" on={temp} setOn={setTemp} />
              </div>
              <Hint label="Send" keys={SHORTCUTS.send}>
                <button className="flex items-center gap-1.5 rounded border border-foreground px-3 py-1 text-foreground hover:bg-foreground hover:text-background">SEND <ArrowUp className="h-3 w-3" /></button>
              </Hint>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="opacity-60">Style →</span>
              {styles.map((s) => (
                <button key={s} onClick={() => setStyle(s)} className={style === s ? "text-foreground underline underline-offset-4" : "hover:text-foreground"}>{s}</button>
              ))}
              <Hint label="Create" keys={SHORTCUTS.newStyle}>
                <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n); } }}
                  className="flex items-center gap-0.5 border border-dashed border-border px-1.5 hover:text-foreground"><Plus className="h-2.5 w-2.5" /> new</button>
              </Hint>
              <span className="ml-auto opacity-60">⌘N · new · ⌘K · search · ⌘/ · shortcuts</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-8 py-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Library</p>
              <h1 className="mt-2 text-3xl font-light tracking-tight">184 conversations, kept quietly.</h1>
            </div>
            <div className="flex gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <button className="text-foreground">All</button>
              <button>Drafting</button><button>Reading</button><button>Planning</button><button>Recall</button>
            </div>
          </div>

          {/* Quick actions row */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} className="flex items-center gap-1.5 rounded-md border border-border bg-white/[0.02] px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground">
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            ))}
          </div>

          <table className="mt-8 w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-border font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <th className="py-3 text-left font-normal">No.</th>
                <th className="py-3 text-left font-normal">Title</th>
                <th className="py-3 text-left font-normal">State</th>
                <th className="py-3 text-left font-normal">Model</th>
                <th className="py-3 text-left font-normal">Style</th>
                <th className="py-3 text-right font-normal">Time</th>
                <th className="py-3 text-right font-normal">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]} className="border-b border-border hover:bg-white/[0.03]">
                  <td className="py-3 font-mono text-[12px] text-muted-foreground">{r[0]}</td>
                  <td className="py-3">{r[1]}</td>
                  <td className="py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{r[2]}</td>
                  <td className="py-3 font-mono text-[12px] text-muted-foreground">{r[3]}</td>
                  <td className="py-3 font-mono text-[12px] text-muted-foreground">{r[4]}</td>
                  <td className="py-3 text-right font-mono text-[12px] text-muted-foreground">{r[5]}</td>
                  <td className="py-3 text-right font-mono text-[12px] text-muted-foreground">{r[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <footer className="mt-12 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>v10 · Archive Dashboard</span>
            <Link to="/" className="hover:text-foreground">← Index</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
function Cycle({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])} className="ml-2 hover:text-foreground">
      {label} · <span className="text-foreground">{value}</span>
    </button>
  );
}
function Switch({ label, on, setOn }: any) {
  return (
    <button onClick={() => setOn(!on)} className="ml-2 flex items-center gap-1 hover:text-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-foreground" : "bg-muted-foreground/40"}`} />{label}
    </button>
  );
}
