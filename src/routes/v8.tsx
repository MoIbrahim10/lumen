import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/v8")({ component: V8 });

function V8() {
  return (
    <div className="dark">
      <div className="relative flex min-h-screen flex-col bg-background text-foreground" style={{ backgroundColor: "#0B0B0B" }}>
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-8 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
          <span>Lumen</span>
          <span>Reel No. 04 · Tuesday · 18:42</span>
          <span>Emma M.</span>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">— A quiet machine —</p>
          <h1 className="mt-10 max-w-5xl text-center font-serif text-[110px] font-light leading-[1] tracking-[-0.02em]">
            Begin<br /><em className="italic text-muted-foreground">anywhere.</em>
          </h1>

          <div className="mt-16 w-full max-w-2xl">
            <input
              placeholder="A sentence, a fragment, a thought…"
              className="w-full border-b border-border bg-transparent pb-3 text-center font-serif text-2xl italic placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </main>

        <footer className="px-10 pb-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <div className="flex gap-8">
              <span>Model · Lumen 4</span>
              <span>Voice · Cinematic</span>
              <span>Memory · On</span>
            </div>
            <div className="flex gap-8">
              <span>Try : "read me the morning"</span>
              <span>·</span>
              <span>"hold this thought"</span>
              <span>·</span>
              <span>"play it back"</span>
            </div>
            <div className="flex gap-4">
              <span>v8</span>
              <Link to="/" className="text-foreground">↩ index</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
