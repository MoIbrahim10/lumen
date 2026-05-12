import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Index });

const versions = [
  { n: "01", to: "/v1", title: "Quiet Canvas", note: "Light · Centered · Geometric sans", mode: "Light" },
  { n: "02", to: "/v2", title: "Editorial Broadsheet", note: "Light · Multi-column · Serif + sans", mode: "Light" },
  { n: "03", to: "/v3", title: "Bento Studio", note: "Light · Bento grid · Off-white", mode: "Light" },
  { n: "04", to: "/v4", title: "Brutalist Grid", note: "Light · 12-col · All-mono caps", mode: "Light" },
  { n: "05", to: "/v5", title: "Workspace Split", note: "Light · Three-rail · Document", mode: "Light" },
  { n: "06", to: "/v6", title: "Soft Graphite", note: "Dark · Centered · Quiet luxury", mode: "Dark" },
  { n: "07", to: "/v7", title: "Terminal Editorial", note: "Dark · Mono · Engineer-poet", mode: "Dark" },
  { n: "08", to: "/v8", title: "Cinematic Fullscreen", note: "Dark · Title-card · Serif display", mode: "Dark" },
  { n: "09", to: "/v9", title: "Compact Mobile-First", note: "Dark · 390px · Thumb-led", mode: "Dark" },
  { n: "10", to: "/v10", title: "Archive Dashboard", note: "Dark · Table · Research console", mode: "Dark" },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-6xl px-8 pt-24 pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Studio Index — 10 directions
        </p>
        <h1 className="mt-6 font-serif text-6xl leading-[1.05] tracking-tight md:text-7xl">
          A calmer surface for thinking with machines.
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground">
          Ten homepage concepts. Each one is a complete composer — prompt, voice,
          attach, model, tools, response style, length, depth, web, memory,
          temporary, quick actions — expressed with a different conviction.
        </p>
      </header>

      <div className="mx-auto max-w-6xl border-t border-border">
        <ul>
          {versions.map((v) => (
            <li key={v.n} className="border-b border-border">
              <Link
                to={v.to}
                className="grid grid-cols-12 items-baseline gap-6 px-8 py-7 transition-colors hover:bg-muted"
              >
                <span className="col-span-1 font-mono text-xs text-muted-foreground">{v.n}</span>
                <span className="col-span-5 text-2xl tracking-tight">{v.title}</span>
                <span className="col-span-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {v.note}
                </span>
                <span className="col-span-2 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {v.mode} ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mx-auto max-w-6xl px-8 py-16 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Neutral palette · Desktop 1440 · Press a row to view
      </footer>
    </div>
  );
}
