import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v2")({ component: V2 });

function V2() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-foreground/80">
        <div className="mx-auto flex max-w-7xl items-end justify-between px-10 py-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Vol. IV · No. 132 · Tuesday</div>
          <h2 className="font-serif text-3xl tracking-tight">The Lumen Daily</h2>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Emma M. · Subscriber</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-10 py-16">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">The Editor's Prompt</p>
            <h1 className="mt-4 font-serif text-7xl leading-[1.02] tracking-tight">
              What shall we<br /><em className="font-normal italic text-muted-foreground">make today?</em>
            </h1>

            <div className="mt-12 border-t border-b border-foreground/80">
              <textarea
                placeholder="Begin a thought. Press return to file."
                rows={3}
                className="w-full resize-none bg-transparent py-6 font-serif text-2xl leading-snug placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <div className="flex gap-6">
                <span>Model · Lumen 4</span>
                <span>Voice · Editorial</span>
                <span>Length · Considered</span>
              </div>
              <button className="border-b border-foreground pb-0.5 text-foreground">File piece →</button>
            </div>
          </div>

          <aside className="col-span-4 border-l border-border pl-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">In this issue</p>
            <ul className="mt-6 space-y-6">
              {[
                ["07:42", "On the quiet death of the homepage"],
                ["09:15", "A short letter to Hannah, redrafted"],
                ["11:03", "Notes on Lisbon, in three voices"],
                ["14:20", "Stripe Q1 — read aloud, paraphrased"],
              ].map(([t, h]) => (
                <li key={t} className="border-b border-border pb-4">
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t}</div>
                  <div className="mt-1 font-serif text-lg leading-snug">{h}</div>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="mt-20 grid grid-cols-12 gap-10 border-t border-foreground/80 pt-8">
          <div className="col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Suggestions</p>
            <p className="mt-3 font-serif text-xl leading-snug">"Read me the morning, briefly."</p>
          </div>
          <div className="col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Suggestions</p>
            <p className="mt-3 font-serif text-xl leading-snug">"Help me think through the offer."</p>
          </div>
          <div className="col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Suggestions</p>
            <p className="mt-3 font-serif text-xl leading-snug">"Draft three openings, in your voice."</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-foreground/80 px-10 py-5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <div className="mx-auto flex max-w-7xl justify-between">
          <span>v2 · Editorial Broadsheet</span>
          <Link to="/" className="hover:text-foreground">← Index</Link>
        </div>
      </footer>
    </div>
  );
}
