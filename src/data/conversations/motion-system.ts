import type { ConversationMessage } from "./types";

export const motionSystemConversation: ConversationMessage[] = [
  {
    id: "motion-system-1",
    role: "user",
    content:
      "The interface still feels a little static. Can we add motion without making it feel playful or distracting?",
    timestamp: "09:08",
  },
  {
    id: "motion-system-2",
    role: "assistant",
    content:
      "Yes. I’d keep motion quiet and functional: reveal relationships, confirm state changes, and preserve spatial continuity. Most transitions can stay between 160–240ms with restrained easing.",
    timestamp: "09:09",
  },
  {
    id: "motion-system-3",
    role: "user",
    content:
      "What should we animate first so the system feels consistent rather than patched together?",
    timestamp: "09:11",
  },
  {
    id: "motion-system-4",
    role: "assistant",
    variant: "steps",
    title: "Start with three motion primitives",
    content: "These cover the highest-frequency interactions without creating visual noise.",
    points: [
      "Enter and exit: short opacity with a 4–8px translation.",
      "Shared state: animate selection indicators between tabs and filters.",
      "Layout change: use measured height transitions for drawers and accordions.",
    ],
    timestamp: "09:12",
  },
  {
    id: "motion-system-5",
    role: "user",
    content:
      "I’m concerned that a transition could trap someone when they click again quickly. How do we keep everything interruptible?",
    timestamp: "09:16",
  },
  {
    id: "motion-system-6",
    role: "assistant",
    content:
      "Drive animation from the latest state instead of queued sequences. A second click should immediately retarget the current animation, and destructive actions should remain available as soon as the destination is visible.",
    timestamp: "09:17",
  },
  {
    id: "motion-system-7",
    role: "user",
    content:
      "Can you define reduced-motion behavior too? I don’t want it added as an afterthought.",
    timestamp: "09:20",
  },
  {
    id: "motion-system-8",
    role: "assistant",
    variant: "table",
    title: "Reduced-motion mapping",
    content:
      "The same state changes remain clear, but movement is removed or shortened.",
    table: {
      headers: ["Default", "Reduced motion"],
      rows: [
        ["Fade + translate", "Instant opacity change"],
        ["Spring layout shift", "Short crossfade"],
        ["Streaming shimmer", "Static status text"],
        ["Accordion height", "Immediate expand or collapse"],
      ],
    },
    timestamp: "09:22",
  },
  {
    id: "motion-system-9",
    role: "user",
    content:
      "The springs feel inconsistent right now. Some buttons snap while the panels wobble. What tuning would you use?",
    timestamp: "09:27",
  },
  {
    id: "motion-system-10",
    role: "assistant",
    content:
      "Use one firm spring for small controls and one softer spring for layout. Controls should settle almost immediately; panels can take slightly longer, but neither should overshoot enough to call attention to itself.",
    timestamp: "09:28",
  },
  {
    id: "motion-system-11",
    role: "user",
    content:
      "How should the composer move when I send a prompt from the empty new-chat screen?",
    timestamp: "09:34",
  },
  {
    id: "motion-system-12",
    role: "assistant",
    content:
      "Keep the composer as the same visual object: animate it from the centered position to the bottom while the conversation header and first message fade in. The submitted text should leave the field and appear as a message in the same beat.",
    timestamp: "09:35",
  },
  {
    id: "motion-system-13",
    role: "user",
    content:
      "Could you show a small transition preset for that? I want the timing to be easy to reuse.",
    timestamp: "09:39",
  },
  {
    id: "motion-system-14",
    role: "assistant",
    variant: "code",
    title: "Composer transition",
    content:
      "A firm spring preserves continuity without adding bounce.",
    code: {
      language: "ts",
      value:
        'export const composerTransition = {\n  type: "spring",\n  stiffness: 420,\n  damping: 38,\n  mass: 0.8,\n} as const;',
    },
    timestamp: "09:40",
  },
  {
    id: "motion-system-15",
    role: "user",
    content:
      "For loading and streaming, I don’t want a generic spinner. What would feel more like a real assistant?",
    timestamp: "09:45",
  },
  {
    id: "motion-system-16",
    role: "assistant",
    content:
      "Use a single shimmering status line before the first token, with an optional reasoning summary beneath it. Once text begins streaming, replace the shimmer in place so the response never jumps or creates a large empty gap.",
    timestamp: "09:47",
  },
  {
    id: "motion-system-17",
    role: "user",
    content:
      "Tabs and accordions still lose their active state during transitions. Can we make those changes read more clearly?",
    timestamp: "09:52",
  },
  {
    id: "motion-system-18",
    role: "assistant",
    variant: "steps",
    title: "Preserve state continuity",
    content:
      "Treat selection and disclosure as separate motion patterns.",
    points: [
      "Move one shared active indicator between tabs; keep labels stationary.",
      "Keep accordion headers fixed while only the content region changes height.",
      "Fade outgoing content briefly, then reveal incoming content without overlap.",
      "Return focus to the triggering control after collapse when appropriate.",
    ],
    timestamp: "09:54",
  },
  {
    id: "motion-system-19",
    role: "user",
    content:
      "That direction feels right. What should final QA cover before we call the motion system done?",
    timestamp: "10:01",
  },
  {
    id: "motion-system-20",
    role: "assistant",
    content:
      "Test every transition at normal and rapid input speeds, with reduced motion enabled, keyboard-only navigation, and narrow layouts. Verify there are no queued animations, layout jumps, lost focus states, or delays before an action becomes usable.",
    timestamp: "10:03",
  },
];
