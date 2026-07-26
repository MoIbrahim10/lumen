import { assistantFlowConversation } from "./assistant-flow";
import { browserReviewConversation } from "./browser-review";
import { emailConceptsConversation } from "./email-concepts";
import { healthyRoutineConversation } from "./healthy-routine";
import { launchBriefConversation } from "./launch-brief";
import { motionSystemConversation } from "./motion-system";
import { navigationIaConversation } from "./navigation-ia";
import { portfolioStoryConversation } from "./portfolio-story";
import { researchSynthesisConversation } from "./research-synthesis";
import { themeQaConversation } from "./theme-qa";
import { weeklyPlanningConversation } from "./weekly-planning";
import type { ConversationMessage } from "./types";

export const SEEDED_CONVERSATIONS: Record<string, ConversationMessage[]> = {
  "navigation-ia": navigationIaConversation,
  "motion-system": motionSystemConversation,
  "theme-qa": themeQaConversation,
  "launch-brief": launchBriefConversation,
  "research-synthesis": researchSynthesisConversation,
  "portfolio-story": portfolioStoryConversation,
  "weekly-planning": weeklyPlanningConversation,
  "assistant-flow": assistantFlowConversation,
  "browser-review": browserReviewConversation,
  "email-concepts": emailConceptsConversation,
  "healthy-routine": healthyRoutineConversation,
};
