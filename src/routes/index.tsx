import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Index });

// Real piano layout — 10 keys arranged like a keyboard octave
// White keys: 1,2,3,4,5,6,7  → versions 1,2,4,5,7,9,10
// Black keys: positioned between → versions 3,6,8
const KEYS: { v: string; to: string; name: string; black: boolean; pos: number }[] = [
  { v: "01", to: "/v1",  name: "Piano",     black: false, pos: 0 },
  { v: "02", to: "/v2",  name: "Document",  black: false, pos: 1 },
  { v: "03", to: "/v3",  name: "Framed",    black: true,  pos: 1.5 },
  { v: "04", to: "/v4",  name: "3D Depth",  black: false, pos: 2 },
  { v: "05", to: "/v5",  name: "Mechanical",black: false, pos: 3 },
  { v: "06", to: "/v6",  name: "Glass",     black: true,  pos: 3.5 },
  { v: "07", to: "/v7",  name: "Dot Matrix",black: false, pos: 4 },
  { v: "08", to: "/v8",  name: "Embossed",  black: true,  pos: 4.5 },
  { v: "09", to: "/v9",  name: "Etched",    black: false, pos: 5 },
  { v: "10", to: "/v10", name: "Stacked",   black: false, pos: 6 },
];

function Index() {
  const whiteW = 120; // px
  const totalW = whiteW * 7 + 40;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-foreground">
      <header className="mx-auto max-w-6xl px-8 pt-20 pb-12 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-500">
          Studio Index — 10 directions
        </p>
        <h1 className="mt-6 font-serif text-6xl leading-[1.05] tracking-tight text-neutral-100 md:text-7xl">
          Press a key.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-neutral-400">
          Same composer, ten button languages. Pick the one that feels inevitable —
          piano keys, paper, framed, extruded, mechanical, glass, dot-matrix,
          embossed, etched, stacked.
        </p>
      </header>

      {/* Piano */}
      <div className="mx-auto flex justify-center px-8 pb-10">
        <div
          className="relative rounded-2xl bg-gradient-to-b from-[#0a0a0a] to-[#1f1f1f] p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
          style={{ width: totalW }}
        >
          <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            <span>Lumen · Console</span>
            <span>10 · keys</span>
          </div>
          <div className="relative h-[340px]">
            {/* white keys */}
            {KEYS.filter((k) => !k.black).map((k) => (
              <Link
                key={k.v}
                to={k.to}
                className="piano-key absolute top-0 flex flex-col justify-end px-3 pb-5 text-center"
                style={{ left: k.pos * whiteW, width: whiteW - 4 }}
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">{k.v}</span>
                <span className="mt-1 text-sm text-neutral-800">{k.name}</span>
              </Link>
            ))}
            {/* black keys */}
            {KEYS.filter((k) => k.black).map((k) => (
              <Link
                key={k.v}
                to={k.to}
                className="piano-key black absolute top-0 flex flex-col justify-end px-2 pb-4 text-center"
                style={{ left: k.pos * whiteW + 16, width: whiteW - 36 }}
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">{k.v}</span>
                <span className="mt-1 text-xs text-neutral-200">{k.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer className="mx-auto max-w-6xl px-8 pb-16 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        Neutral palette · Desktop 1440 · Press a key to enter
      </footer>
    </div>
  );
}
