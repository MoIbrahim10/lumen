import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v9")({ component: V9 });

function V9() {
  return (
    <div className="dark min-h-screen w-full bg-foreground/5 py-10" style={{ backgroundColor: "#1A1A1A" }}>
      {/* Phone frame */}
      <div className="mx-auto flex w-[390px] flex-col overflow-hidden rounded-[44px] border border-border" style={{ backgroundColor: "#0E0E0E", height: "844px" }}>
        <div className="flex items-center justify-between px-6 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>9:41</span>
          <span>Lumen</span>
          <span>EM</span>
        </div>

        <div className="flex-1 overflow-hidden px-6 pt-14 text-foreground">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Tuesday evening</p>
          <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-foreground">
            Hi Emma.<br />
            <span className="text-muted-foreground">What's the thought?</span>
          </h1>

          <div className="mt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Pick one</p>
            <div className="mt-3 space-y-2">
              {[
                "Read me the news, briefly",
                "Draft a kind reply to Hannah",
                "Plan three quiet days in Lisbon",
                "Sleep on the offer with me",
                "What did I say last week?",
              ].map((s) => (
                <button
                  key={s}
                  className="block w-full rounded-2xl border border-border px-5 py-4 text-left text-[15px] text-foreground hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom composer */}
        <div className="border-t border-border px-4 pt-3 pb-6" style={{ backgroundColor: "#141414" }}>
          <div className="flex items-center justify-between pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Lumen 4 · Standard</span>
            <span>Memory on</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5" style={{ backgroundColor: "#1C1C1C" }}>
            <input
              placeholder="Type a thought…"
              className="flex-1 bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-sm">↑</button>
          </div>
          <div className="mt-3 h-1 w-32 rounded-full bg-foreground/40 mx-auto" />
        </div>
      </div>

      <div className="mx-auto mt-6 flex w-[390px] justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>v9 · Compact · 390pt</span>
        <Link to="/" className="hover:text-foreground">← Index</Link>
      </div>
    </div>
  );
}
