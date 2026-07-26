import { useId, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  Bug,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Command,
  FileQuestion,
  Keyboard,
  Library,
  Lightbulb,
  Megaphone,
  MessageSquareWarning,
  Plug,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { AccountSurfaceStyle } from "./types";

type HelpView = "guide" | "shortcuts" | "updates" | "contact";
type RequestKind = "question" | "bug" | "feedback";

type HelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  style: AccountSurfaceStyle;
  onOpenSearch: () => void;
};

const FAQS = [
  {
    id: "conversations",
    category: "Conversations",
    question: "Where are my conversations?",
    answer:
      "Recent conversations live under Chats in the sidebar. Pinned conversations stay in the Pinned section, while project conversations remain grouped with their project.",
    keywords: "chat history sidebar pin project find",
  },
  {
    id: "projects",
    category: "Projects",
    question: "How do projects stay organized?",
    answer:
      "Open Projects in the sidebar, then expand a workspace to see its conversations. Project groups and Chats can be collapsed independently to keep the rail focused.",
    keywords: "folder accordion workspace organize collapse",
  },
  {
    id: "library",
    category: "Library",
    question: "What can I keep in the Library?",
    answer:
      "The prototype accepts images, video, ZIP archives, PDFs, office documents, CSV files, and common source-code formats. Items are categorized from their file type and can be renamed, sorted, or removed.",
    keywords: "upload image video zip pdf csv code rename delete sort",
  },
  {
    id: "connectors",
    category: "Connectors",
    question: "Do connectors access real accounts?",
    answer:
      "No. Connector states in this build are interface prototypes. They do not request credentials, contact third-party services, or read external account data.",
    keywords: "plugin integration github notion slack privacy credentials",
  },
  {
    id: "appearance",
    category: "Personalization",
    question: "Will appearance changes work everywhere?",
    answer:
      "Theme, color, material, and button-style choices are shared across the main surfaces. Account dialogs inherit those same tokens so they remain readable in light and dark designs.",
    keywords: "theme dark light colors material buttons settings",
  },
  {
    id: "local-data",
    category: "Privacy",
    question: "Is this prototype sending my data?",
    answer:
      "This local prototype does not have a support, billing, authentication, or connector backend. Help reports are only validated on this screen and are never transmitted.",
    keywords: "local data privacy report support network send",
  },
] as const;

const SHORTCUT_GROUPS = [
  {
    label: "Navigate",
    items: [
      { label: "Search Lumen", keys: ["⌘", "K"] },
      { label: "New chat", keys: ["⌘", "N"] },
      { label: "Open Library", keys: ["⌘", "L"] },
      { label: "Open Connectors", keys: ["⌘", "⇧", "C"] },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Attach a file", keys: ["⌘", "U"] },
      { label: "Send message", keys: ["⌘", "↵"] },
      { label: "Close a menu or dialog", keys: ["Esc"] },
      { label: "Move through controls", keys: ["Tab"] },
    ],
  },
] as const;

const RELEASES = [
  {
    version: "0.9",
    date: "26 Jul 2026",
    title: "Account surfaces",
    current: true,
    notes: [
      "A complete account menu and themed settings surfaces.",
      "Profile, help, plan, and account-management prototypes.",
      "Improved responsive behavior and keyboard dismissal.",
    ],
  },
  {
    version: "0.8",
    date: "25 Jul 2026",
    title: "Library workspace",
    current: false,
    notes: [
      "Type-aware uploads for documents, media, code, and ZIP files.",
      "Animated sorting, renaming, deletion, and filtering.",
    ],
  },
  {
    version: "0.7",
    date: "24 Jul 2026",
    title: "Navigation and connectors",
    current: false,
    notes: [
      "Collapsible project and chat groups with pinning.",
      "Theme-safe connector discovery and status cards.",
    ],
  },
] as const;

const NAV_ITEMS = [
  { id: "guide" as const, label: "Help guide", icon: BookOpen },
  { id: "shortcuts" as const, label: "Shortcuts", icon: Keyboard },
  { id: "updates" as const, label: "What’s new", icon: Megaphone },
  { id: "contact" as const, label: "Contact", icon: MessageSquareWarning },
] as const;

const RESOURCES = [
  {
    id: "workspace-search",
    title: "Search your workspace",
    description: "Find conversations, projects, and library items.",
    keywords: "find search chat project file command",
    icon: Search,
    action: "workspace-search" as const,
  },
  {
    id: "shortcut-map",
    title: "Keyboard shortcut map",
    description: "Review navigation and composer commands.",
    keywords: "keyboard shortcut command hotkey accessibility",
    icon: Keyboard,
    action: "shortcuts" as const,
  },
  {
    id: "release-notes",
    title: "Release and build notes",
    description: "See what changed in the local prototype.",
    keywords: "new update version release build changelog",
    icon: Megaphone,
    action: "updates" as const,
  },
  {
    id: "issue-report",
    title: "Prepare an issue report",
    description: "Validate and copy a detailed local report.",
    keywords: "contact support bug feedback issue report",
    icon: Bug,
    action: "contact" as const,
  },
] as const;

const KIND_OPTIONS: {
  id: RequestKind;
  label: string;
  description: string;
  icon: typeof FileQuestion;
}[] = [
  {
    id: "question",
    label: "Question",
    description: "Ask how something works",
    icon: FileQuestion,
  },
  {
    id: "bug",
    label: "Report a bug",
    description: "Describe unexpected behavior",
    icon: Bug,
  },
  {
    id: "feedback",
    label: "Share feedback",
    description: "Suggest an improvement",
    icon: Lightbulb,
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex flex-1 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/45">
      <span>{children}</span>
      <span className="h-px flex-1 bg-foreground/10" aria-hidden />
    </div>
  );
}

function Keycap({ children }: { children: string }) {
  return (
    <kbd className="flex min-w-6 items-center justify-center rounded border border-foreground/15 bg-foreground/5 px-1.5 py-1 font-mono text-[10px] leading-none text-foreground/75 shadow-[0_1px_0_rgba(127,127,127,0.25)]">
      {children}
    </kbd>
  );
}

export function HelpDialog({ open, onOpenChange, style, onOpenSearch }: HelpDialogProps) {
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();
  const [view, setView] = useState<HelpView>("guide");
  const [query, setQuery] = useState("");
  const [requestKind, setRequestKind] = useState<RequestKind>("question");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prepared, setPrepared] = useState(false);
  const [copied, setCopied] = useState(false);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return FAQS;
    return FAQS.filter((item) =>
      `${item.category} ${item.question} ${item.answer} ${item.keywords}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const resourceResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return RESOURCES;
    return RESOURCES.filter((resource) =>
      `${resource.title} ${resource.description} ${resource.keywords}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const changeView = (next: HelpView) => {
    setView(next);
    if (next !== "guide") setQuery("");
  };

  const handleSearch = () => {
    onOpenChange(false);
    onOpenSearch();
  };

  const openResource = (action: (typeof RESOURCES)[number]["action"]) => {
    if (action === "workspace-search") {
      handleSearch();
      return;
    }
    changeView(action);
  };

  const resetRequest = () => {
    setSubject("");
    setDetails("");
    setEmail("");
    setErrors({});
    setPrepared(false);
    setCopied(false);
  };

  const validateRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const trimmedSubject = subject.trim();
    const trimmedDetails = details.trim();
    const trimmedEmail = email.trim();

    if (trimmedSubject.length < 4) {
      nextErrors.subject = "Add a subject with at least 4 characters.";
    }
    if (trimmedDetails.length < 20) {
      nextErrors.details = "Add at least 20 characters so the request is actionable.";
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address or leave this blank.";
    }

    setErrors(nextErrors);
    setPrepared(Object.keys(nextErrors).length === 0);
    setCopied(false);
  };

  const copyRequest = async () => {
    const label = KIND_OPTIONS.find((item) => item.id === requestKind)?.label ?? "Request";
    const text = [
      `Lumen ${label}`,
      `Subject: ${subject.trim()}`,
      email.trim() ? `Reply email: ${email.trim()}` : "",
      "",
      details.trim(),
      "",
      "Prepared in the local Lumen prototype.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
      setErrors((current) => ({
        ...current,
        copy: "Clipboard access is unavailable. Select and copy the text manually.",
      }));
    }
  };

  const panelInitial = shouldReduceMotion ? false : { opacity: 0, x: 10 };
  const panelExit = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 };
  const panelTransition = { duration: shouldReduceMotion ? 0 : 0.18, ease: "easeOut" as const };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${style.panelClass} h-[min(720px,calc(100dvh-1rem))] w-[calc(100vw-1rem)] max-w-[900px] gap-0 overflow-hidden border-foreground/15 p-1 text-foreground shadow-2xl sm:rounded-xl [&>button]:right-3 [&>button]:top-3 [&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-foreground/10 [&>button]:bg-background/70 [&>button]:p-1.5 [&>button]:backdrop-blur`}
      >
        <div
          className={`${style.panelInnerClass} flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit]`}
        >
          <DialogHeader className="border-b border-foreground/10 px-4 py-4 pr-12 text-left sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.26em] text-foreground/45">
                  <CircleHelp className="h-3.5 w-3.5" aria-hidden />
                  Lumen support
                </div>
                <DialogTitle className="text-xl font-medium tracking-tight">
                  How can we help?
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-foreground/55">
                  Find an answer, learn a shortcut, or prepare a report.
                </DialogDescription>
              </div>

              <div className="relative w-full sm:w-[310px]">
                <label htmlFor={`${baseId}-search`} className="sr-only">
                  Search help
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40"
                  aria-hidden
                />
                <input
                  id={`${baseId}-search`}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setView("guide");
                  }}
                  placeholder="Search help"
                  className="h-9 w-full rounded-lg border border-foreground/12 bg-foreground/5 pl-9 pr-3 text-xs text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-foreground/30 focus:bg-foreground/7"
                />
              </div>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[190px_minmax(0,1fr)]">
            <nav
              aria-label="Help sections"
              className="flex shrink-0 gap-1 overflow-x-auto border-b border-foreground/10 p-2 md:flex-col md:border-b-0 md:border-r md:p-3"
              role="tablist"
              aria-orientation="vertical"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const selected = view === item.id;
                return (
                  <motion.button
                    key={item.id}
                    id={`${baseId}-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel`}
                    onClick={() => changeView(item.id)}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    className={`relative flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${
                      selected
                        ? "bg-foreground text-background"
                        : "text-foreground/65 hover:bg-foreground/6 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    <span className="font-medium">{item.label}</span>
                    {selected && (
                      <motion.span
                        layoutId={`${baseId}-active-help`}
                        className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-background md:block"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        aria-hidden
                      />
                    )}
                  </motion.button>
                );
              })}

              <div className="mt-auto hidden border-t border-foreground/10 px-2 pt-3 md:block">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/40">
                  Local prototype
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-foreground/45">
                  Build 0.9 · No support backend
                </p>
              </div>
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.section
                  key={view}
                  id={`${baseId}-panel`}
                  role="tabpanel"
                  aria-labelledby={`${baseId}-tab-${view}`}
                  initial={panelInitial}
                  animate={{ opacity: 1, x: 0 }}
                  exit={panelExit}
                  transition={panelTransition}
                  className="mx-auto w-full max-w-[640px]"
                >
                  {view === "guide" && (
                    <div className="space-y-5">
                      {!query && (
                        <>
                          <section aria-labelledby={`${baseId}-quick-title`}>
                            <SectionLabel>Quick paths</SectionLabel>
                            <h2 id={`${baseId}-quick-title`} className="sr-only">
                              Quick help paths
                            </h2>
                            <div className="mt-2 grid gap-2 sm:grid-cols-3">
                              <button
                                type="button"
                                onClick={handleSearch}
                                className={`${style.buttonClass} group relative flex min-h-[92px] flex-col items-start justify-between p-3 text-left`}
                              >
                                <Search className="h-4 w-4 text-(--lumen-accent)" aria-hidden />
                                <span>
                                  <span className="block text-xs font-medium">Search Lumen</span>
                                  <span className="mt-0.5 block text-[10px] text-foreground/50">
                                    Find chats and files
                                  </span>
                                </span>
                                <ArrowUpRight className="absolute right-3 top-3 h-3 w-3 text-foreground/35 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => changeView("shortcuts")}
                                className={`${style.buttonClass} group relative flex min-h-[92px] flex-col items-start justify-between p-3 text-left`}
                              >
                                <Command className="h-4 w-4 text-(--lumen-accent)" aria-hidden />
                                <span>
                                  <span className="block text-xs font-medium">Move faster</span>
                                  <span className="mt-0.5 block text-[10px] text-foreground/50">
                                    Learn shortcuts
                                  </span>
                                </span>
                                <ChevronRight className="absolute right-3 top-3 h-3 w-3 text-foreground/35 transition-transform group-hover:translate-x-0.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => changeView("contact")}
                                className={`${style.buttonClass} group relative flex min-h-[92px] flex-col items-start justify-between p-3 text-left`}
                              >
                                <MessageSquareWarning
                                  className="h-4 w-4 text-(--lumen-accent)"
                                  aria-hidden
                                />
                                <span>
                                  <span className="block text-xs font-medium">Report an issue</span>
                                  <span className="mt-0.5 block text-[10px] text-foreground/50">
                                    Prepare local details
                                  </span>
                                </span>
                                <ChevronRight className="absolute right-3 top-3 h-3 w-3 text-foreground/35 transition-transform group-hover:translate-x-0.5" />
                              </button>
                            </div>
                          </section>

                          <section
                            aria-labelledby={`${baseId}-workspace-title`}
                            className="grid gap-2 sm:grid-cols-3"
                          >
                            <h2 id={`${baseId}-workspace-title`} className="sr-only">
                              Workspace capabilities
                            </h2>
                            {[
                              {
                                icon: Library,
                                title: "Library",
                                detail: "Files, media, code, and ZIPs",
                              },
                              {
                                icon: Plug,
                                title: "Connectors",
                                detail: "Prototype integrations",
                              },
                              {
                                icon: ShieldCheck,
                                title: "Privacy",
                                detail: "Local interface state",
                              },
                            ].map((item) => {
                              const Icon = item.icon;
                              return (
                                <div
                                  key={item.title}
                                  className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/3 p-2.5"
                                >
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground/7">
                                    <Icon className="h-3.5 w-3.5" aria-hidden />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-[11px] font-medium">
                                      {item.title}
                                    </span>
                                    <span className="block truncate text-[9px] text-foreground/45">
                                      {item.detail}
                                    </span>
                                  </span>
                                </div>
                              );
                            })}
                          </section>
                        </>
                      )}

                      {query && resourceResults.length > 0 && (
                        <section aria-labelledby={`${baseId}-resources-title`}>
                          <div className="flex items-center justify-between gap-3">
                            <SectionLabel>Resources</SectionLabel>
                            <span className="shrink-0 font-mono text-[9px] text-foreground/40">
                              {String(resourceResults.length).padStart(2, "0")}
                            </span>
                          </div>
                          <h2 id={`${baseId}-resources-title`} className="sr-only">
                            Matching help resources
                          </h2>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {resourceResults.map((resource) => {
                              const Icon = resource.icon;
                              return (
                                <motion.button
                                  layout
                                  key={resource.id}
                                  type="button"
                                  onClick={() => openResource(resource.action)}
                                  initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: shouldReduceMotion ? 0 : 0.14 }}
                                  className="group flex items-center gap-3 rounded-lg border border-foreground/10 bg-foreground/3 p-3 text-left transition-colors hover:bg-foreground/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                                >
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/7 text-(--lumen-accent)">
                                    <Icon className="h-3.5 w-3.5" aria-hidden />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[11px] font-medium">
                                      {resource.title}
                                    </span>
                                    <span className="mt-0.5 block text-[9px] leading-relaxed text-foreground/45">
                                      {resource.description}
                                    </span>
                                  </span>
                                  <ChevronRight
                                    className="h-3 w-3 shrink-0 text-foreground/35 transition-transform group-hover:translate-x-0.5"
                                    aria-hidden
                                  />
                                </motion.button>
                              );
                            })}
                          </div>
                        </section>
                      )}

                      <section aria-labelledby={`${baseId}-faq-title`}>
                        <div className="flex items-center justify-between gap-3">
                          <SectionLabel>
                            {query ? "Search results" : "Common questions"}
                          </SectionLabel>
                          <span className="shrink-0 font-mono text-[9px] text-foreground/40">
                            {String(searchResults.length).padStart(2, "0")}
                          </span>
                        </div>
                        <h2 id={`${baseId}-faq-title`} className="sr-only">
                          {query ? "Help search results" : "Frequently asked questions"}
                        </h2>

                        <motion.div layout className="mt-2 space-y-1.5">
                          <AnimatePresence initial={false}>
                            {searchResults.map((item) => (
                              <motion.details
                                layout
                                key={item.id}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: shouldReduceMotion ? 0 : 0.14 }}
                                className="group rounded-lg border border-foreground/10 bg-foreground/3 open:bg-foreground/5"
                              >
                                <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/25">
                                  <span className="min-w-0 flex-1">
                                    <span className="mb-0.5 block font-mono text-[8px] uppercase tracking-[0.18em] text-foreground/40">
                                      {item.category}
                                    </span>
                                    <span className="font-medium">{item.question}</span>
                                  </span>
                                  <ChevronRight
                                    className="h-3.5 w-3.5 shrink-0 text-foreground/40 transition-transform group-open:rotate-90"
                                    aria-hidden
                                  />
                                </summary>
                                <p className="border-t border-foreground/8 px-3 py-3 text-[11px] leading-relaxed text-foreground/60">
                                  {item.answer}
                                </p>
                              </motion.details>
                            ))}
                          </AnimatePresence>
                        </motion.div>

                        {searchResults.length === 0 && resourceResults.length === 0 && (
                          <div className="mt-2 rounded-lg border border-dashed border-foreground/15 px-4 py-8 text-center">
                            <Search className="mx-auto h-5 w-5 text-foreground/30" aria-hidden />
                            <p className="mt-2 text-xs font-medium">No help entries found</p>
                            <p className="mt-1 text-[10px] text-foreground/45">
                              Try “library”, “privacy”, “theme”, or “projects”.
                            </p>
                            <button
                              type="button"
                              onClick={() => setQuery("")}
                              className={`${style.buttonClass} mt-3 px-3 py-1.5 text-[10px]`}
                            >
                              Clear search
                            </button>
                          </div>
                        )}
                      </section>
                    </div>
                  )}

                  {view === "shortcuts" && (
                    <div className="space-y-5">
                      <div>
                        <SectionLabel>Keyboard map</SectionLabel>
                        <h2 className="mt-2 text-lg font-medium tracking-tight">
                          Work without the mouse
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-foreground/55">
                          Use ⌘ on macOS or Ctrl on Windows and Linux.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {SHORTCUT_GROUPS.map((group) => (
                          <section
                            key={group.label}
                            aria-labelledby={`${baseId}-shortcut-${group.label}`}
                            className="rounded-lg border border-foreground/10 bg-foreground/3 p-3"
                          >
                            <h3
                              id={`${baseId}-shortcut-${group.label}`}
                              className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/45"
                            >
                              {group.label}
                            </h3>
                            <dl className="mt-2 divide-y divide-foreground/8">
                              {group.items.map((item) => (
                                <div
                                  key={item.label}
                                  className="flex items-center justify-between gap-3 py-2"
                                >
                                  <dt className="text-[11px] text-foreground/70">{item.label}</dt>
                                  <dd className="flex gap-1">
                                    {item.keys.map((key) => (
                                      <Keycap key={key}>{key}</Keycap>
                                    ))}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </section>
                        ))}
                      </div>

                      <div className="flex flex-col gap-3 rounded-lg border border-foreground/10 bg-foreground/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-medium">Try workspace search</p>
                          <p className="mt-0.5 text-[10px] text-foreground/50">
                            Search conversations, projects, and library items.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSearch}
                          className={`${style.buttonClass} flex shrink-0 items-center justify-center gap-2 px-3 py-2 text-[10px]`}
                        >
                          <Search className="h-3 w-3" aria-hidden />
                          Open search
                          <span className="font-mono text-[9px] opacity-45">⌘K</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {view === "updates" && (
                    <div className="space-y-5">
                      <div>
                        <SectionLabel>Release notes</SectionLabel>
                        <div className="mt-2 flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-lg font-medium tracking-tight">
                              What’s new in Lumen
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-foreground/55">
                              A local build history for this interface prototype.
                            </p>
                          </div>
                          <span className="rounded-full border border-(--lumen-accent)/30 bg-(--lumen-accent)/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-(--lumen-accent)">
                            Build 0.9
                          </span>
                        </div>
                      </div>

                      <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[13px] before:top-4 before:w-px before:bg-foreground/10">
                        {RELEASES.map((release) => (
                          <li key={release.version} className="relative pl-9">
                            <span
                              className={`absolute left-[8px] top-4 h-[11px] w-[11px] rounded-full border-2 ${
                                release.current
                                  ? "border-(--lumen-accent) bg-(--lumen-accent)"
                                  : "border-foreground/20 bg-background"
                              }`}
                              aria-hidden
                            />
                            <article className="rounded-lg border border-foreground/10 bg-foreground/3 p-3">
                              <header className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/45">
                                    v{release.version}
                                  </span>
                                  <h3 className="text-xs font-medium">{release.title}</h3>
                                </div>
                                <time className="font-mono text-[8px] uppercase tracking-[0.14em] text-foreground/35">
                                  {release.date}
                                </time>
                              </header>
                              <ul className="mt-2 space-y-1.5">
                                {release.notes.map((note) => (
                                  <li
                                    key={note}
                                    className="flex gap-2 text-[10px] leading-relaxed text-foreground/55"
                                  >
                                    <Sparkles
                                      className="mt-0.5 h-3 w-3 shrink-0 text-(--lumen-accent)"
                                      aria-hidden
                                    />
                                    {note}
                                  </li>
                                ))}
                              </ul>
                            </article>
                          </li>
                        ))}
                      </ol>

                      <div className="rounded-lg border border-dashed border-foreground/15 p-3">
                        <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/40">
                          Build notes
                        </p>
                        <p className="mt-1.5 text-[10px] leading-relaxed text-foreground/55">
                          This is a front-end prototype. Authentication, billing, connectors, and
                          support delivery are represented as local interface states only.
                        </p>
                      </div>
                    </div>
                  )}

                  {view === "contact" && (
                    <div className="space-y-5">
                      <div>
                        <SectionLabel>Contact & reports</SectionLabel>
                        <h2 className="mt-2 text-lg font-medium tracking-tight">
                          Prepare a useful request
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-foreground/55">
                          Validate the details here, then copy them for your preferred support
                          channel.
                        </p>
                      </div>

                      <AnimatePresence mode="wait" initial={false}>
                        {!prepared ? (
                          <motion.form
                            key="request-form"
                            onSubmit={validateRequest}
                            noValidate
                            initial={panelInitial}
                            animate={{ opacity: 1, x: 0 }}
                            exit={panelExit}
                            transition={panelTransition}
                            className="space-y-4"
                          >
                            <fieldset>
                              <legend className="text-[11px] font-medium">What do you need?</legend>
                              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                {KIND_OPTIONS.map((option) => {
                                  const Icon = option.icon;
                                  const selected = requestKind === option.id;
                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      aria-pressed={selected}
                                      onClick={() => setRequestKind(option.id)}
                                      className={`rounded-lg border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${
                                        selected
                                          ? "border-(--lumen-accent)/45 bg-(--lumen-accent)/10"
                                          : "border-foreground/10 bg-foreground/3 hover:bg-foreground/6"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <Icon
                                          className={`h-3.5 w-3.5 ${
                                            selected
                                              ? "text-(--lumen-accent)"
                                              : "text-foreground/45"
                                          }`}
                                          aria-hidden
                                        />
                                        {selected && (
                                          <Check
                                            className="h-3 w-3 text-(--lumen-accent)"
                                            aria-hidden
                                          />
                                        )}
                                      </div>
                                      <span className="mt-2 block text-[11px] font-medium">
                                        {option.label}
                                      </span>
                                      <span className="mt-0.5 block text-[9px] leading-relaxed text-foreground/45">
                                        {option.description}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </fieldset>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="block text-[10px] font-medium">
                                Subject
                                <input
                                  value={subject}
                                  onChange={(event) => {
                                    setSubject(event.target.value);
                                    setErrors((current) => ({ ...current, subject: "" }));
                                  }}
                                  aria-invalid={Boolean(errors.subject)}
                                  aria-describedby={
                                    errors.subject ? `${baseId}-subject-error` : undefined
                                  }
                                  placeholder="Short summary"
                                  className="mt-1.5 h-9 w-full rounded-lg border border-foreground/12 bg-foreground/4 px-3 text-xs font-normal outline-none placeholder:text-foreground/30 focus:border-foreground/30"
                                />
                                {errors.subject && (
                                  <span
                                    id={`${baseId}-subject-error`}
                                    className="mt-1 block text-[9px] text-red-500"
                                    role="alert"
                                  >
                                    {errors.subject}
                                  </span>
                                )}
                              </label>

                              <label className="block text-[10px] font-medium">
                                Reply email
                                <span className="ml-1 font-normal text-foreground/35">
                                  (optional)
                                </span>
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(event) => {
                                    setEmail(event.target.value);
                                    setErrors((current) => ({ ...current, email: "" }));
                                  }}
                                  aria-invalid={Boolean(errors.email)}
                                  aria-describedby={
                                    errors.email ? `${baseId}-email-error` : undefined
                                  }
                                  placeholder="you@example.com"
                                  className="mt-1.5 h-9 w-full rounded-lg border border-foreground/12 bg-foreground/4 px-3 text-xs font-normal outline-none placeholder:text-foreground/30 focus:border-foreground/30"
                                />
                                {errors.email && (
                                  <span
                                    id={`${baseId}-email-error`}
                                    className="mt-1 block text-[9px] text-red-500"
                                    role="alert"
                                  >
                                    {errors.email}
                                  </span>
                                )}
                              </label>
                            </div>

                            <label className="block text-[10px] font-medium">
                              Details
                              <textarea
                                value={details}
                                onChange={(event) => {
                                  setDetails(event.target.value);
                                  setErrors((current) => ({ ...current, details: "" }));
                                }}
                                aria-invalid={Boolean(errors.details)}
                                aria-describedby={
                                  errors.details
                                    ? `${baseId}-details-error`
                                    : `${baseId}-details-hint`
                                }
                                rows={5}
                                placeholder="What happened, what did you expect, and how can it be reproduced?"
                                className="mt-1.5 w-full resize-none rounded-lg border border-foreground/12 bg-foreground/4 px-3 py-2 text-xs font-normal leading-relaxed outline-none placeholder:text-foreground/30 focus:border-foreground/30"
                              />
                              <span
                                id={`${baseId}-details-hint`}
                                className="mt-1 flex justify-between font-mono text-[8px] uppercase tracking-[0.14em] text-foreground/35"
                              >
                                <span>Do not include passwords or secrets</span>
                                <span>{details.trim().length}/20 min</span>
                              </span>
                              {errors.details && (
                                <span
                                  id={`${baseId}-details-error`}
                                  className="mt-1 block text-[9px] text-red-500"
                                  role="alert"
                                >
                                  {errors.details}
                                </span>
                              )}
                            </label>

                            <div className="flex flex-col gap-3 rounded-lg border border-amber-500/20 bg-amber-500/7 p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex gap-2">
                                <ShieldCheck
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                                  aria-hidden
                                />
                                <p className="text-[10px] leading-relaxed text-foreground/60">
                                  Local prototype: reviewing this form will not send or store your
                                  request.
                                </p>
                              </div>
                              <button
                                type="submit"
                                className={`${style.buttonClass} shrink-0 px-3 py-2 text-[10px]`}
                              >
                                Review request
                              </button>
                            </div>
                          </motion.form>
                        ) : (
                          <motion.div
                            key="request-ready"
                            initial={panelInitial}
                            animate={{ opacity: 1, x: 0 }}
                            exit={panelExit}
                            transition={panelTransition}
                            className="space-y-4"
                          >
                            <div
                              className="rounded-lg border border-emerald-500/25 bg-emerald-500/8 p-4"
                              role="status"
                              aria-live="polite"
                            >
                              <div className="flex gap-3">
                                <CheckCircle2
                                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                                  aria-hidden
                                />
                                <div>
                                  <h3 className="text-sm font-medium">Request is ready to copy</h3>
                                  <p className="mt-1 text-[10px] leading-relaxed text-foreground/55">
                                    It was validated locally. Nothing was sent, uploaded, or saved
                                    by Lumen.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border border-foreground/10 bg-foreground/3 p-3">
                              <div className="flex items-center justify-between gap-3 border-b border-foreground/8 pb-2">
                                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-foreground/40">
                                  {KIND_OPTIONS.find((item) => item.id === requestKind)?.label}
                                </span>
                                {email.trim() && (
                                  <span className="truncate text-[9px] text-foreground/40">
                                    {email.trim()}
                                  </span>
                                )}
                              </div>
                              <p className="mt-3 text-xs font-medium">{subject.trim()}</p>
                              <p className="mt-2 whitespace-pre-wrap text-[10px] leading-relaxed text-foreground/55">
                                {details.trim()}
                              </p>
                            </div>

                            {errors.copy && (
                              <p className="text-[10px] text-red-500" role="alert">
                                {errors.copy}
                              </p>
                            )}

                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setPrepared(false);
                                  setCopied(false);
                                }}
                                className={`${style.buttonClass} flex items-center justify-center gap-2 px-3 py-2 text-[10px]`}
                              >
                                <RotateCcw className="h-3 w-3" aria-hidden />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void copyRequest()}
                                className={`${style.buttonClass} flex items-center justify-center gap-2 px-3 py-2 text-[10px]`}
                              >
                                {copied ? (
                                  <Check className="h-3 w-3 text-emerald-500" aria-hidden />
                                ) : (
                                  <Clipboard className="h-3 w-3" aria-hidden />
                                )}
                                {copied ? "Copied" : "Copy request"}
                              </button>
                              <button
                                type="button"
                                onClick={resetRequest}
                                className={`${style.buttonClass} px-3 py-2 text-[10px]`}
                              >
                                Start over
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.section>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
