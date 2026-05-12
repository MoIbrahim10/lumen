import { ReactNode } from "react";
import { FileText, Mail, Code2, ScanSearch, Lightbulb, Presentation } from "lucide-react";

export const STYLES = ["Auto", "Formal", "Friendly", "Concise", "Creative", "Technical"] as const;
export const LENGTHS = ["Short", "Balanced", "Long"] as const;
export const DEPTHS = ["Quick", "Standard", "Deep"] as const;

export const QUICK_ACTIONS = [
  { icon: FileText, label: "Summarize document" },
  { icon: Mail, label: "Write email" },
  { icon: Code2, label: "Generate UI" },
  { icon: ScanSearch, label: "Research topic" },
  { icon: Lightbulb, label: "Brainstorm ideas" },
  { icon: Code2, label: "Code assistant" },
  { icon: Presentation, label: "Create presentation" },
] as const;

export const SHORTCUTS = {
  send: "⏎",
  newline: "⇧⏎",
  attach: "⌘U",
  voice: "⌘⇧V",
  model: "⌘M",
  tools: "⌘T",
  command: "⌘K",
  newChat: "⌘N",
  newStyle: "⌘⇧S",
} as const;

/**
 * Shortcut hint tooltip. Wrap any control to show
 * "Label · ⌘K" on hover above it.
 */
export function Hint({
  label,
  keys,
  children,
  side = "top",
  className = "",
}: {
  label: string;
  keys?: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  const pos =
    side === "top"
      ? "-top-9 left-1/2 -translate-x-1/2"
      : "-bottom-9 left-1/2 -translate-x-1/2";
  return (
    <span className={`group/h relative inline-flex ${className}`}>
      {children}
      <span
        className={`pointer-events-none absolute ${pos} z-50 flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover/h:opacity-100`}
      >
        <span>{label}</span>
        {keys && <span className="text-foreground">{keys}</span>}
      </span>
    </span>
  );
}
