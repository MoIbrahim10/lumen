import type { ConversationMessage } from "./types";

export const researchSynthesisConversation: ConversationMessage[] = [
  {
    id: "research-synthesis-1",
    role: "user",
    content:
      "I finished eight interviews with team leads using our planning workspace. Can you help me turn the notes into something more useful than a list of quotes?",
    timestamp: "13:04",
  },
  {
    id: "research-synthesis-2",
    role: "assistant",
    content:
      "Yes. I’ll separate repeated behavior from individual preferences, keep the evidence traceable to participants, and call out contradictions instead of smoothing them over. What question was this round meant to answer?",
    timestamp: "13:05",
  },
  {
    id: "research-synthesis-3",
    role: "user",
    content:
      "We wanted to understand why projects start in the product but end up being managed in spreadsheets or chat. The notes are tagged P1 through P8.",
    timestamp: "13:08",
  },
  {
    id: "research-synthesis-4",
    role: "assistant",
    variant: "steps",
    title: "Synthesis frame",
    content:
      "I’d organize the evidence around the point where work leaves the product.",
    points: [
      "Map each participant’s workflow from project setup to weekly follow-through.",
      "Mark the trigger that caused them to switch tools.",
      "Group triggers by underlying need, not by requested feature.",
      "Record disconfirming evidence beside every emerging theme.",
    ],
    timestamp: "13:10",
  },
  {
    id: "research-synthesis-5",
    role: "user",
    content:
      "The strongest pattern seems to be visibility. Six people said they could not tell what changed since their last visit, but two said the activity feed was already too noisy.",
    timestamp: "13:15",
  },
  {
    id: "research-synthesis-6",
    role: "assistant",
    content:
      "That sounds like a need for relevant change awareness, not simply more activity. The six participants lack a useful return point; the other two show that an exhaustive feed may worsen the problem. I’d frame the theme as “help me resume with confidence.”",
    timestamp: "13:17",
  },
  {
    id: "research-synthesis-7",
    role: "user",
    content:
      "Another pattern: five leads rebuild a status view in spreadsheets. They say our dashboard looks polished, but it does not match what they need for leadership updates.",
    timestamp: "13:22",
  },
  {
    id: "research-synthesis-8",
    role: "assistant",
    variant: "table",
    title: "Emerging themes and evidence",
    content:
      "The behavior points to two related but distinct gaps.",
    table: {
      headers: ["Theme", "Evidence", "Interpretation"],
      rows: [
        [
          "Resume with confidence",
          "6 of 8 cannot identify meaningful changes",
          "Users need a filtered return summary",
        ],
        [
          "Report in their own language",
          "5 of 8 rebuild status views externally",
          "The fixed dashboard does not fit stakeholder reporting",
        ],
        [
          "Control notification volume",
          "2 of 8 find the activity feed noisy",
          "More events alone will not solve visibility",
        ],
      ],
    },
    timestamp: "13:24",
  },
  {
    id: "research-synthesis-9",
    role: "user",
    content:
      "There is a contradiction around templates too. Newer leads asked for more guidance, while experienced leads said templates slow them down.",
    timestamp: "13:29",
  },
  {
    id: "research-synthesis-10",
    role: "assistant",
    content:
      "I would preserve that as a segmentation insight. Newer leads need a supported starting point; experienced leads need a fast path and control. The opportunity is progressive guidance: useful defaults that can be skipped, changed, or saved as a team-specific pattern.",
    timestamp: "13:31",
  },
  {
    id: "research-synthesis-11",
    role: "user",
    content:
      "Can we turn these themes into opportunity areas without jumping straight to feature ideas?",
    timestamp: "13:36",
  },
  {
    id: "research-synthesis-12",
    role: "assistant",
    variant: "table",
    title: "Opportunity areas",
    content:
      "These statements describe outcomes to improve while leaving room for multiple solutions.",
    table: {
      headers: ["Opportunity", "Desired outcome", "Evidence strength"],
      rows: [
        [
          "Return-point clarity",
          "Leads quickly understand meaningful progress and risk",
          "Strong · 6 participants",
        ],
        [
          "Flexible status communication",
          "Teams shape updates for different stakeholders without rebuilding data",
          "Strong · 5 participants",
        ],
        [
          "Adaptive setup support",
          "Guidance matches the lead’s experience and working style",
          "Moderate · split by experience",
        ],
      ],
    },
    timestamp: "13:38",
  },
  {
    id: "research-synthesis-13",
    role: "user",
    content:
      "Which opportunity should we prioritize first? Leadership will probably push for the reporting one because it is easier to demo.",
    timestamp: "13:43",
  },
  {
    id: "research-synthesis-14",
    role: "assistant",
    content:
      "Prioritize return-point clarity for discovery. It appears most often and may be upstream of reporting: if leads cannot trust what changed, a more flexible report still carries weak inputs. Keep reporting second, but test whether one shared change summary can support both daily resumption and stakeholder updates.",
    timestamp: "13:45",
  },
  {
    id: "research-synthesis-15",
    role: "user",
    content:
      "What should the next research round test so we do not just confirm what we already believe?",
    timestamp: "13:50",
  },
  {
    id: "research-synthesis-16",
    role: "assistant",
    variant: "steps",
    title: "Next research round",
    content:
      "Use tasks and counterexamples to challenge the current interpretation.",
    points: [
      "Observe leads returning after several days and ask what they need first.",
      "Compare a filtered change summary with an editable status view.",
      "Recruit two teams that already rely on the existing activity feed.",
      "Test whether reporting behavior changes by audience, cadence, or project risk.",
      "Define failure evidence before sessions begin.",
    ],
    timestamp: "13:52",
  },
  {
    id: "research-synthesis-17",
    role: "user",
    content:
      "I need to share this tomorrow. Can you give me a stakeholder-ready finding that is confident but does not overstate eight interviews?",
    timestamp: "13:58",
  },
  {
    id: "research-synthesis-18",
    role: "assistant",
    content:
      "Team leads are not leaving primarily because project data is missing; they leave because the product does not help them interpret and reshape that data for the moment at hand. Across this directional sample, the clearest opportunities are confident resumption and flexible status communication. A follow-up study should test whether those needs share one underlying workflow.",
    timestamp: "14:00",
  },
  {
    id: "research-synthesis-19",
    role: "user",
    content:
      "Add the main caveat and the decision we can responsibly make now.",
    timestamp: "14:04",
  },
  {
    id: "research-synthesis-20",
    role: "assistant",
    content:
      "Caveat: the sample is small, limited to team leads, and may underrepresent contributors who consume rather than prepare updates. Responsible decision: invest in a lightweight prototype that connects change awareness with status preparation, then validate it across experience levels and roles before committing to a full reporting system.",
    timestamp: "14:05",
  },
];
