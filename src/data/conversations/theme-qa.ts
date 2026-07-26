import type { ConversationMessage } from "./types";

export const themeQaConversation: ConversationMessage[] = [
  {
    id: "theme-qa-1",
    role: "user",
    content:
      "Can we do a full theme pass? I want light, dark, and the custom color presets to feel like the same product.",
    timestamp: "09:04",
  },
  {
    id: "theme-qa-2",
    role: "assistant",
    content:
      "Yes. I’ll start with the shared surfaces, then check components whose contrast or depth changes between themes. I’ll keep the current material language intact.",
    timestamp: "09:05",
  },
  {
    id: "theme-qa-3",
    role: "user",
    content:
      "In light mode the primary buttons feel heavier than the cards, especially in the sidebar and composer.",
    timestamp: "09:08",
  },
  {
    id: "theme-qa-4",
    role: "assistant",
    content: "I found three places where the button depth is overpowering nearby content.",
    timestamp: "09:10",
    variant: "steps",
    title: "Light theme adjustments",
    points: [
      "Reduce the resting shadow while preserving the pressed offset.",
      "Use the same border opacity as adjacent cards.",
      "Keep the stronger shadow only for hover and keyboard focus.",
    ],
  },
  {
    id: "theme-qa-5",
    role: "user",
    content:
      "That feels better. Dark mode still loses the secondary text and dividers in the Library table.",
    timestamp: "09:14",
  },
  {
    id: "theme-qa-6",
    role: "assistant",
    content:
      "Agreed. The muted text is falling too close to the panel tone, while the dividers are nearly invisible. I’d raise both slightly without making the table look outlined.",
    timestamp: "09:16",
  },
  {
    id: "theme-qa-7",
    role: "user",
    content:
      "Please check that against our green, blue, and plum custom colors too. The accent should not tint every material button.",
    timestamp: "09:20",
  },
  {
    id: "theme-qa-8",
    role: "assistant",
    content:
      "The accent works best as a state signal, not a general surface color. Here’s the consistent mapping I’m testing.",
    timestamp: "09:22",
    variant: "table",
    title: "Accent usage",
    table: {
      headers: ["Component", "Resting", "Active"],
      rows: [
        ["Material button", "Neutral surface", "Accent icon or border"],
        ["Selected row", "Soft accent wash", "Accent status dot"],
        ["Primary CTA", "Accent surface", "High-contrast label"],
        ["Disabled control", "Muted neutral", "No accent"],
      ],
    },
  },
  {
    id: "theme-qa-9",
    role: "user",
    content:
      "The green preset looks good now. In the blue preset, hover is subtle and disabled buttons still look clickable.",
    timestamp: "09:27",
  },
  {
    id: "theme-qa-10",
    role: "assistant",
    content:
      "I’d separate those states more clearly: a small lift and brighter edge for hover, then flatter depth, lower contrast, and no lift for disabled controls.",
    timestamp: "09:29",
  },
  {
    id: "theme-qa-11",
    role: "user",
    content:
      "Can you check keyboard focus next? I lose the focus ring on dark cards and inside the composer.",
    timestamp: "09:34",
  },
  {
    id: "theme-qa-12",
    role: "assistant",
    content:
      "A two-layer ring stays visible across neutral and custom surfaces while keeping mouse clicks quiet.",
    timestamp: "09:36",
    variant: "code",
    title: "Shared focus treatment",
    code: {
      language: "css",
      value:
        ":focus-visible {\n  outline: 2px solid var(--lumen-accent);\n  outline-offset: 3px;\n  box-shadow: 0 0 0 1px var(--surface);\n}",
    },
  },
  {
    id: "theme-qa-13",
    role: "user",
    content:
      "Focus is clear now. Tooltips on the Library action icons are clipped by the table, and the dark tooltip is hard to read in plum.",
    timestamp: "09:42",
  },
  {
    id: "theme-qa-14",
    role: "assistant",
    content:
      "That is an overflow issue rather than spacing. The tooltip should render above the table layer, use the theme’s elevated surface, and keep a consistent high-contrast label.",
    timestamp: "09:44",
  },
  {
    id: "theme-qa-15",
    role: "user",
    content:
      "Dialogs need the same check. The backdrop is too strong in light mode, but custom themes make the dialog blend into the page.",
    timestamp: "09:49",
  },
  {
    id: "theme-qa-16",
    role: "assistant",
    content:
      "Use a softer neutral backdrop in light mode and a slightly denser one in dark mode. Keep the dialog surface neutral, add a theme-aware edge, trap focus, and return focus to the trigger when it closes.",
    timestamp: "09:51",
    variant: "rewrite",
    title: "Dialog acceptance criteria",
  },
  {
    id: "theme-qa-17",
    role: "user",
    content:
      "Great. Please spot-check connected surfaces too: Connectors, Settings, Upgrade Plan, and the account menu.",
    timestamp: "09:57",
  },
  {
    id: "theme-qa-18",
    role: "assistant",
    content:
      "The shared tokens carry through correctly. Connectors needed a clearer connected state, Settings needed stronger selected navigation, and the plan cards now keep their CTA spacing and contrast in every preset.",
    timestamp: "10:03",
  },
  {
    id: "theme-qa-19",
    role: "user",
    content:
      "Can you do one final QA pass with reduced motion, keyboard-only navigation, and all custom colors?",
    timestamp: "10:08",
  },
  {
    id: "theme-qa-20",
    role: "assistant",
    content:
      "Final QA is clean across light, dark, green, blue, and plum. Focus order is predictable, tooltips and dialogs stay visible, reduced motion removes decorative transitions, and button states remain distinct. I only noted one follow-up: verify contrast again if the custom palette values become user-editable.",
    timestamp: "10:14",
  },
];
