import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus, MessageSquare, Star, FolderKanban, Bot, Bookmark, Search, Settings } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v5")({ component: V5 });

function V5() {
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  const nav = [
    { icon: MessageSquare, label: "Recent", n: 184 },
    { icon: Star, label: "Favorites", n: 12 },
    { icon: FolderKanban, label: "Projects", n: 6 },
    { icon: Bot, label: "Agents", n: 4 },
    { icon: Bookmark, label: "Saved prompts", n: 28 },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left rail */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border bg-muted/30 md:flex">
        <div className="flex items-center gap-2 px-5 pt-5 text-sm tracking-tight">
          <div className="h-5 w-5 rounded-sm border border-foreground" /> Lumen
        </div>
        <button className="mx-3 mt-5 flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm hover:bg-muted">
          <span className="flex items-center gap-2"><Plus className="h-4 w-4" />New</span>
          <span className="font-mono text-[10px] text-muted-foreground">⌘N</span>
        </button>
        <button className="mx-3 mt-1 flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
          <span className="flex items-center gap-2"><Search className="h-4 w-4" />Search</span>
          <span className="font-mono text-[10px]">⌘K</span>
        </button>
        <nav className="mt-4 px-2">
          {nav.map((it) => (
            <button key={it.label} className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground">
              <span className="flex items-center gap-2"><it.icon className="h-3.5 w-3.5" />{it.label}</span>
              <span className="font-mono text-[10px]">{it.n}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-border px-3 py-3">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[10px] text-background">EM</span>
            <span className="text-[13px]">Emma M.</span>
            <Settings className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </aside>

      {/* Center document */}
      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-8 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Untitled · Tuesday 18:42</span>
          <span>Saved · 0 changes</span>
        </header>

        <div className="mx-auto w-full max-w-[680px] px-8 pt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">New thread</p>
          <h1 className="mt-3 text-3xl font-light tracking-tight">What are we working on, Emma?</h1>

          {/* Doc-like composer */}
          <div className="mt-10 border-t border-border pt-6">
            <textarea
              rows={4}
              placeholder="Start typing. The page becomes the prompt."
              className="block w-full resize-none bg-transparent text-[16px] leading-[1.7] placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Hint label="Attach" keys={SHORTCUTS.attach}><button className="rounded-md p-1.5 hover:bg-muted hover:text-foreground"><Paperclip className="h-4 w-4" /></button></Hint>
              <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="rounded-md p-1.5 hover:bg-muted hover:text-foreground"><Mic className="h-4 w-4" /></button></Hint>
              <Hint label="Tools" keys={SHORTCUTS.tools}><button className="rounded-md p-1.5 hover:bg-muted hover:text-foreground"><Wrench className="h-4 w-4" /></button></Hint>
            </div>
            <div className="flex items-center gap-2">
              <Hint label="Model" keys={SHORTCUTS.model}>
                <button className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">Lumen 4</button>
              </Hint>
              <Hint label="Send" keys={SHORTCUTS.send}>
                <button className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background hover:opacity-90">
                  Send <ArrowUp className="h-3 w-3" />
                </button>
              </Hint>
            </div>
          </div>

          <div className="mt-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Quick actions</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:text-foreground">
                  <a.icon className="h-3.5 w-3.5" /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-auto flex justify-between border-t border-border px-8 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>v5 · Workspace Split</span>
          <Link to="/" className="hover:text-foreground">← Index</Link>
        </footer>
      </main>

      {/* Right rail: properties */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-l border-border bg-muted/30 px-5 py-6 lg:flex">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Response style</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {styles.map((s) => (
            <button key={s} onClick={() => setStyle(s)}
              className={`rounded px-2 py-0.5 text-[11px] ${
                style === s ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground"
              }`}>{s}</button>
          ))}
          <Hint label="New style" keys={SHORTCUTS.newStyle}>
            <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n); } }}
              className="flex items-center gap-0.5 rounded border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground">
              <Plus className="h-2.5 w-2.5" /> New
            </button>
          </Hint>
        </div>

        <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Behaviour</p>
        <div className="mt-3 space-y-2 text-[12px]">
          <Row label="Length" value={length} setValue={setLength} options={[...LENGTHS]} />
          <Row label="Depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
          <RowSwitch label="Web search" on={web} setOn={setWeb} />
          <RowSwitch label="Memory" on={memory} setOn={setMemory} />
          <RowSwitch label="Temporary" on={temp} setOn={setTemp} />
        </div>

        <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Context</p>
        <p className="mt-2 text-[12px] text-muted-foreground">12 of 200 memories loaded · synced 18:40</p>
      </aside>
    </div>
  );
}
function Row({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  return (
    <button onClick={() => setValue(options[(i + 1) % options.length])} className="flex w-full items-center justify-between text-muted-foreground hover:text-foreground">
      <span>{label}</span><span className="text-foreground">{value}</span>
    </button>
  );
}
function RowSwitch({ label, on, setOn }: any) {
  return (
    <button onClick={() => setOn(!on)} className="flex w-full items-center justify-between text-muted-foreground hover:text-foreground">
      <span>{label}</span>
      <span className={`flex h-4 w-7 items-center rounded-full p-0.5 ${on ? "bg-foreground" : "bg-border"}`}>
        <span className={`h-3 w-3 rounded-full bg-background transition-transform ${on ? "translate-x-3" : ""}`} />
      </span>
    </button>
  );
}
