import type { ConversationMessage } from "./types";

export const launchBriefConversation: ConversationMessage[] = [
  {
    id: "launch-brief-1",
    role: "user",
    content:
      "I have scattered notes for the launch, but no clear plan yet. The product helps small creative teams turn long discussions into organized project decisions.",
    timestamp: "10:06 AM",
  },
  {
    id: "launch-brief-2",
    role: "assistant",
    content:
      "Let’s shape the plan around one audience and one urgent problem first. Who feels the pain most often, and what are they doing today instead?",
    timestamp: "10:07 AM",
  },
  {
    id: "launch-brief-3",
    role: "user",
    content:
      "Design leads at agencies with five to twenty people. They lose decisions across chat, calls, and documents, then spend hours rebuilding context.",
    timestamp: "10:10 AM",
  },
  {
    id: "launch-brief-4",
    role: "assistant",
    variant: "rewrite",
    title: "Working position",
    content:
      "For design leads whose project decisions disappear across tools, Lumen turns conversations into a clear, shared record—without adding another process for the team to maintain.",
    timestamp: "10:12 AM",
  },
  {
    id: "launch-brief-5",
    role: "user",
    content:
      "That is close. I want the message to emphasize momentum, not just organization. What proof can support it?",
    timestamp: "10:15 AM",
  },
  {
    id: "launch-brief-6",
    role: "assistant",
    content:
      "Lead with outcomes you can demonstrate: decisions captured from a real meeting, a project brief assembled in minutes, and fewer follow-up questions because owners and next steps stay visible. A short customer quote would make that stronger.",
    timestamp: "10:17 AM",
  },
  {
    id: "launch-brief-7",
    role: "user",
    content:
      "We have three beta teams. One cut its weekly project recap from ninety minutes to twenty, and another says handoffs are much calmer.",
    timestamp: "10:20 AM",
  },
  {
    id: "launch-brief-8",
    role: "assistant",
    variant: "steps",
    title: "Proof hierarchy",
    content: "Use the strongest evidence near the main claim, then reinforce it.",
    points: [
      "Hero proof: weekly recap time reduced from 90 to 20 minutes.",
      "Workflow proof: show a conversation becoming decisions and owners.",
      "Human proof: quote the team that described calmer handoffs.",
    ],
    timestamp: "10:22 AM",
  },
  {
    id: "launch-brief-9",
    role: "user",
    content:
      "We have a limited budget. Which channels deserve attention for the first two weeks?",
    timestamp: "10:26 AM",
  },
  {
    id: "launch-brief-10",
    role: "assistant",
    content:
      "Prioritize channels where design leads already trust the messenger: founder-led LinkedIn posts, direct outreach to the beta teams’ networks, a focused email to the waitlist, and one practical launch article. Treat Product Hunt as amplification, not the core strategy.",
    timestamp: "10:28 AM",
  },
  {
    id: "launch-brief-11",
    role: "user",
    content:
      "Can you turn that into a realistic timeline? We want to launch in three weeks.",
    timestamp: "10:31 AM",
  },
  {
    id: "launch-brief-12",
    role: "assistant",
    variant: "table",
    title: "Three-week launch timeline",
    content: "Each week has one clear purpose and a small set of deliverables.",
    table: {
      headers: ["Week", "Focus", "Deliverables"],
      rows: [
        ["1", "Message and evidence", "Landing copy, demo story, beta quotes"],
        ["2", "Distribution setup", "Email, social posts, outreach list, press kit"],
        ["3", "Launch and follow-up", "Publish, respond, demo calls, daily review"],
      ],
    },
    timestamp: "10:33 AM",
  },
  {
    id: "launch-brief-13",
    role: "user",
    content:
      "There are four of us: I handle product, Maya handles design, Leo handles growth, and Sam handles customer success. Assign ownership without creating too many handoffs.",
    timestamp: "10:37 AM",
  },
  {
    id: "launch-brief-14",
    role: "assistant",
    content:
      "You should own the narrative and demo, Maya the landing page and launch assets, Leo distribution and measurement, and Sam customer proof plus launch-day replies. Keep one owner per deliverable; reviewers can advise without becoming co-owners.",
    timestamp: "10:39 AM",
  },
  {
    id: "launch-brief-15",
    role: "user",
    content:
      "What could derail this? The product is stable, but onboarding still takes more explanation than I would like.",
    timestamp: "10:43 AM",
  },
  {
    id: "launch-brief-16",
    role: "assistant",
    variant: "steps",
    title: "Launch risks and responses",
    content: "The largest risks are clarity and capacity rather than product stability.",
    points: [
      "Confusing first use: add a guided sample project and a two-minute demo.",
      "Broad messaging: keep every launch asset focused on design leads.",
      "Support overload: prepare onboarding replies and office-hour slots.",
      "Weak proof: secure permission for the beta metrics before publishing.",
    ],
    timestamp: "10:45 AM",
  },
  {
    id: "launch-brief-17",
    role: "user",
    content:
      "I do not want vanity metrics to drive the week. What should we measure to know whether the launch actually worked?",
    timestamp: "10:49 AM",
  },
  {
    id: "launch-brief-18",
    role: "assistant",
    content:
      "Use qualified activation as the primary measure: target users who create a workspace, import or start a conversation, and capture their first decision within 24 hours. Track demo requests, activation rate, time to first decision, and week-one return rate; keep impressions as context only.",
    timestamp: "10:51 AM",
  },
  {
    id: "launch-brief-19",
    role: "user",
    content:
      "Great. Pull everything together into a concise brief the team can use in tomorrow’s kickoff.",
    timestamp: "10:55 AM",
  },
  {
    id: "launch-brief-20",
    role: "assistant",
    content:
      "Launch brief: In three weeks, position Lumen as the fastest way for agency design leads to turn scattered conversations into decisions that keep work moving. Lead with the 90-to-20-minute recap result and calmer handoffs; distribute through founder LinkedIn, the waitlist, warm outreach, and one launch article. You own the narrative, Maya owns assets, Leo owns distribution, and Sam owns proof and support. Measure qualified activation, time to first decision, and week-one return. Tomorrow, confirm beta permissions and lock the landing copy.",
    timestamp: "10:58 AM",
  },
];
