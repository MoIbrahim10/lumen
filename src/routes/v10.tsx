import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v10")({ component: V10 });

const rows = [
  ["0184", "Letter to Hannah, third draft", "Drafting", "Lumen 4", "Considered", "12m", "2h ago"],
  ["0183", "Stripe Q1 2026 — paraphrased notes", "Reading", "Lumen 4", "Plain", "38m", "Mon"],
  ["0182", "Lisbon, three days, quiet pace", "Planning", "Lumen 4", "Editorial", "21m", "Sun"],
  ["0181", "Reading list, May", "Listing", "Lumen 3", "Direct", "06m", "Sat"],
  ["0180", "Decision tree — the offer", "Thinking", "Lumen 4", "Considered", "44m", "Fri"],
  ["0179", "Memo to staff, honest tone", "Drafting", "Lumen 4", "Direct", "18m", "Thu"],
  ["0178", "What did I think on Monday?", "Recall", "Lumen 4", "Plain", "03m", "Thu"],
  ["0177", "Compress paper into one screen", "Summarising", "Lumen 4", "Exact", "11m", "Wed"],
];

function V10() {
  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground" style={{ backgroundColor: "#101010" }}>
        {/* Top composer dock */}
        <header className="border-b border-border px-8 pt-6 pb-5">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Lumen / Archive</span>
            <span>Console · Emma M. · Pro</span>
          </div>
          <div className="mx-auto mt-4 flex max-w-[1280px] items-center gap-3 rounded-md border border-border px-4 py-3" style={{ backgroundColor: "#161616" }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">/ new</span>
            <input
              placeholder="Open a new thread, or query the archive…"
              className="flex-1 bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="rounded border border-border px-2 py-1">Lumen 4</span>
              <span className="rounded border border-border px-2 py-1">Considered</span>
              <span className="rounded border border-border px-2 py-1">Memory · 12</span>
              <button className="rounded border border-foreground px-2 py-1 text-foreground">Send ⏎</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-8 py-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Library</p>
              <h1 className="mt-2 text-3xl font-light tracking-tight">184 conversations, kept quietly.</h1>
            </div>
            <div className="flex gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <button className="text-foreground">All</button>
              <button>Drafting</button>
              <button>Reading</button>
              <button>Planning</button>
              <button>Recall</button>
            </div>
          </div>

          <table className="mt-10 w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-border font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <th className="py-3 text-left font-normal">No.</th>
                <th className="py-3 text-left font-normal">Title</th>
                <th className="py-3 text-left font-normal">State</th>
                <th className="py-3 text-left font-normal">Model</th>
                <th className="py-3 text-left font-normal">Style</th>
                <th className="py-3 text-right font-normal">Time</th>
                <th className="py-3 text-right font-normal">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]} className="border-b border-border hover:bg-muted/40">
                  <td className="py-3 font-mono text-[12px] text-muted-foreground">{r[0]}</td>
                  <td className="py-3">{r[1]}</td>
                  <td className="py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{r[2]}</td>
                  <td className="py-3 font-mono text-[12px] text-muted-foreground">{r[3]}</td>
                  <td className="py-3 font-mono text-[12px] text-muted-foreground">{r[4]}</td>
                  <td className="py-3 text-right font-mono text-[12px] text-muted-foreground">{r[5]}</td>
                  <td className="py-3 text-right font-mono text-[12px] text-muted-foreground">{r[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <footer className="mt-16 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>v10 · Archive Dashboard</span>
            <Link to="/" className="hover:text-foreground">← Index</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
