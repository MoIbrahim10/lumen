import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export const Route = createFileRoute("/v7")({ component: V7 });

function V7() {
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);

  return (
    <div className="dark font-mono">
      <div className="min-h-screen text-foreground" style={{ backgroundColor: "#0F0F0F" }}>
        <header className="border-b border-border px-8 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <div className="mx-auto flex max-w-[920px] justify-between">
            <span>lumen :: shell — tuesday 18:42</span><span>emma@lumen ~ %</span>
          </div>
        </header>

        <main className="mx-auto max-w-[920px] px-8 pt-16">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">— evening, emma —</p>
          <h1 className="mt-4 font-sans text-5xl font-light leading-tight tracking-tight">A quiet shell for thinking.</h1>
          <p className="mt-3 max-w-md font-sans text-[15px] text-muted-foreground">
            Type a thought. Pipe it through tools. Keep what matters.
          </p>

          <pre className="mt-10 select-none text-[10px] leading-tight text-muted-foreground">
{`────────────────────────────────────────────────────────────────────────`}
          </pre>

          {/* Composer — terminal */}
          <div className="mt-3 rounded-md border border-border" style={{ backgroundColor: "#141414" }}>
            <div className="flex items-start gap-3 px-4 pt-3">
              <span className="select-none text-[15px] text-muted-foreground">$</span>
              <textarea
                rows={3}
                placeholder="ask 'what changed in the q1 letter?' --read stripe-q1.pdf"
                className="block w-full resize-none bg-transparent text-[14px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <div className="flex flex-wrap gap-3">
                <Hint label="Attach file" keys={SHORTCUTS.attach}><button className="hover:text-foreground">--attach</button></Hint>
                <Hint label="Dictate" keys={SHORTCUTS.voice}><button className="hover:text-foreground">--voice</button></Hint>
                <Hint label="Tools" keys={SHORTCUTS.tools}><button className="hover:text-foreground">--tools</button></Hint>
                <Hint label="Model" keys={SHORTCUTS.model}><button className="hover:text-foreground">--model lumen-4</button></Hint>
                <button onClick={() => setWeb(!web)} className={web ? "text-foreground" : "hover:text-foreground"}>--web {web ? "on" : "off"}</button>
                <button onClick={() => setMemory(!memory)} className={memory ? "text-foreground" : "hover:text-foreground"}>--memory {memory ? "on" : "off"}</button>
                <button onClick={() => setTemp(!temp)} className={temp ? "text-foreground" : "hover:text-foreground"}>--temp {temp ? "on" : "off"}</button>
              </div>
              <Hint label="Send" keys={SHORTCUTS.send}>
                <button className="border border-foreground px-2 py-0.5 text-foreground hover:bg-foreground hover:text-background">RUN ⏎</button>
              </Hint>
            </div>
          </div>

          {/* Style + length + depth */}
          <pre className="mt-10 select-none text-[10px] leading-tight text-muted-foreground">{`# response.config`}</pre>
          <div className="mt-2 grid grid-cols-12 gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <div className="col-span-12 flex flex-wrap items-center gap-2">
              <span className="opacity-60">style →</span>
              {styles.map((s) => (
                <button key={s} onClick={() => setStyle(s)} className={style === s ? "text-foreground underline" : "hover:text-foreground"}>{s}</button>
              ))}
              <Hint label="Create" keys={SHORTCUTS.newStyle}>
                <button onClick={() => { const n = prompt("Name your style"); if (n) { setStyles([...styles, n]); setStyle(n); } }}
                  className="border border-dashed border-border px-1.5 hover:text-foreground">+ new</button>
              </Hint>
            </div>
            <Cycle label="length" value={length} setValue={setLength} options={[...LENGTHS]} />
            <Cycle label="depth" value={depth} setValue={setDepth} options={[...DEPTHS]} />
          </div>

          {/* Quick actions */}
          <pre className="mt-12 select-none text-[10px] leading-tight text-muted-foreground">{`# quick.actions`}</pre>
          <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 font-sans text-[13px]">
            {QUICK_ACTIONS.map((a, i) => (
              <li key={a.label} className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">[{(i + 1).toString().padStart(2, "0")}]</span>
                <button className="text-left text-muted-foreground hover:text-foreground hover:underline">{a.label}</button>
              </li>
            ))}
          </ul>

          <pre className="mt-14 select-none text-[10px] leading-tight text-muted-foreground">{`────────────────────────────────────────────────────────────────────────`}</pre>

          <footer className="mt-3 flex justify-between pb-10 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>v7 · terminal editorial</span>
            <Link to="/" className="hover:text-foreground">← index</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
function Cycle({ label, value, setValue, options }: any) {
  const i = options.indexOf(value);
  return (
    <div className="col-span-6 flex items-center gap-2">
      <span className="opacity-60">{label} →</span>
      <button onClick={() => setValue(options[(i + 1) % options.length])} className="text-foreground hover:underline">{value}</button>
      <span className="opacity-40">[{options.join(" · ")}]</span>
    </div>
  );
}
