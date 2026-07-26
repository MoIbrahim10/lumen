import type { ConversationMessage } from "./types";

export const weeklyPlanningConversation: ConversationMessage[] = [
  {
    id: "weekly-planning-1",
    role: "user",
    content:
      "Can you help me plan next week? I keep filling every open hour, then the important work slips when something unexpected comes up.",
    timestamp: "8:04 AM",
  },
  {
    id: "weekly-planning-2",
    role: "assistant",
    content:
      "Yes. Let’s start with the commitments that cannot move, then protect focused work and leave deliberate slack. What is already fixed on your calendar?",
    timestamp: "8:05 AM",
  },
  {
    id: "weekly-planning-3",
    role: "user",
    content:
      "Monday has a team sync at 10 and a client call at 2. Wednesday I have a dentist appointment at 3. Friday has a project review at 11. I also need to pick up my daughter at 4 every day.",
    timestamp: "8:08 AM",
  },
  {
    id: "weekly-planning-4",
    role: "assistant",
    variant: "steps",
    title: "Fixed anchors",
    content:
      "These become the boundaries of the week before we schedule anything flexible.",
    points: [
      "Monday: team sync at 10 AM and client call at 2 PM.",
      "Wednesday: dentist at 3 PM.",
      "Friday: project review at 11 AM.",
      "Every weekday: stop work by 3:40 PM for pickup.",
    ],
    timestamp: "8:10 AM",
  },
  {
    id: "weekly-planning-5",
    role: "user",
    content:
      "My main priority is finishing the product strategy draft. It needs about six focused hours. I also need two hours to prepare for Friday's review.",
    timestamp: "8:13 AM",
  },
  {
    id: "weekly-planning-6",
    role: "assistant",
    content:
      "I’d split the strategy draft into two protected morning blocks, when your attention is strongest, and reserve Thursday morning for the review preparation. That keeps the most demanding work away from fragmented afternoons.",
    timestamp: "8:15 AM",
  },
  {
    id: "weekly-planning-7",
    role: "user",
    content:
      "Mornings are definitely better. I usually fade after lunch, especially on meeting days. Tuesday and Thursday are the only days without fixed calls.",
    timestamp: "8:18 AM",
  },
  {
    id: "weekly-planning-8",
    role: "assistant",
    variant: "table",
    title: "Energy-aware focus blocks",
    content:
      "Use your quietest mornings for creation and keep lower-energy periods for lighter work.",
    table: {
      headers: ["Day", "Morning", "Afternoon"],
      rows: [
        ["Tuesday", "Strategy draft: structure and key decisions", "Email and follow-ups"],
        ["Wednesday", "Strategy draft: complete and revise", "Light work before dentist"],
        ["Thursday", "Prepare Friday review", "Coordination and loose ends"],
      ],
    },
    timestamp: "8:20 AM",
  },
  {
    id: "weekly-planning-9",
    role: "user",
    content:
      "I also have recurring admin: inbox, expenses, and approving timesheets. Those small tasks tend to interrupt everything.",
    timestamp: "8:23 AM",
  },
  {
    id: "weekly-planning-10",
    role: "assistant",
    content:
      "Batch them instead of letting them leak into the focus blocks: twenty minutes for the inbox at the end of each day, expenses Wednesday after lunch, and timesheets Friday after the review. Keep notifications off during the morning blocks.",
    timestamp: "8:25 AM",
  },
  {
    id: "weekly-planning-11",
    role: "user",
    content:
      "I want exercise in the plan too. Three sessions would be ideal, but I often skip them once work gets busy.",
    timestamp: "8:28 AM",
  },
  {
    id: "weekly-planning-12",
    role: "assistant",
    content:
      "Make two sessions dependable and the third optional: a run Tuesday before work, strength training Thursday before work, and a flexible walk on Saturday. Treat the weekday sessions like appointments rather than rewards for finishing work.",
    timestamp: "8:29 AM",
  },
  {
    id: "weekly-planning-13",
    role: "user",
    content:
      "Where should the buffer go? Monday is usually when surprise requests arrive, and the client sometimes sends revisions after our call.",
    timestamp: "8:31 AM",
  },
  {
    id: "weekly-planning-14",
    role: "assistant",
    variant: "table",
    title: "Protected buffers",
    content:
      "Place recovery time where uncertainty is most likely instead of scattering tiny gaps everywhere.",
    table: {
      headers: ["Buffer", "Purpose"],
      rows: [
        ["Monday, 11:00 AM–12:00 PM", "Triage new requests after the team sync"],
        ["Monday, 3:00–3:40 PM", "Absorb client follow-up before pickup"],
        ["Thursday, 2:00–3:00 PM", "Catch spillover without consuming Friday"],
      ],
    },
    timestamp: "8:33 AM",
  },
  {
    id: "weekly-planning-15",
    role: "user",
    content:
      "This still feels full. I also wanted to update the portfolio, research a new planning tool, and clean up our shared drive.",
    timestamp: "8:35 AM",
  },
  {
    id: "weekly-planning-16",
    role: "assistant",
    content:
      "Those are worthwhile, but adding all three would remove the buffer you said you need. Keep the portfolio update as a single one-hour stretch goal on Thursday; move the tool research and drive cleanup to a later-week list.",
    timestamp: "8:36 AM",
  },
  {
    id: "weekly-planning-17",
    role: "user",
    content:
      "That tradeoff works. I also want a simple way to review the week so unfinished work does not disappear into the next one.",
    timestamp: "8:38 AM",
  },
  {
    id: "weekly-planning-18",
    role: "assistant",
    content:
      "Reserve Friday from 2:45 to 3:20 for a weekly review. Check what shipped, move only unfinished priority work, clear or delegate loose tasks, and write the first meaningful action for Monday.",
    timestamp: "8:39 AM",
  },
  {
    id: "weekly-planning-19",
    role: "user",
    content:
      "Great. Give me the final version in a compact format I can follow without rebuilding the plan each morning.",
    timestamp: "8:41 AM",
  },
  {
    id: "weekly-planning-20",
    role: "assistant",
    variant: "steps",
    title: "Your weekly plan",
    content:
      "The week protects the strategy draft, keeps fixed commitments visible, and preserves room for changes.",
    points: [
      "Monday: meetings, request triage, client follow-up, and a protected buffer.",
      "Tuesday: run, three-hour strategy block, then light admin.",
      "Wednesday: finish the strategy draft, expenses, then dentist.",
      "Thursday: strength training, review preparation, optional portfolio hour, and spillover buffer.",
      "Friday: project review, timesheets, loose ends, then the 2:45 PM weekly review.",
    ],
    timestamp: "8:43 AM",
  },
];
