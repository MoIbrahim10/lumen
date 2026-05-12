import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus, ChevronDown } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v6")({ component: V6 });

function V6() {
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="dark">
      <div className="min-h-screen text-foreground" style={{ backgroundColor: "#0E0E0E" }}>
        <nav className="flex items-center justify-between px-12 pt-8">
          <div className="flex items-center gap-2.5"><div className="h-2 w-2 rounded-full bg-foreground" /><span className="text-sm tracking-tight">Lumen</span></div>
          <div className="flex items-center gap-9 text-sm text-muted-foreground">
            <span>Threads</span><span>Models</span><span>Account</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-[10px]">EM</span>
          </div>
        </nav>

        <main className="mx-auto flex max-w-2xl flex-col items-center px-6 pt-28 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Evening · soft mode</p>
          <h1 className="mt-6 text-5xl font-light leading-tight tracking-tight md:text-[56px]">
            Take your time.<br /><span className="text-muted-foreground">I'm listening.</span>
          </h1>

          {/* Composer */}
          <div className="mt-14 w-full rounded-[16px] border border-border" style={{ backgroundColor: "#161616" }}>
            <textarea
              rows={3}
              placeholder="Speak plainly. Press return to send."
              className="block w-full resize-none bg-transparent px-6 pt-5 text-left text-[16px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
              <div className="flex items-center gap-0.5">
                <Hint label="Attach" keys={SHORTCUTS.attach}><button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"><Paperclip className="h-4 w-4" /></button></Hint>
                <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"><Mic className="h-4 w-4" /></button></Hint>
                <Hint label="Tools & connectors" keys={SHORTCUTS.tools}><button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"><Wrench className="h-4 w-4" /></button></Hint>
                <Hint label="Switch model" keys={SHORTCUTS.model}>
                  <button className="ml-1 flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">Lumen 4 <ChevronDown className="h-3 w-3 opacity-60" /></button>
                </Hint>
              </div>
              <Hint label="Send" keys={SHORTCUTS.send}>
                <button className="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs text-background hover:opacity-90">Send <ArrowUp className="h-3.5 w-3.5" /></button>
              </Hint>
            </div>
          </div>

          {/* Knob row — quiet luxury control */}
          <div className="mt-10 grid w-full grid-cols-5 gap-3">
            <Knob label="Style" value={style} options={styles} setValue={setStyle} extra={
              <Hint label="New style" keys={SHORTCUTS.newStyle}>
                <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n); } }}
                  className="ml-1 inline-flex items-center text-muted-foreground hover:text-foreground"><Plus className="h-3 w-3" /></button>
              </Hint>
            } />
            <Knob label="Length" value={length} options={[...LENGTHS]} setValue={setLength} />
            <Knob label="Depth" value={depth} options={[...DEPTHS]} setValue={setDepth} />
            <KnobToggle label="Memory" on={memory} setOn={setMemory} />
            <KnobToggle label="Web" on={web} setOn={setWeb} />
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <button onClick={() => setTemp(!temp)} className="flex items-center gap-2 hover:text-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${temp ? "bg-foreground" : "bg-muted-foreground/40"}`} />
              Temporary chat — leaves no trace
            </button>
          </div>

          {/* Quick actions */}
          <div className="mt-10 flex w-full flex-wrap justify-center gap-1.5">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground hover:text-foreground">
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            ))}
          </div>
        </main>

        <footer className="mt-24 flex justify-between px-12 pb-9 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>v6 · Soft Graphite</span>
          <Link to="/" className="hover:text-foreground">← Index</Link>
        </footer>
      </div>
    </div>
  );
}
function Knob({ label, value, options, setValue, extra }: any) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])}
      className="rounded-xl border border-border px-3 py-3 text-left hover:border-foreground/40" style={{ backgroundColor: "#141414" }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-[13px]">{value} {extra}</p>
    </button>
  );
}
function KnobToggle({ label, on, setOn }: any) {
  return (
    <button onClick={() => setOn(!on)}
      className="rounded-xl border border-border px-3 py-3 text-left hover:border-foreground/40" style={{ backgroundColor: "#141414" }}>
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center justify-between text-[13px]">
        <span>{on ? "On" : "Off"}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-foreground" : "bg-muted-foreground/40"}`} />
      </p>
    </button>
  );
}
