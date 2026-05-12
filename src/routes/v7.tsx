import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v7")({ component: V7 });

function V7() {
  return (
    <div className="dark">
      <div className="min-h-screen bg-background font-mono text-foreground" style={{ backgroundColor: "#141414" }}>
        <div className="mx-auto max-w-4xl px-10 py-10">
          <header className="flex items-center justify-between border-b border-border pb-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>lumen :: session 0184</span>
            <span>emma@local · ready</span>
          </header>

          <section className="pt-16">
            <pre className="text-[11px] leading-relaxed text-muted-foreground">
{`──────────────────────────────────────────────────────────────
  L U M E N           a quiet machine for thinking
──────────────────────────────────────────────────────────────`}
            </pre>

            <h1 className="mt-12 text-3xl leading-snug tracking-tight">
              <span className="text-muted-foreground">&gt;</span> what would you like to think about,<br />
              &nbsp;&nbsp;tonight?
            </h1>

            <div className="mt-12 border-t border-b border-border py-4">
              <div className="flex items-start gap-3">
                <span className="select-none text-muted-foreground">▍</span>
                <textarea
                  rows={3}
                  placeholder="type a thought, or paste a passage…"
                  className="w-full resize-none bg-transparent text-base leading-relaxed placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <div><span className="opacity-50">model </span>lumen-4</div>
              <div><span className="opacity-50">tone </span>plain</div>
              <div><span className="opacity-50">length </span>auto</div>
              <div className="text-right"><button className="text-foreground">[ send ⏎ ]</button></div>
            </div>

            <pre className="mt-16 text-[11px] leading-relaxed text-muted-foreground">
{`── suggestions ──────────────────────────────────────────────`}
            </pre>

            <ul className="mt-4 space-y-2 text-sm">
              <li><span className="text-muted-foreground">01 ·</span> read me the q1 letter, slowly</li>
              <li><span className="text-muted-foreground">02 ·</span> draft a reply to hannah, kind but firm</li>
              <li><span className="text-muted-foreground">03 ·</span> plan three quiet days in lisbon</li>
              <li><span className="text-muted-foreground">04 ·</span> what did i think about this on monday?</li>
            </ul>

            <pre className="mt-16 text-[11px] leading-relaxed text-muted-foreground">
{`── recent ───────────────────────────────────────────────────`}
            </pre>

            <ul className="mt-3 grid grid-cols-2 gap-x-8 text-[12px]">
              <li className="flex justify-between border-b border-border py-2"><span>letter-to-hannah.md</span><span className="text-muted-foreground">2h</span></li>
              <li className="flex justify-between border-b border-border py-2"><span>stripe-q1.notes</span><span className="text-muted-foreground">mon</span></li>
              <li className="flex justify-between border-b border-border py-2"><span>lisbon.itinerary</span><span className="text-muted-foreground">sun</span></li>
              <li className="flex justify-between border-b border-border py-2"><span>reading.may</span><span className="text-muted-foreground">sat</span></li>
            </ul>
          </section>

          <footer className="mt-20 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>v7 · terminal editorial</span>
            <span>battery 88% · network ok · memory 12 entries</span>
            <Link to="/" className="hover:text-foreground">← index</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
