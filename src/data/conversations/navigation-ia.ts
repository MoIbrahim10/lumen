import type { ConversationMessage } from "./types";

export const navigationIaConversation: ConversationMessage[] = [
  {
    id: "navigation-ia-1",
    role: "user",
    content:
      "The sidebar feels too heavy. Projects and chats read like primary buttons instead of navigation.",
    timestamp: "9:12 AM",
  },
  {
    id: "navigation-ia-2",
    role: "assistant",
    content:
      "I’d flatten those rows, keep the active state subtle, and reserve raised surfaces for the three main actions. That should make the hierarchy feel calmer without losing discoverability.",
    timestamp: "9:13 AM",
  },
  {
    id: "navigation-ia-3",
    role: "user",
    content:
      "Good. Projects should expand to show their chats, and the general Chats section should collapse too.",
    timestamp: "9:16 AM",
  },
  {
    id: "navigation-ia-4",
    role: "assistant",
    content: "I’d handle the hierarchy in three layers:",
    timestamp: "9:17 AM",
    variant: "steps",
    title: "Sidebar hierarchy",
    points: [
      "Projects heading toggles the entire project list.",
      "Each project independently reveals its conversations.",
      "Chats heading collapses recent ungrouped conversations.",
    ],
  },
  {
    id: "navigation-ia-5",
    role: "user",
    content:
      "Make sure opening one project doesn’t close another. I sometimes compare work across two projects.",
    timestamp: "9:20 AM",
  },
  {
    id: "navigation-ia-6",
    role: "assistant",
    content:
      "Agreed. Each project will keep its own expanded state, so the accordion supports multiple open sections. I’ll also persist those choices during the session to avoid resetting the sidebar while navigating.",
    timestamp: "9:21 AM",
  },
  {
    id: "navigation-ia-7",
    role: "user",
    content:
      "The sidebar and conversation should scroll separately. Right now a long chat moves everything.",
    timestamp: "9:25 AM",
  },
  {
    id: "navigation-ia-8",
    role: "assistant",
    content: "Here’s the intended scroll ownership:",
    timestamp: "9:26 AM",
    variant: "table",
    title: "Independent scroll regions",
    table: {
      headers: ["Region", "Behavior"],
      rows: [
        ["Sidebar", "Scrolls projects and chats; account row remains reachable"],
        ["Conversation", "Scrolls messages without shifting navigation"],
        ["Composer", "Stays anchored within the conversation pane"],
      ],
    },
  },
  {
    id: "navigation-ia-9",
    role: "user",
    content:
      "On a new chat, I want the centered composer to move to the bottom after sending instead of suddenly jumping.",
    timestamp: "9:31 AM",
  },
  {
    id: "navigation-ia-10",
    role: "assistant",
    content:
      "I’ll transition the same composer container from its welcome position into the anchored chat position, then bring in the message thread. A shared layout animation will keep it feeling continuous rather than like a page swap.",
    timestamp: "9:32 AM",
  },
  {
    id: "navigation-ia-11",
    role: "user",
    content:
      "Can we respect reduced motion? The transition should still make sense without the movement.",
    timestamp: "9:35 AM",
  },
  {
    id: "navigation-ia-12",
    role: "assistant",
    content:
      "Yes. Motion-capable users get a short spring transition; reduced-motion users get an immediate layout change with a gentle opacity handoff.",
    timestamp: "9:36 AM",
    variant: "code",
    title: "Motion preference",
    code: {
      language: "tsx",
      value:
        "const reduceMotion = useReducedMotion();\nconst transition = reduceMotion ? { duration: 0 } : { type: \"spring\", stiffness: 360, damping: 34 };",
    },
  },
  {
    id: "navigation-ia-13",
    role: "user",
    content:
      "Keyboard behavior matters too. I should be able to reach every disclosure and know whether it’s open.",
    timestamp: "9:40 AM",
  },
  {
    id: "navigation-ia-14",
    role: "assistant",
    content:
      "The headings and project rows will be real buttons with visible focus states, `aria-expanded`, and linked region IDs. Enter and Space will toggle them, while chat rows remain direct navigation targets.",
    timestamp: "9:41 AM",
  },
  {
    id: "navigation-ia-15",
    role: "user",
    content:
      "How should this behave on smaller screens? I don’t want the conversation squeezed beside the full sidebar.",
    timestamp: "9:45 AM",
  },
  {
    id: "navigation-ia-16",
    role: "assistant",
    content:
      "Below the desktop breakpoint, the sidebar will become an overlay drawer with a backdrop and close after selecting a chat. The conversation keeps the full viewport width, and the composer preserves comfortable side padding.",
    timestamp: "9:46 AM",
  },
  {
    id: "navigation-ia-17",
    role: "user",
    content:
      "Please check long chat names, pinned actions on hover, and whether focus gets trapped when the mobile drawer opens.",
    timestamp: "9:51 AM",
  },
  {
    id: "navigation-ia-18",
    role: "assistant",
    content: "I’ll validate the interaction states in this order:",
    timestamp: "9:52 AM",
    variant: "steps",
    title: "Validation pass",
    points: [
      "Confirm labels truncate without reserving empty action space.",
      "Reveal pin and menu actions on hover and keyboard focus.",
      "Trap focus in the mobile drawer and restore it on close.",
      "Verify independent scrolling at desktop and mobile widths.",
    ],
  },
  {
    id: "navigation-ia-19",
    role: "user",
    content:
      "That covers it. Do a final pass in both themes and make sure the active chat remains obvious without becoming another heavy button.",
    timestamp: "9:58 AM",
  },
  {
    id: "navigation-ia-20",
    role: "assistant",
    content:
      "Final validation looks consistent: both themes keep clear contrast, the active chat uses a quiet tinted row, long labels truncate cleanly, and keyboard focus stays distinct. Independent scrolling, responsive drawer behavior, collapsible sections, and the composer transition all work together without changing the established visual system.",
    timestamp: "10:03 AM",
  },
];
