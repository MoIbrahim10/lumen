import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v1")({ component: V1 });

function V1() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="flex items-center justify-between px-10 pt-8">
        <span className="text-sm tracking-tight">Lumen</span>
        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <span>Library</span>
          <span>Models</span>
          <span>Settings</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] text-background">EM</span>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tuesday · May 12</p>
        <h1 className="mt-8 max-w-3xl text-center text-5xl font-light leading-tight tracking-tight md:text-6xl">
          Good evening, Emma.<br /><span className="text-muted-foreground">What's on your mind?</span>
        </h1>

        <div className="mt-16 w-full max-w-2xl">
          <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
            <input
              placeholder="Ask anything, or paste a thought…"
              className="w-full bg-transparent text-lg font-light placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <button className="rounded-full border border-border px-3 py-1.5">Lumen 4 · Standard</button>
                <button className="rounded-full border border-border px-3 py-1.5">Tone — Considered</button>
              </div>
              <button className="rounded-full bg-foreground px-4 py-1.5 text-xs text-background">Send</button>
            </div>
          </div>

          <div className="mt-10 h-px w-full bg-border" />

          <div className="mt-8 grid grid-cols-3 gap-x-8 text-sm text-muted-foreground">
            <button className="text-left hover:text-foreground">Plan a quiet weekend in Lisbon</button>
            <button className="text-left hover:text-foreground">Summarize the Stripe Q1 letter</button>
            <button className="text-left hover:text-foreground">Draft a kind reply to Hannah</button>
          </div>
        </div>
      </main>

      <footer className="flex justify-between px-10 pb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>v1 · Quiet Canvas</span>
        <Link to="/" className="hover:text-foreground">← All versions</Link>
      </footer>
    </div>
  );
}
