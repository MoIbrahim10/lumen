import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v5")({ component: V5 });

function V5() {
  return (
    <div className="grid min-h-screen grid-cols-[200px_1fr_260px] bg-background text-foreground">
      {/* Left rail */}
      <aside className="flex flex-col justify-between border-r border-border px-6 py-8">
        <div>
          <div className="text-sm tracking-tight">Lumen</div>
          <nav className="mt-12 space-y-1 text-sm">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
            <a className="block py-1 text-foreground">New thread</a>
            <a className="block py-1 text-muted-foreground hover:text-foreground">Library</a>
            <a className="block py-1 text-muted-foreground hover:text-foreground">Notes</a>
            <a className="block py-1 text-muted-foreground hover:text-foreground">People</a>

            <p className="mb-2 mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Threads</p>
            <a className="block truncate py-1 text-muted-foreground hover:text-foreground">Letter to Hannah</a>
            <a className="block truncate py-1 text-muted-foreground hover:text-foreground">Lisbon, May</a>
            <a className="block truncate py-1 text-muted-foreground hover:text-foreground">Stripe Q1 notes</a>
            <a className="block truncate py-1 text-muted-foreground hover:text-foreground">Reading, ongoing</a>
          </nav>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Emma M.<br />Pro · Quiet plan
        </div>
      </aside>

      {/* Center document */}
      <main className="flex justify-center px-16 py-16">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Untitled thread</span>
            <span>Tue · 18:42</span>
          </div>
          <h1 className="mt-12 text-4xl font-light leading-tight tracking-tight">
            A clean page, and someone patient on the other side.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Write in full sentences, fragments, or paste. Lumen will hold the thread, not interrupt it.
          </p>

          <div className="mt-16 border-t border-border pt-6">
            <textarea
              rows={6}
              placeholder="Begin here…"
              className="w-full resize-none bg-transparent text-lg leading-relaxed placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="mt-6 flex items-center justify-between text-xs">
              <div className="flex gap-4 text-muted-foreground">
                <span>Lumen 4</span>
                <span>·</span>
                <span>Considered tone</span>
                <span>·</span>
                <span>Memory on</span>
              </div>
              <button className="border-b border-foreground pb-0.5">Send →</button>
            </div>
          </div>

          <div className="mt-16">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Pick up where you left off</p>
            <ul className="mt-4 divide-y divide-border text-sm">
              <li className="flex justify-between py-3"><span>Letter to Hannah, third draft</span><span className="text-muted-foreground">2 hours ago</span></li>
              <li className="flex justify-between py-3"><span>Lisbon trip — quiet pace</span><span className="text-muted-foreground">Yesterday</span></li>
              <li className="flex justify-between py-3"><span>Notes on the Stripe Q1 letter</span><span className="text-muted-foreground">Monday</span></li>
            </ul>
          </div>
        </div>
      </main>

      {/* Right rail — context */}
      <aside className="border-l border-border px-6 py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Context · in scope</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start justify-between border-b border-border pb-3">
            <span>Hannah-thread.md</span>
            <span className="font-mono text-[10px] text-muted-foreground">attached</span>
          </li>
          <li className="flex items-start justify-between border-b border-border pb-3">
            <span>Stripe-Q1-2026.pdf</span>
            <span className="font-mono text-[10px] text-muted-foreground">12 pages</span>
          </li>
          <li className="flex items-start justify-between border-b border-border pb-3">
            <span>Calendar — this week</span>
            <span className="font-mono text-[10px] text-muted-foreground">linked</span>
          </li>
        </ul>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Memory · what I know</p>
        <p className="mt-3 text-sm leading-snug text-muted-foreground">
          You prefer short replies. You're writing more letters this season. You don't like exclamation marks.
        </p>

        <div className="mt-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>v5 · Workspace</span>
          <Link to="/" className="hover:text-foreground">← Index</Link>
        </div>
      </aside>
    </div>
  );
}
