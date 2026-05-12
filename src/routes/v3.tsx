import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v3")({ component: V3 });

function Tile({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>{children}</div>;
}

function V3() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.005 80)" }}>
      <div className="mx-auto max-w-[1200px] px-8 py-10 text-foreground">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-foreground" />
            <span className="text-sm tracking-tight">Lumen Studio</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>Workspace · Emma</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-[10px]">EM</span>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-6 grid-rows-[auto_auto_auto] gap-4">
          {/* Hero composer */}
          <Tile className="col-span-4 row-span-2 flex flex-col">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">New thread</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">No. 0184</p>
            </div>
            <h1 className="mt-10 text-4xl leading-tight tracking-tight">
              What are we<br />working on, Emma?
            </h1>
            <textarea
              rows={4}
              placeholder="Type a question, paste a doc, or drag a file…"
              className="mt-8 w-full flex-1 resize-none bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <div className="flex gap-2">
                <button className="rounded-md border border-border px-3 py-1.5 text-xs">Lumen 4</button>
                <button className="rounded-md border border-border px-3 py-1.5 text-xs">Considered</button>
                <button className="rounded-md border border-border px-3 py-1.5 text-xs">+ Memory</button>
              </div>
              <button className="rounded-md bg-foreground px-4 py-1.5 text-xs text-background">Send ↵</button>
            </div>
          </Tile>

          {/* Memory */}
          <Tile className="col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Memory</p>
            <p className="mt-3 text-sm leading-snug">
              Remembers your tone, your projects, and the people you write to.
            </p>
            <div className="mt-5 space-y-1.5 font-mono text-[11px] text-muted-foreground">
              <div>· Tone — quiet, exact</div>
              <div>· Projects — 4 active</div>
              <div>· People — 12 known</div>
            </div>
          </Tile>

          {/* Agents */}
          <Tile className="col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Agents</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border pb-2"><span>Reader</span><span className="font-mono text-[10px] text-muted-foreground">idle</span></div>
              <div className="flex items-center justify-between border-b border-border pb-2"><span>Researcher</span><span className="font-mono text-[10px] text-muted-foreground">idle</span></div>
              <div className="flex items-center justify-between"><span>Editor</span><span className="font-mono text-[10px] text-muted-foreground">on</span></div>
            </div>
          </Tile>

          {/* Recent */}
          <Tile className="col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recent threads</p>
            <ul className="mt-4 divide-y divide-border text-sm">
              <li className="flex justify-between py-2"><span>Letter to Hannah, third draft</span><span className="font-mono text-[10px] text-muted-foreground">2h</span></li>
              <li className="flex justify-between py-2"><span>Lisbon, three days, quiet pace</span><span className="font-mono text-[10px] text-muted-foreground">yesterday</span></li>
              <li className="flex justify-between py-2"><span>Stripe Q1 — paraphrase</span><span className="font-mono text-[10px] text-muted-foreground">Mon</span></li>
              <li className="flex justify-between py-2"><span>Reading list, May</span><span className="font-mono text-[10px] text-muted-foreground">Sun</span></li>
            </ul>
          </Tile>

          {/* Suggestions */}
          <Tile className="col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Try</p>
            <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
              <button className="rounded-lg border border-border px-3 py-2 text-left hover:bg-muted">"Summarize the week, in five lines."</button>
              <button className="rounded-lg border border-border px-3 py-2 text-left hover:bg-muted">"Help me decide between the two offers."</button>
              <button className="rounded-lg border border-border px-3 py-2 text-left hover:bg-muted">"Read this PDF and pull the three quiet claims."</button>
            </div>
          </Tile>
        </div>

        <footer className="mt-10 flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>v3 · Bento Studio</span>
          <Link to="/" className="hover:text-foreground">← Index</Link>
        </footer>
      </div>
    </div>
  );
}
