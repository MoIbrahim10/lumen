import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus, ChevronDown, Sliders } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v9")({ component: V9 });

function V9() {
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="dark min-h-screen w-full py-10" style={{ backgroundColor: "#1A1A1A" }}>
      <div className="mx-auto flex w-[390px] flex-col overflow-hidden rounded-[44px] border border-border text-foreground" style={{ backgroundColor: "#0E0E0E", height: "844px" }}>
        <div className="flex items-center justify-between px-6 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>9:41</span><span>Lumen</span><span>EM</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Tuesday evening</p>
          <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight">
            Hi Emma.<br /><span className="text-muted-foreground">What's the thought?</span>
          </h1>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Quick actions</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-white/[0.02] px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground">
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            ))}
          </div>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Style</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {styles.map((s) => (
              <button key={s} onClick={() => setStyle(s)}
                className={`rounded-full px-3 py-1 text-[12px] ${style === s ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>{s}</button>
            ))}
            <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n); } }}
              className="flex items-center gap-0.5 rounded-full border border-dashed border-border px-2.5 py-1 text-[12px] text-muted-foreground"><Plus className="h-3 w-3" /> New</button>
          </div>

          {open && (
            <div className="mt-5 rounded-2xl border border-border p-4" style={{ backgroundColor: "#141414" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Behaviour</p>
              <div className="mt-3 space-y-2 text-[13px]">
                <Row label="Length" value={length} setValue={setLength} options={[...LENGTHS]} />
                <Row label="Depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
                <RowSwitch label="Web search" on={web} setOn={setWeb} />
                <RowSwitch label="Memory" on={memory} setOn={setMemory} />
                <RowSwitch label="Temporary" on={temp} setOn={setTemp} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom composer */}
        <div className="border-t border-border px-3 pt-2 pb-5" style={{ backgroundColor: "#141414" }}>
          <div className="flex items-center justify-between px-1 pb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Hint label="Switch model" keys={SHORTCUTS.model}>
              <button className="flex items-center gap-1 hover:text-foreground">Lumen 4 <ChevronDown className="h-3 w-3 opacity-60" /></button>
            </Hint>
            <button onClick={() => setOpen(!open)} className="flex items-center gap-1 hover:text-foreground">
              <Sliders className="h-3 w-3" /> {open ? "Hide" : "Tune"}
            </button>
          </div>
          <div className="rounded-3xl border border-border px-3 pt-2 pb-2" style={{ backgroundColor: "#1C1C1C" }}>
            <textarea
              rows={2}
              placeholder="Type a thought…"
              className="block w-full resize-none bg-transparent px-2 text-[15px] placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-0.5 text-muted-foreground">
                <Hint label="Attach" keys={SHORTCUTS.attach}><button className="rounded-full p-2 hover:bg-white/5 hover:text-foreground"><Paperclip className="h-4 w-4" /></button></Hint>
                <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="rounded-full p-2 hover:bg-white/5 hover:text-foreground"><Mic className="h-4 w-4" /></button></Hint>
                <Hint label="Tools" keys={SHORTCUTS.tools}><button className="rounded-full p-2 hover:bg-white/5 hover:text-foreground"><Wrench className="h-4 w-4" /></button></Hint>
              </div>
              <Hint label="Send" keys={SHORTCUTS.send}>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background"><ArrowUp className="h-4 w-4" /></button>
              </Hint>
            </div>
          </div>
          <div className="mt-3 mx-auto h-1 w-32 rounded-full bg-foreground/40" />
        </div>
      </div>

      <div className="mx-auto mt-6 flex w-[390px] justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>v9 · Compact · 390pt</span>
        <Link to="/" className="hover:text-foreground">← Index</Link>
      </div>
    </div>
  );
}
function Row({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])} className="flex w-full items-center justify-between text-muted-foreground">
      <span>{label}</span><span className="text-foreground">{value}</span>
    </button>
  );
}
function RowSwitch({ label, on, setOn }: any) {
  return (
    <button onClick={() => setOn(!on)} className="flex w-full items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className={`flex h-5 w-9 items-center rounded-full p-0.5 ${on ? "bg-foreground" : "bg-border"}`}>
        <span className={`h-4 w-4 rounded-full bg-background transition-transform ${on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
