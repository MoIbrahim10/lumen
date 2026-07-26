import type { ConversationMessage } from "./types";

export const assistantFlowConversation: ConversationMessage[] = [
  {
    id: "assistant-flow-1",
    role: "user",
    content:
      "I want the writing assistant to feel focused, not like a blank chatbot. What should the first prompt ask?",
    timestamp: "10:06 AM",
  },
  {
    id: "assistant-flow-2",
    role: "assistant",
    content:
      "Start with the writing goal and enough context to act: what are you writing, who will read it, and what should they understand or do afterward?",
    timestamp: "10:07 AM",
  },
  {
    id: "assistant-flow-3",
    role: "user",
    content:
      "Let’s test it with a product update for customers. The current placeholder says, “Tell us what you want to write.”",
    timestamp: "10:10 AM",
  },
  {
    id: "assistant-flow-4",
    role: "assistant",
    variant: "rewrite",
    title: "Prompt framing",
    content:
      "Describe what you’re writing, who it’s for, and the response you want. Add a draft if you already have one.",
    timestamp: "10:11 AM",
  },
  {
    id: "assistant-flow-5",
    role: "user",
    content:
      "That is clearer. I also want audience and tone controls, but I don’t want the composer crowded with settings.",
    timestamp: "10:14 AM",
  },
  {
    id: "assistant-flow-6",
    role: "assistant",
    content:
      "Keep one compact context control beside the composer. Its summary can read “Customers · Warm,” while a popover holds audience, tone, length, and formality choices.",
    timestamp: "10:15 AM",
  },
  {
    id: "assistant-flow-7",
    role: "user",
    content:
      "After the first result, people should be able to make it shorter, clearer, more confident, or more conversational.",
    timestamp: "10:18 AM",
  },
  {
    id: "assistant-flow-8",
    role: "assistant",
    variant: "rewrite",
    title: "Rewrite choices",
    content:
      "Offer Shorter, Clearer, More confident, and More conversational as quick actions beneath the result. Keep “Custom rewrite” available for a specific instruction.",
    timestamp: "10:19 AM",
  },
  {
    id: "assistant-flow-9",
    role: "user",
    content:
      "What about changing one sentence? Regenerating the entire response would feel wasteful.",
    timestamp: "10:22 AM",
  },
  {
    id: "assistant-flow-10",
    role: "assistant",
    content:
      "Let people select text and choose Rewrite, Shorten, or Add instruction. Replace only that range, animate the change gently, and keep an undo action beside it.",
    timestamp: "10:23 AM",
  },
  {
    id: "assistant-flow-11",
    role: "user",
    content:
      "I’m considering a comparison view so users can decide between the original and the rewrite. Is that too much?",
    timestamp: "10:26 AM",
  },
  {
    id: "assistant-flow-12",
    role: "assistant",
    variant: "table",
    title: "Comparison behavior",
    content:
      "A temporary comparison is useful when the rewrite changes more than a sentence.",
    table: {
      headers: ["View", "Best for", "Action"],
      rows: [
        ["Inline diff", "Small edits", "Accept individual changes"],
        ["Side by side", "Full rewrites", "Keep original or use rewrite"],
      ],
    },
    timestamp: "10:27 AM",
  },
  {
    id: "assistant-flow-13",
    role: "user",
    content:
      "Once they approve a version, copying should be immediate. Some people will also want a document file.",
    timestamp: "10:30 AM",
  },
  {
    id: "assistant-flow-14",
    role: "assistant",
    content:
      "Make Copy the primary result action with a brief confirmation. Put Export to DOCX, Markdown, and plain text in a secondary menu, using the approved version only.",
    timestamp: "10:31 AM",
  },
  {
    id: "assistant-flow-15",
    role: "user",
    content:
      "The main risk is that every rewrite starts sounding generic. How do we preserve the user’s voice?",
    timestamp: "10:34 AM",
  },
  {
    id: "assistant-flow-16",
    role: "assistant",
    content:
      "Treat the draft as the voice reference: preserve characteristic phrasing, sentence rhythm, and level of directness unless the user asks to change them. Show a small “Voice preserved” note rather than another setting.",
    timestamp: "10:35 AM",
  },
  {
    id: "assistant-flow-17",
    role: "user",
    content:
      "Please make the flow efficient from the keyboard, including selecting a rewrite and accepting an inline edit.",
    timestamp: "10:38 AM",
  },
  {
    id: "assistant-flow-18",
    role: "assistant",
    variant: "steps",
    title: "Keyboard flow",
    content:
      "Keep the common path predictable and announce every result change.",
    points: [
      "Enter submits; Shift+Enter adds a line.",
      "Tab reaches context and rewrite actions in visual order.",
      "Arrow keys move within rewrite choices.",
      "Enter applies an edit; Escape cancels; Command+Z restores it.",
    ],
    timestamp: "10:39 AM",
  },
  {
    id: "assistant-flow-19",
    role: "user",
    content:
      "Finish with empty and loading states, then tell me what the final validation pass should cover.",
    timestamp: "10:42 AM",
  },
  {
    id: "assistant-flow-20",
    role: "assistant",
    content:
      "The empty state now offers a clear example instead of filler, and loading uses a short shimmering status before the response streams in place. Final validation covers audience and tone persistence, every rewrite path, inline undo, comparison choices, copy and export output, voice retention, full keyboard use, reduced motion, and both visual themes.",
    timestamp: "10:44 AM",
  },
];
