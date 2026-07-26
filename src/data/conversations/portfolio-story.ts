import type { ConversationMessage } from "./types";

export const portfolioStoryConversation: ConversationMessage[] = [
  {
    id: "portfolio-story-1",
    role: "user",
    content:
      "I want to turn my workspace redesign into a portfolio case study, but the draft reads like a list of screens. I’m applying for senior product design roles.",
    timestamp: "2:04 PM",
  },
  {
    id: "portfolio-story-2",
    role: "assistant",
    content:
      "Then the story should help design leaders see your judgment, not just the final UI. Who was the product for, and what problem made the redesign necessary?",
    timestamp: "2:05 PM",
  },
  {
    id: "portfolio-story-3",
    role: "user",
    content:
      "It was for small creative teams using an AI workspace. People could chat, manage projects, and connect tools, but navigation felt dense and important actions were hard to find.",
    timestamp: "2:08 PM",
  },
  {
    id: "portfolio-story-4",
    role: "assistant",
    variant: "rewrite",
    title: "Opening problem",
    content:
      "Lumen had grown from a focused chat tool into a broader AI workspace, but its navigation had not grown with it. Creative teams struggled to move between conversations, projects, files, and connected tools without losing context.",
    timestamp: "2:10 PM",
  },
  {
    id: "portfolio-story-5",
    role: "user",
    content:
      "That feels accurate. I led the work myself, although the founder reviewed direction and two engineers helped check feasibility.",
    timestamp: "2:13 PM",
  },
  {
    id: "portfolio-story-6",
    role: "assistant",
    content:
      "State that plainly: you owned product design from discovery through interaction detail, aligned direction with the founder, and partnered with engineering on feasibility. It shows leadership without overstating sole ownership.",
    timestamp: "2:15 PM",
  },
  {
    id: "portfolio-story-7",
    role: "user",
    content:
      "The biggest constraints were a three-week timeline, no formal research budget, and an existing theme system that the redesign could not break.",
    timestamp: "2:18 PM",
  },
  {
    id: "portfolio-story-8",
    role: "assistant",
    variant: "steps",
    title: "Constraints that shaped the work",
    content:
      "Frame each constraint as a design condition and show how you responded.",
    points: [
      "Three weeks: prioritize navigation and core chat flows over broad visual polish.",
      "No research budget: use support notes, session recordings, and quick usability checks.",
      "Existing themes: build interactions from shared tokens instead of page-specific styles.",
    ],
    timestamp: "2:20 PM",
  },
  {
    id: "portfolio-story-9",
    role: "user",
    content:
      "My main decisions were simplifying the sidebar, making projects and chats collapsible, separating the library from connectors, and keeping controls contextual until hover.",
    timestamp: "2:24 PM",
  },
  {
    id: "portfolio-story-10",
    role: "assistant",
    content:
      "Connect those choices to user needs: collapsible groups reduced scanning, separate destinations clarified mental models, and contextual controls preserved capability without making every row feel heavy. Include one discarded direction to show evaluation.",
    timestamp: "2:26 PM",
  },
  {
    id: "portfolio-story-11",
    role: "user",
    content:
      "I first tried persistent action buttons on every chat row. They made pinning obvious, but the sidebar became noisy and titles lost too much space, so I moved them to hover and focus states.",
    timestamp: "2:29 PM",
  },
  {
    id: "portfolio-story-12",
    role: "assistant",
    variant: "table",
    title: "Decision evidence",
    content:
      "A compact comparison will make the tradeoff visible rather than merely claiming the final design was better.",
    table: {
      headers: ["Direction", "Benefit", "Cost", "Decision"],
      rows: [
        ["Persistent actions", "Immediate discoverability", "Noise and truncated titles", "Rejected"],
        ["Contextual actions", "Calmer scanning", "Requires hover or focus", "Selected"],
      ],
    },
    timestamp: "2:31 PM",
  },
  {
    id: "portfolio-story-13",
    role: "user",
    content:
      "We tested with five people. Four found a recent chat faster, all five understood Library versus Connectors, and no one missed the row actions after hovering once.",
    timestamp: "2:35 PM",
  },
  {
    id: "portfolio-story-14",
    role: "assistant",
    content:
      "Those are useful directional outcomes. Label the sample honestly, pair the numbers with what changed in behavior, and avoid presenting five sessions as definitive validation.",
    timestamp: "2:37 PM",
  },
  {
    id: "portfolio-story-15",
    role: "user",
    content:
      "I also have before-and-after screenshots, a short prototype recording, support quotes about navigation confusion, and the final component states. Which evidence should lead?",
    timestamp: "2:41 PM",
  },
  {
    id: "portfolio-story-16",
    role: "assistant",
    content:
      "Lead with one before-and-after comparison tied to the core task, then use the prototype recording to show interaction. Place support quotes near the original problem and component states near the implementation section so every artifact proves the claim beside it.",
    timestamp: "2:43 PM",
  },
  {
    id: "portfolio-story-17",
    role: "user",
    content:
      "For reflection, I would involve engineering earlier and test keyboard behavior sooner. I also learned that reducing visual weight can improve usability without removing features.",
    timestamp: "2:47 PM",
  },
  {
    id: "portfolio-story-18",
    role: "assistant",
    content:
      "The project changed how I think about simplification: the strongest result did not come from removing capability, but from revealing it at the right moment. Next time, I would involve engineering during the earliest interaction studies and include keyboard behavior in the first usability pass.",
    timestamp: "2:49 PM",
  },
  {
    id: "portfolio-story-19",
    role: "user",
    content:
      "Can you give me a strong headline and a final outline that keeps the case study concise?",
    timestamp: "2:52 PM",
  },
  {
    id: "portfolio-story-20",
    role: "assistant",
    variant: "steps",
    title: "Final case-study outline",
    content:
      "Headline: Redesigning an AI workspace so growing capability still feels calm.",
    points: [
      "Context: audience, product growth, and your design ownership.",
      "Problem: navigation density, lost context, and supporting user evidence.",
      "Constraints: three weeks, lightweight research, and theme compatibility.",
      "Decisions: hierarchy, collapsible groups, destinations, and contextual actions.",
      "Validation: five sessions, observed task improvements, and limitations.",
      "Outcome: a calmer system supported by comparisons, recording, and component states.",
      "Reflection: earlier engineering partnership and keyboard-first validation.",
    ],
    timestamp: "2:54 PM",
  },
];
