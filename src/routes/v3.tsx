import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus, ChevronDown, Globe, Brain, Zap } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v3")({ component: V3 });

function V3() {
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="min-h-screen text-foreground" style={{ backgroundColor: "oklch(0.97 0 0)" }}>
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-10 pt-7">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-foreground" />
          <span className="text-sm tracking-tight">Lumen Studio</span>
        </div>
        <div className="flex items-center gap-7 text-sm text-muted-foreground">
          <span>Threads</span><span>Library</span><span>Agents</span><span>Settings</span>
        </div>
      </nav>

      <main className="mx-auto max-w-[1240px] px-10 pt-12 pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tuesday · soft hours</p>
        <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">Hi Emma. <span className="text-muted-foreground">What are we making?</span></h1>

        <div className="mt-10 grid grid-cols-12 gap-4">
          {/* Composer hero tile */}
          <section className="col-span-12 rounded-3xl border border-border bg-card p-6 lg:col-span-8">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Compose</p>
              <Hint label="Switch model" keys={SHORTCUTS.model}>
                <button className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-muted">
                  Lumen 4 · Sonnet <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </Hint>
            </div>
            <textarea
              rows={4}
              placeholder="Ask, plan, draft, or paste anything…"
              className="mt-4 block w-full resize-none bg-transparent text-[17px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Hint label="Attach" keys={SHORTCUTS.attach}><button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><Paperclip className="h-4 w-4" /></button></Hint>
                <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><Mic className="h-4 w-4" /></button></Hint>
                <Hint label="Tools & connectors" keys={SHORTCUTS.tools}><button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><Wrench className="h-4 w-4" /></button></Hint>
              </div>
              <Hint label="Send" keys={SHORTCUTS.send}>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background hover:opacity-90"><ArrowUp className="h-4 w-4" /></button>
              </Hint>
            </div>
          </section>

          {/* Style tile */}
          <section className="col-span-12 rounded-3xl border border-border bg-card p-6 lg:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Response style</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {styles.map((s) => (
                <button key={s} onClick={() => setStyle(s)}
                  className={`rounded-full px-3 py-1 text-[11px] transition-colors ${
                    style === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}>{s}</button>
              ))}
              <Hint label="Create style" keys={SHORTCUTS.newStyle}>
                <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n);} }}
                  className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                  <Plus className="h-3 w-3" /> New
                </button>
              </Hint>
            </div>
          </section>

          {/* Behaviour tile */}
          <section className="col-span-12 rounded-3xl border border-border bg-card p-6 lg:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Behaviour</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Knob label="Length" value={length} setValue={setLength} options={[...LENGTHS]} />
              <Knob label="Depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Toggle icon={Globe} label="Web" on={web} setOn={setWeb} />
              <Toggle icon={Brain} label="Memory" on={memory} setOn={setMemory} />
              <Toggle icon={Zap} label="Temporary" on={temp} setOn={setTemp} />
            </div>
          </section>

          {/* Quick actions tile */}
          <section className="col-span-12 rounded-3xl border border-border bg-card p-6 lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Quick actions</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-left text-[13px] hover:bg-accent">
                  <a.icon className="h-4 w-4 text-muted-foreground" /> {a.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto flex max-w-[1240px] justify-between px-10 pb-7 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>v3 · Bento Studio</span>
        <Link to="/" className="hover:text-foreground">← Index</Link>
      </footer>
    </div>
  );
}

function Knob({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])}
      className="rounded-xl bg-muted px-3 py-2.5 text-left hover:bg-accent">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13px]">{value}</p>
    </button>
  );
}
function Toggle({ icon: Icon, label, on, setOn }: any) {
  return (
    <button onClick={() => setOn(!on)}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] transition-colors ${
        on ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
      }`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
