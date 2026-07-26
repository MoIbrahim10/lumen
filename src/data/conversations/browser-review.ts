import type { ConversationMessage } from "./types";

export const browserReviewConversation: ConversationMessage[] = [
  {
    id: "browser-review-1",
    role: "user",
    content:
      "I attached the latest validation notes and a screenshot of the scroll issue. Can you review both before we change anything?",
    timestamp: "9:18 AM",
    attachments: [
      {
        id: "browser-review-notes",
        kind: "file",
        name: "ui-validation-notes.md",
        meta: "18 KB",
      },
      {
        id: "browser-review-scroll",
        kind: "image",
        name: "scroll-behavior.png",
        meta: "284 KB",
      },
    ],
  },
  {
    id: "browser-review-2",
    role: "assistant",
    content:
      "I reviewed both. The screenshot confirms the page is sharing one scroll context, while the notes call out message spacing, loading feedback, and sidebar actions as the main friction points.",
    timestamp: "9:19 AM",
  },
  {
    id: "browser-review-3",
    role: "user",
    content:
      "Let’s start with scrolling. The sidebar and conversation should move independently, but the composer must stay easy to reach.",
    timestamp: "9:22 AM",
  },
  {
    id: "browser-review-4",
    role: "assistant",
    content: "I’d assign each region a clear owner:",
    timestamp: "9:23 AM",
    variant: "table",
    title: "Scroll ownership",
    table: {
      headers: ["Region", "Behavior"],
      rows: [
        ["Sidebar", "Scrolls projects and chats independently"],
        ["Conversation", "Scrolls messages and keeps its position"],
        ["Composer", "Remains anchored to the conversation pane"],
      ],
    },
  },
  {
    id: "browser-review-5",
    role: "user",
    content:
      "When I send a message, it sometimes lands far above the reply. Keep the latest exchange together and scroll to the bottom naturally.",
    timestamp: "9:27 AM",
  },
  {
    id: "browser-review-6",
    role: "assistant",
    content:
      "I’ll anchor to the newest message when the user is already near the bottom, then follow the streamed reply without adding a large spacer. If they scroll up to read, automatic scrolling will pause.",
    timestamp: "9:28 AM",
  },
  {
    id: "browser-review-7",
    role: "user",
    content:
      "The assistant also feels frozen before text appears. I want a subtle loading state, streaming text, and an optional reasoning summary.",
    timestamp: "9:32 AM",
  },
  {
    id: "browser-review-8",
    role: "assistant",
    content: "The response lifecycle should feel continuous:",
    timestamp: "9:33 AM",
    variant: "steps",
    title: "Response feedback",
    points: [
      "Show a short shimmering status immediately.",
      "Let users expand a concise reasoning summary.",
      "Replace the status with streamed text in the same position.",
      "Keep the viewport following only while it remains near the bottom.",
    ],
  },
  {
    id: "browser-review-9",
    role: "user",
    content:
      "In the sidebar, chat names leave an empty gap when actions are hidden. Pin, menu, and delete should appear only when needed.",
    timestamp: "9:37 AM",
  },
  {
    id: "browser-review-10",
    role: "assistant",
    content:
      "I’ll let idle labels use the full row width. On hover or keyboard focus, the timestamp will fade and the actions will overlay that same space, matching the compact behavior in ChatGPT.",
    timestamp: "9:38 AM",
  },
  {
    id: "browser-review-11",
    role: "user",
    content:
      "Please test that without a mouse. I need visible focus, sensible tab order, and controls that screen readers can identify.",
    timestamp: "9:42 AM",
  },
  {
    id: "browser-review-12",
    role: "assistant",
    content:
      "The chat row will remain one navigation target, with its action buttons revealed on `focus-within`. Each action gets a specific accessible name, menus return focus to their trigger, and destructive actions require confirmation.",
    timestamp: "9:43 AM",
    variant: "code",
    title: "Keyboard-visible actions",
    code: {
      language: "tsx",
      value:
        '<button aria-label={`Delete ${chat.title}`} className="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">…</button>',
    },
  },
  {
    id: "browser-review-13",
    role: "user",
    content:
      "How does this hold up on a laptop, tablet, and narrow phone? The sidebar shouldn’t squeeze the conversation.",
    timestamp: "9:47 AM",
  },
  {
    id: "browser-review-14",
    role: "assistant",
    content:
      "Desktop keeps two independent panes. At tablet widths the sidebar narrows while preserving readable rows, and on phones it becomes a dismissible drawer so the conversation and composer retain the full viewport.",
    timestamp: "9:48 AM",
  },
  {
    id: "browser-review-15",
    role: "user",
    content:
      "Check performance too. Streaming and scroll tracking shouldn’t make every message or sidebar row rerender.",
    timestamp: "9:52 AM",
  },
  {
    id: "browser-review-16",
    role: "assistant",
    content:
      "I’ll keep streaming updates scoped to the active response, use one bottom sentinel instead of measuring every message, and avoid scroll state in React. Sidebar rows only update when their active, pinned, or deleted state changes.",
    timestamp: "9:53 AM",
  },
  {
    id: "browser-review-17",
    role: "user",
    content:
      "Before the final pass, summarize exactly what you’ll retest in both themes and with reduced motion enabled.",
    timestamp: "9:57 AM",
  },
  {
    id: "browser-review-18",
    role: "assistant",
    content: "I’ll run the final pass in this order:",
    timestamp: "9:58 AM",
    variant: "steps",
    title: "Retest checklist",
    points: [
      "Verify independent scrolling and composer anchoring.",
      "Send long and short prompts, then interrupt scrolling during streaming.",
      "Reach every sidebar action by keyboard and confirm announcements.",
      "Check desktop, tablet, and phone layouts in both themes.",
      "Repeat transitions with reduced motion and review render activity.",
    ],
  },
  {
    id: "browser-review-19",
    role: "user",
    content:
      "Run that pass now. Pay special attention to the original bottom-jump bug and the empty action space in chat rows.",
    timestamp: "10:04 AM",
  },
  {
    id: "browser-review-20",
    role: "assistant",
    content:
      "Final retest passes. The panes scroll independently, new replies stay close to their prompts, bottom following pauses when reading older content, and shimmer transitions cleanly into streaming. Sidebar labels now fill idle rows and reveal accessible actions without layout shift. Both themes, reduced motion, keyboard navigation, responsive layouts, and the focused render checks are consistent.",
    timestamp: "10:08 AM",
  },
];
