import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v6")({ component: V6 });

function V6() {
  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground" style={{ backgroundColor: "#0E0E0E" }}>
        <nav className="flex items-center justify-between px-12 pt-10">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-foreground" />
            <span className="text-sm tracking-tight">Lumen</span>
          </div>
          <div className="flex items-center gap-10 text-sm text-muted-foreground">
            <span>Threads</span>
            <span>Models</span>
            <span>Account</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-[10px]">EM</span>
          </div>
        </nav>

        <main className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-40 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Evening · soft mode</p>
          <h1 className="mt-6 text-5xl font-light leading-tight tracking-tight md:text-6xl">
            Take your time.<br />
            <span className="text-muted-foreground">I'm listening.</span>
          </h1>

          <div className="mt-20 w-full">
            <div className="rounded-[14px] border border-border" style={{ backgroundColor: "#161616" }}>
              <input
                placeholder="Speak plainly. Press return to send."
                className="w-full bg-transparent px-6 py-5 text-lg font-light placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="flex gap-1.5">
                  <button className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Lumen 4</button>
                  <button className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Standard</button>
                  <button className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">+ File</button>
                </div>
                <button className="rounded-md bg-foreground px-4 py-1.5 text-xs text-background">Send</button>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              {[
                "Help me sleep on a decision",
                "Read this back to me",
                "Find the quiet point in this argument",
                "What did I say about this last week?",
              ].map((s) => (
                <button key={s} className="rounded-full border border-border px-4 py-2 hover:text-foreground">{s}</button>
              ))}
            </div>
          </div>
        </main>

        <footer className="mt-32 flex justify-between px-12 pb-10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>v6 · Soft Graphite</span>
          <Link to="/" className="hover:text-foreground">← Index</Link>
        </footer>
      </div>
    </div>
  );
}
