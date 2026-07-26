import type { ConversationMessage } from "./types";

export const healthyRoutineConversation: ConversationMessage[] = [
  {
    id: "healthy-routine-1",
    role: "user",
    content:
      "I want a healthier routine, but strict schedules never last for me. My workdays change, and when I miss one thing I tend to abandon the whole plan.",
    timestamp: "7:42 PM",
  },
  {
    id: "healthy-routine-2",
    role: "assistant",
    content:
      "Let’s build around flexible anchors rather than a perfect timetable. We can choose a few actions that work on normal days, then create smaller versions for busy or low-energy days. What feels most unsettled right now?",
    timestamp: "7:43 PM",
  },
  {
    id: "healthy-routine-3",
    role: "user",
    content:
      "Sleep is inconsistent, I sit for most of the day, and meals become random when work runs late. Those three things seem to affect everything else.",
    timestamp: "7:46 PM",
  },
  {
    id: "healthy-routine-4",
    role: "assistant",
    variant: "steps",
    title: "Three flexible anchors",
    content:
      "Start with one dependable cue in each area instead of trying to redesign the entire day.",
    points: [
      "Sleep: begin a short wind-down within the same one-hour window.",
      "Movement: stand or walk briefly after one recurring work event.",
      "Meals: keep one easy meal option available for late days.",
    ],
    timestamp: "7:48 PM",
  },
  {
    id: "healthy-routine-5",
    role: "user",
    content:
      "My meetings can start at 8 AM or finish at 7 PM, so fixed workout and dinner times are hard. I usually have more control over what happens right after I wake up and after lunch.",
    timestamp: "7:51 PM",
  },
  {
    id: "healthy-routine-6",
    role: "assistant",
    content:
      "Those are useful anchors. After waking, try water and five minutes of gentle movement before checking work. After lunch, take a ten-minute walk or move indoors. The cue stays consistent even when the clock time changes.",
    timestamp: "7:53 PM",
  },
  {
    id: "healthy-routine-7",
    role: "user",
    content:
      "What should I do about meals? I do not want a complicated meal-prep system, but ordering food every busy evening is getting expensive.",
    timestamp: "7:56 PM",
  },
  {
    id: "healthy-routine-8",
    role: "assistant",
    variant: "table",
    title: "Low-friction meal options",
    content:
      "Use three levels so the plan still works when your available time changes.",
    table: {
      headers: ["Time available", "Simple approach"],
      rows: [
        ["20–30 minutes", "Cook a basic protein, grain, and vegetable combination"],
        ["10 minutes", "Assemble leftovers, salad, wraps, or eggs with toast"],
        ["Almost none", "Use a stocked freezer meal or a balanced ready-made option"],
      ],
    },
    timestamp: "7:58 PM",
  },
  {
    id: "healthy-routine-9",
    role: "user",
    content:
      "I like having levels. My bigger problem is the all-or-nothing feeling. If I sleep badly, I assume the day is already lost.",
    timestamp: "8:01 PM",
  },
  {
    id: "healthy-routine-10",
    role: "assistant",
    content:
      "A difficult night can change the day without deciding it. Use a low-energy fallback: shorten movement, choose the easiest available meal, protect a calmer evening, and avoid trying to compensate by making the next day unusually demanding.",
    timestamp: "8:03 PM",
  },
  {
    id: "healthy-routine-11",
    role: "user",
    content:
      "How do I remember the routine without adding a lot of reminders that I will eventually ignore?",
    timestamp: "8:06 PM",
  },
  {
    id: "healthy-routine-12",
    role: "assistant",
    content:
      "Attach each action to something already happening: movement after closing your lunch, preparing tomorrow’s breakfast while clearing dinner, and starting the wind-down when you plug in your phone. Visible cues are often more useful than extra notifications.",
    timestamp: "8:08 PM",
  },
  {
    id: "healthy-routine-13",
    role: "user",
    content:
      "I also need recovery time. I tend to use every free evening for errands, then reach the weekend completely drained.",
    timestamp: "8:11 PM",
  },
  {
    id: "healthy-routine-14",
    role: "assistant",
    variant: "steps",
    title: "Protect recovery",
    content:
      "Treat recovery as part of the routine rather than the time left after everything else.",
    points: [
      "Choose one weeknight with no optional errands.",
      "Keep a short transition between work and home tasks.",
      "Leave one weekend block intentionally unplanned.",
    ],
    timestamp: "8:13 PM",
  },
  {
    id: "healthy-routine-15",
    role: "user",
    content:
      "I have tracked habits before, but seeing missed days made me obsessive about maintaining a streak. Is there a gentler way to notice progress?",
    timestamp: "8:16 PM",
  },
  {
    id: "healthy-routine-16",
    role: "assistant",
    content:
      "Track patterns, not perfection. Once a week, note which anchors helped, which felt difficult, and one adjustment to try. You can use words like “often,” “sometimes,” and “rarely” instead of counting every occurrence.",
    timestamp: "8:18 PM",
  },
  {
    id: "healthy-routine-17",
    role: "user",
    content:
      "Weekends are less predictable because I see friends or visit family. I want them to feel different from workdays without losing all the habits.",
    timestamp: "8:21 PM",
  },
  {
    id: "healthy-routine-18",
    role: "assistant",
    content:
      "Keep only the lightest anchors on weekends: a brief movement choice, one reasonably balanced meal, and a wind-down when you return home. Let social plans provide variety instead of forcing the weekday structure onto them.",
    timestamp: "8:23 PM",
  },
  {
    id: "healthy-routine-19",
    role: "user",
    content:
      "Can you turn this into a two-week experiment? I want it small enough to follow and clear enough to review afterward.",
    timestamp: "8:26 PM",
  },
  {
    id: "healthy-routine-20",
    role: "assistant",
    variant: "steps",
    title: "Two-week experiment",
    content:
      "Test the routine as a flexible system, then keep only what genuinely supports your days.",
    points: [
      "After waking: water and five minutes of movement.",
      "After lunch: take a ten-minute movement break.",
      "For late workdays: choose one stocked, low-effort meal.",
      "Each week: protect one quiet evening and one open weekend block.",
      "At the end: note what often worked, what did not, and one small change for the next two weeks.",
    ],
    timestamp: "8:28 PM",
  },
];
