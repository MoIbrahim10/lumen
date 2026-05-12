import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus, ChevronDown } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v1")({ component: V1 });

function V1() {
  const [style, setStyle] = useState<string>("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <nav className="flex items-center justify-between px-10 pt-7">
        <span className="text-sm tracking-tight">Lumen</span>
        <div className="flex items-center gap-7 text-sm text-muted-foreground">
          <span>Library</span>
          <span>Models</span>
          <span>Settings</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] text-background">EM</span>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tuesday · 18:42</p>
        <h1 className="mt-7 max-w-2xl text-center text-5xl font-light leading-[1.1] tracking-tight md:text-[56px]">
          What's on your mind, <span className="text-muted-foreground">Emma?</span>
        </h1>

        <div className="mt-12 w-full max-w-[640px]">
          {/* Composer */}
          <div className="rounded-2xl border border-border bg-card px-5 pt-4 pb-3">
            <textarea
              rows={2}
              placeholder="Ask anything, or paste a thought…"
              className="block w-full resize-none bg-transparent text-[16px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Hint label="Attach" keys={SHORTCUTS.attach}>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><Paperclip className="h-4 w-4" /></button>
                </Hint>
                <Hint label="Dictate" keys={SHORTCUTS.voice}>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><Mic className="h-4 w-4" /></button>
                </Hint>
                <Hint label="Tools & connectors" keys={SHORTCUTS.tools}>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><Wrench className="h-4 w-4" /></button>
                </Hint>
                <span className="mx-1 h-5 w-px bg-border" />
                <Hint label="Switch model" keys={SHORTCUTS.model}>
                  <button className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                    Lumen 4 <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </Hint>
              </div>
              <Hint label="Send" keys={SHORTCUTS.send}>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background hover:opacity-90"><ArrowUp className="h-4 w-4" /></button>
              </Hint>
            </div>
          </div>

          {/* Style row + create */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            {styles.map((s) => (
              <button key={s} onClick={() => setStyle(s)}
                className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                  style === s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
                }`}>
                {s}
              </button>
            ))}
            <Hint label="Create style" keys={SHORTCUTS.newStyle}>
              <button onClick={() => {
                const name = prompt("Name your style");
                if (name) { setStyles([...styles, name]); setStyle(name); }
              }} className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                <Plus className="h-3 w-3" /> New
              </button>
            </Hint>
          </div>

          {/* Length / depth / toggles */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
            <Cycle label="Length" value={length} setValue={setLength} options={[...LENGTHS]} />
            <Cycle label="Depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
            <Switch label="Web" on={web} setOn={setWeb} />
            <Switch label="Memory" on={memory} setOn={setMemory} />
            <Switch label="Temporary" on={temp} setOn={setTemp} />
          </div>

          <div className="my-7 h-px w-full bg-border" />

          {/* Quick actions */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground">
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="flex justify-between px-10 pb-7 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>v1 · Quiet Canvas</span>
        <Link to="/" className="hover:text-foreground">← All versions</Link>
      </footer>
    </div>
  );
}

function Cycle({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: string[] }) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])} className="hover:text-foreground">
      <span className="opacity-60">{label} · </span>
      <span className="text-foreground">{value}</span>
    </button>
  );
}
function Switch({ label, on, setOn }: { label: string; on: boolean; setOn: (v: boolean) => void }) {
  return (
    <button onClick={() => setOn(!on)} className="flex items-center gap-1.5 hover:text-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-foreground" : "bg-muted-foreground/40"}`} />
      <span className={on ? "text-foreground" : ""}>{label}</span>
    </button>
  );
}
