import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v4")({ component: V4 });

function V4() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 12-col grid hairlines */}
      <div className="pointer-events-none fixed inset-0 mx-auto grid max-w-[1280px] grid-cols-12 gap-0 px-10">
        {Array.from({ length: 13 }).map((_, i) => (
          <div key={i} className="h-full border-l border-border/60" style={{ gridColumn: `${i + 1} / span 1` }} />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1280px] px-10">
        <header className="grid grid-cols-12 border-b border-foreground py-4 font-mono text-[10px] uppercase tracking-[0.22em]">
          <div className="col-span-3">Lumen / Index</div>
          <div className="col-span-6">Document — Untitled — May 12 — 18:42</div>
          <div className="col-span-3 text-right">Operator · Emma M.</div>
        </header>

        <section className="grid grid-cols-12 gap-x-6 pt-20 pb-10">
          <p className="col-span-12 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">§ 01 — Prompt</p>
          <h1 className="col-span-12 mt-4 text-[140px] font-medium leading-[0.92] tracking-[-0.04em]">
            THINK<br /><span className="text-muted-foreground">OUT LOUD.</span>
          </h1>
        </section>

        <section className="grid grid-cols-12 gap-x-6 border-t border-foreground py-8">
          <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">§ 02<br />Composer</div>
          <div className="col-span-10">
            <textarea
              rows={4}
              placeholder="ENTER QUERY—"
              className="w-full resize-none border-b border-foreground bg-transparent pb-3 font-mono text-2xl uppercase tracking-tight placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="mt-4 grid grid-cols-12 gap-x-6 font-mono text-[10px] uppercase tracking-[0.22em]">
              <div className="col-span-3"><span className="text-muted-foreground">Model </span>LUMEN-4</div>
              <div className="col-span-3"><span className="text-muted-foreground">Style </span>DIRECT</div>
              <div className="col-span-3"><span className="text-muted-foreground">Length </span>EXACT</div>
              <div className="col-span-3 text-right"><button className="border border-foreground px-3 py-1.5">EXECUTE →</button></div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-12 gap-x-6 border-t border-foreground py-8">
          <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">§ 03<br />Suggestions</div>
          <ul className="col-span-10 grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.14em]">
            <li className="border-b border-border py-3">→ DRAFT MEMO TO STAFF — TONE: HONEST</li>
            <li className="border-b border-border py-3">→ COMPRESS PDF INTO ONE SCREEN</li>
            <li className="border-b border-border py-3">→ DEBATE: REMOTE / IN-OFFICE</li>
            <li className="border-b border-border py-3">→ EXTRACT NUMBERS FROM Q1 LETTER</li>
          </ul>
        </section>

        <footer className="grid grid-cols-12 border-t border-foreground py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <div className="col-span-6">v4 · Brutalist Grid</div>
          <div className="col-span-6 text-right"><Link to="/" className="text-foreground">← INDEX</Link></div>
        </footer>
      </div>
    </div>
  );
}
