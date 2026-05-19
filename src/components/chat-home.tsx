import { Link } from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import { Paperclip, Mic, Wrench, ArrowUp, Plus, ChevronDown, Check, Globe, Brain, EyeOff, Gauge, Ruler } from "lucide-react";
import { Hint, STYLES, LENGTHS, DEPTHS, QUICK_ACTIONS, SHORTCUTS } from "@/components/chat-kit";

export type Variant =
  | "piano"
  | "doc"
  | "framed"
  | "depth3d"
  | "mech"
  | "glass"
  | "dot"
  | "emboss"
  | "etch"
  | "stack"
  | "clean";

type Cfg = {
  name: string;
  number: string;
  variant: Variant;
  /** "light" or "dark" */
  mode: "light" | "dark";
  btnClass: string;
  sendClass: string;
  /** chip class for quick actions */
  chipClass: string;
  /** background style (CSS) */
  bg?: React.CSSProperties;
  /** font headline class */
  headline?: string;
  /** small accent */
  micro?: string;
};

const CFG: Record<Variant, Omit<Cfg, "name" | "number" | "variant">> = {
  piano: {
    mode: "light",
    btnClass: "btn-piano",
    sendClass: "btn-piano-black",
    chipClass: "btn-piano",
    bg: { background: "linear-gradient(180deg,#f5f5f5 0%,#eaeaea 100%)" },
    headline: "font-light",
    micro: "Keys press in. Soft action.",
  },
  doc: {
    mode: "light",
    btnClass: "btn-doc",
    sendClass: "btn-doc",
    chipClass: "btn-doc",
    bg: { background: "#fbf9f3" },
    headline: "font-serif",
    micro: "Filed under: thinking.",
  },
  framed: {
    mode: "light",
    btnClass: "btn-framed",
    sendClass: "btn-framed",
    chipClass: "btn-framed",
    bg: { background: "#ffffff" },
    headline: "font-grotesk uppercase tracking-tight",
    micro: "Exhibit 04 — composer.",
  },
  depth3d: {
    mode: "light",
    btnClass: "btn-3d",
    sendClass: "btn-3d",
    chipClass: "btn-3d",
    bg: { background: "radial-gradient(circle at 50% 0%, #f8f8f8, #e4e4e4)" },
    headline: "font-light tracking-tight",
    micro: "Soft, extruded, tactile.",
  },
  mech: {
    mode: "dark",
    btnClass: "btn-mech",
    sendClass: "btn-mech",
    chipClass: "btn-mech",
    bg: { background: "#0a0a0a" },
    headline: "font-mono uppercase tracking-tight",
    micro: "Mechanical · 60% layout",
  },
  glass: {
    mode: "dark",
    btnClass: "btn-glass",
    sendClass: "btn-glass",
    chipClass: "btn-glass",
    bg: {
      background:
        "radial-gradient(1200px 600px at 30% 0%, #2a2a2a 0%, #0d0d0d 60%, #050505 100%)",
    },
    headline: "font-light tracking-tight",
    micro: "Glass · ambient depth",
  },
  dot: {
    mode: "dark",
    btnClass: "btn-dot",
    sendClass: "btn-dot",
    chipClass: "btn-dot",
    bg: {
      backgroundColor: "#0a0a0a",
      backgroundImage:
        "radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)",
      backgroundSize: "8px 8px",
    },
    headline: "font-mono uppercase tracking-wider",
    micro: "Dot-matrix surface.",
  },
  emboss: {
    mode: "light",
    btnClass: "btn-emboss",
    sendClass: "btn-emboss",
    chipClass: "btn-emboss",
    bg: { background: "linear-gradient(180deg,#e8e8e8 0%,#cfcfcf 100%)" },
    headline: "font-serif italic",
    micro: "Carved · pill metal.",
  },
  etch: {
    mode: "light",
    btnClass: "btn-etch",
    sendClass: "btn-etch",
    chipClass: "btn-etch",
    bg: { background: "#fafafa" },
    headline: "font-mono uppercase",
    micro: "Wireframe · etched outline.",
  },
  stack: {
    mode: "light",
    btnClass: "btn-stack",
    sendClass: "btn-stack",
    chipClass: "btn-stack",
    bg: { background: "#f4f4f4" },
    headline: "font-grotesk",
    micro: "Stacked · layered cards.",
  },
};

export function ChatHome({
  variant,
  number,
  name,
}: {
  variant: Variant;
  number: string;
  name: string;
}) {
  const cfg = CFG[variant];
  const isDark = cfg.mode === "dark";
  const [style, setStyle] = useState("Auto");
  const [styles, setStyles] = useState<string[]>([...STYLES]);
  const [length, setLength] = useState("Balanced");
  const [depth, setDepth] = useState("Standard");
  const [web, setWeb] = useState(true);
  const [memory, setMemory] = useState(true);
  const [temp, setTemp] = useState(false);
  const [model, setModel] = useState("Lumen 4");
  const [styleOpen, setStyleOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const wrap = isDark ? "dark" : "";

  return (
    <div className={wrap}>
      <div
        className="flex min-h-screen flex-col text-foreground"
        style={cfg.bg}
      >
        <nav className="flex items-center justify-between px-10 pt-7">
          <span className="text-sm tracking-tight">Lumen</span>
          <div className="flex items-center gap-7 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer">Library</span>
            <span className="hover:text-foreground cursor-pointer">Models</span>
            <span className="hover:text-foreground cursor-pointer">Settings</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] text-background">
              EM
            </span>
          </div>
        </nav>

        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {cfg.micro}
          </p>

          <div className="mt-6 w-full max-w-[820px]">
            {/* Composer card — headline lives inside */}
            <div
              className={`relative ${cfg.btnClass} px-7 pt-7 pb-4`}
              style={{ borderRadius: variant === "framed" ? 0 : undefined }}
            >
              <h1
                className={`text-left text-[40px] leading-[1.05] tracking-tight md:text-[44px] ${cfg.headline ?? ""}`}
              >
                What's on your mind,{" "}
                <span className="uppercase">Emma?</span>
              </h1>
              <textarea
                rows={3}
                placeholder="type something …"
                className="mt-5 block w-full resize-none bg-transparent text-[16px] leading-relaxed placeholder:opacity-40 focus:outline-none"
                style={{ color: "inherit" }}
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Hint label="Attach" keys={SHORTCUTS.attach}>
                    <IconKey variant={variant} cfg={cfg}>
                      <Paperclip className="h-4 w-4" />
                    </IconKey>
                  </Hint>
                  <Hint label="Dictate" keys={SHORTCUTS.voice}>
                    <IconKey variant={variant} cfg={cfg}>
                      <Mic className="h-4 w-4" />
                    </IconKey>
                  </Hint>
                  <Selector
                    cfg={cfg}
                    open={modelOpen}
                    setOpen={setModelOpen}
                    value={model}
                    setValue={setModel}
                    options={["Lumen 4", "Lumen 4 Mini", "Lumen 4 Pro", "Lumen 3"]}
                    label="Model"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Hint label="Tools & connectors" keys={SHORTCUTS.tools}>
                    <IconKey variant={variant} cfg={cfg}>
                      <Wrench className="h-4 w-4" />
                    </IconKey>
                  </Hint>
                  <Hint label="Send" keys={SHORTCUTS.send}>
                    <button
                      className={`${cfg.sendClass} flex h-9 w-9 items-center justify-center`}
                    >
                      {variant === "framed" ? (
                        <span><ArrowUp className="h-4 w-4" /></span>
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </button>
                  </Hint>
                </div>
              </div>
            </div>

            {/* Controls strip — style selector left, toggles right */}
            <div
              className={`mt-3 flex items-center justify-between gap-2 ${cfg.btnClass} px-3 py-2`}
              style={{ borderRadius: variant === "framed" ? 0 : undefined }}
            >
              <Selector
                cfg={cfg}
                open={styleOpen}
                setOpen={setStyleOpen}
                value={style}
                setValue={setStyle}
                options={styles}
                label="Style"
                footer={
                  <button
                    onClick={() => {
                      const n = prompt("Name your style");
                      if (n) {
                        setStyles([...styles, n]);
                        setStyle(n);
                        setStyleOpen(false);
                      }
                    }}
                    className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" /> Create new style
                  </button>
                }
              />
              <div className="flex items-center gap-1.5">
                <Hint label={`Length · ${length}`}>
                  <IconKey variant={variant} cfg={cfg}>
                    <Ruler className="h-4 w-4" />
                  </IconKey>
                </Hint>
                <Hint label={`Depth · ${depth}`}>
                  <IconKey variant={variant} cfg={cfg}>
                    <Gauge className="h-4 w-4" />
                  </IconKey>
                </Hint>
                <Hint label={`Web · ${web ? "on" : "off"}`}>
                  <button
                    onClick={() => setWeb(!web)}
                    className={`${cfg.btnClass} flex h-9 w-9 items-center justify-center ${!web ? "opacity-40" : ""}`}
                  >
                    {variant === "framed" ? <span><Globe className="h-4 w-4" /></span> : <Globe className="h-4 w-4" />}
                  </button>
                </Hint>
                <Hint label={`Memory · ${memory ? "on" : "off"}`}>
                  <button
                    onClick={() => setMemory(!memory)}
                    className={`${cfg.btnClass} flex h-9 w-9 items-center justify-center ${!memory ? "opacity-40" : ""}`}
                  >
                    {variant === "framed" ? <span><Brain className="h-4 w-4" /></span> : <Brain className="h-4 w-4" />}
                  </button>
                </Hint>
                <Hint label={`Temporary · ${temp ? "on" : "off"}`}>
                  <button
                    onClick={() => setTemp(!temp)}
                    className={`${cfg.btnClass} flex h-9 w-9 items-center justify-center ${!temp ? "opacity-40" : ""}`}
                  >
                    {variant === "framed" ? <span><EyeOff className="h-4 w-4" /></span> : <EyeOff className="h-4 w-4" />}
                  </button>
                </Hint>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-auto mt-8 h-px w-40 bg-border" />

            {/* Quick actions — two rows, centered */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  className={`${cfg.chipClass} flex items-center gap-1.5 px-4 py-2 text-[12px]`}
                >
                  {variant === "framed" ? (
                    <span>
                      <a.icon className="h-3.5 w-3.5" /> {a.label}
                    </span>
                  ) : (
                    <>
                      <a.icon className="h-3.5 w-3.5" /> {a.label}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </main>

        <footer className="flex justify-between px-10 pb-7 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>
            {number} · {name}
          </span>
          <Link to="/" className="hover:text-foreground">
            ← All versions
          </Link>
        </footer>
      </div>
    </div>
  );
}

function IconKey({
  variant,
  cfg,
  children,
}: {
  variant: Variant;
  cfg: Omit<Cfg, "name" | "number" | "variant">;
  children: ReactNode;
}) {
  return (
    <button className={`${cfg.btnClass} flex h-9 w-9 items-center justify-center`}>
      {variant === "framed" ? <span>{children}</span> : children}
    </button>
  );
}

function Selector({
  cfg,
  value,
  setValue,
  options,
  label,
  open: openProp,
  setOpen: setOpenProp,
  footer,
}: {
  cfg: Omit<Cfg, "name" | "number" | "variant">;
  value: string;
  setValue: (v: string) => void;
  options: string[];
  label: string;
  open?: boolean;
  setOpen?: (v: boolean) => void;
  footer?: ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = setOpenProp ?? setInternalOpen;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`${cfg.btnClass} flex items-center gap-2 px-3 py-1.5 text-[12px]`}
      >
        {cfg.btnClass === "btn-framed" ? (
          <span>
            <span className="opacity-60">{label}</span>
            <span>{value}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </span>
        ) : (
          <>
            <span className="opacity-60">{label}</span>
            <span>{value}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  setValue(o);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted"
              >
                <span>{o}</span>
                {o === value && <Check className="h-3 w-3" />}
              </button>
            ))}
            {footer}
          </div>
        </>
      )}
    </div>
  );
}

function Toggle({
  cfg,
  on,
  setOn,
  label,
}: {
  cfg: Omit<Cfg, "name" | "number" | "variant">;
  on: boolean;
  setOn: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => setOn(!on)}
      className={`${cfg.btnClass} flex items-center gap-1.5 px-3 py-1.5 text-[12px]`}
    >
      {cfg.btnClass === "btn-framed" ? (
        <span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${on ? "bg-current" : "bg-current opacity-30"}`}
          />
          {label}
        </span>
      ) : (
        <>
          <span
            className={`h-1.5 w-1.5 rounded-full ${on ? "bg-current" : "bg-current opacity-30"}`}
          />
          {label}
        </>
      )}
    </button>
  );
}
