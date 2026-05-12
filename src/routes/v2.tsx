import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v2")({ component: V2 });

function V2() {
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Masthead */}
      <header className="border-b border-foreground">
        <div className="mx-auto flex max-w-[1240px] items-end justify-between px-10 pt-6 pb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">No. 184 · Tuesday · May 12</span>
          <h2 className="font-serif text-3xl tracking-tight">Lumen</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Edition · Personal</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-10 pt-14 pb-20">
        <div className="grid grid-cols-12 gap-10">
          {/* Hero column */}
          <section className="col-span-7 border-r border-border pr-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Today's prompt</p>
            <h1 className="mt-4 font-serif text-[68px] leading-[0.98] tracking-tight">
              Ready when<br /><em className="italic text-muted-foreground">you are, Emma.</em>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Your study, kept tidy. Eight conversations rest in the library; a draft to Hannah waits on the desk.
            </p>

            {/* Composer */}
            <div className="mt-10 border-t-2 border-foreground pt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Composer</p>
              <textarea
                rows={3}
                placeholder="Type a sentence, a question, or a thought —"
                className="mt-3 block w-full resize-none bg-transparent font-serif text-2xl leading-snug placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Hint label="Attach" keys={SHORTCUTS.attach}><button className="flex items-center gap-1 hover:text-foreground"><Paperclip className="h-3.5 w-3.5" /> File</button></Hint>
                  <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="flex items-center gap-1 hover:text-foreground"><Mic className="h-3.5 w-3.5" /> Voice</button></Hint>
                  <Hint label="Tools" keys={SHORTCUTS.tools}><button className="flex items-center gap-1 hover:text-foreground"><Wrench className="h-3.5 w-3.5" /> Tools</button></Hint>
                  <Hint label="Model" keys={SHORTCUTS.model}><button className="hover:text-foreground">Model · Lumen 4</button></Hint>
                </div>
                <Hint label="Send" keys={SHORTCUTS.send}>
                  <button className="flex items-center gap-2 border-b-2 border-foreground pb-0.5 font-mono text-[11px] uppercase tracking-[0.2em] hover:opacity-70">
                    Send <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </Hint>
              </div>
            </div>
          </section>

          {/* Side column: response controls + quick actions */}
          <aside className="col-span-5 space-y-9">
            <Section title="I. Response style">
              <div className="flex flex-wrap gap-1.5">
                {styles.map((s) => (
                  <button key={s} onClick={() => setStyle(s)}
                    className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                      style === s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
                    }`}>{s}</button>
                ))}
                <Hint label="Create" keys={SHORTCUTS.newStyle}>
                  <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n);} }}
                    className="flex items-center gap-1 border border-dashed border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    <Plus className="h-3 w-3" /> New
                  </button>
                </Hint>
              </div>
            </Section>

            <Section title="II. Behaviour">
              <div className="grid grid-cols-2 gap-y-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <Cycle label="Length" value={length} setValue={setLength} options={[...LENGTHS]} />
                <Cycle label="Depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
                <Switch label="Web search" on={web} setOn={setWeb} />
                <Switch label="Memory" on={memory} setOn={setMemory} />
                <Switch label="Temporary chat" on={temp} setOn={setTemp} />
              </div>
            </Section>

            <Section title="III. Quick actions">
              <ul className="space-y-1.5 text-[14px]">
                {QUICK_ACTIONS.map((a, i) => (
                  <li key={a.label}>
                    <button className="group flex items-baseline gap-3 hover:text-foreground">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">0{i + 1}</span>
                      <span className="border-b border-transparent group-hover:border-foreground">{a.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          </aside>
        </div>
      </main>

      <footer className="mx-auto flex max-w-[1240px] justify-between border-t border-border px-10 py-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>v2 · Editorial Broadsheet</span>
        <Link to="/" className="hover:text-foreground">← Index</Link>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Cycle({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])} className="text-left hover:text-foreground">
      {label} <span className="text-foreground normal-case tracking-normal">— {value}</span>
    </button>
  );
}
function Switch({ label, on, setOn }: any) {
  return (
    <button onClick={() => setOn(!on)} className="flex items-center gap-2 text-left hover:text-foreground">
      <span className={`h-2 w-2 ${on ? "bg-foreground" : "bg-border"}`} />
      <span className={on ? "text-foreground" : ""}>{label}</span>
    </button>
  );
}
