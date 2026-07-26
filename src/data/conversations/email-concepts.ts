import type { ConversationMessage } from "./types";

export const emailConceptsConversation: ConversationMessage[] = [
  {
    id: "email-concepts-1",
    role: "user",
    content:
      "The confirmation email still feels like a marketing page. I want it to feel calm and editorial while making the order status obvious.",
    timestamp: "2:04 PM",
  },
  {
    id: "email-concepts-2",
    role: "assistant",
    content:
      "Lead with the confirmation itself, then the order number and expected next step. Keep the brand statement secondary, use one restrained display line, and let generous spacing—not decoration—create the editorial character.",
    timestamp: "2:05 PM",
  },
  {
    id: "email-concepts-3",
    role: "user",
    content:
      "Can you tighten the subject line and preheader? Right now they repeat “your order is confirmed.”",
    timestamp: "2:08 PM",
  },
  {
    id: "email-concepts-4",
    role: "assistant",
    variant: "rewrite",
    title: "Inbox copy",
    content:
      "Subject: Your order is confirmed\nPreheader: We’re preparing order FI-2841 and will send tracking when it leaves the studio.",
    timestamp: "2:09 PM",
  },
  {
    id: "email-concepts-5",
    role: "user",
    content:
      "The desktop layout has a beautiful two-column receipt, but it becomes cramped on mobile. What should collapse first?",
    timestamp: "2:13 PM",
  },
  {
    id: "email-concepts-6",
    role: "assistant",
    content:
      "Stack the receipt into one column below 600 pixels. Keep item name, quantity, and price on one readable row when possible; move shipping and billing into separate blocks, and make the primary support link full width without enlarging every control.",
    timestamp: "2:14 PM",
  },
  {
    id: "email-concepts-7",
    role: "user",
    content:
      "I’m worried the quieter visual style makes the transactional details feel optional. How do we keep the email unmistakably functional?",
    timestamp: "2:18 PM",
  },
  {
    id: "email-concepts-8",
    role: "assistant",
    content:
      "Use explicit labels such as “Order confirmed,” “Ships by,” and “Delivering to.” Place them before any editorial message, preserve a clear status sentence in live text, and reserve the accent color for status and actionable links.",
    timestamp: "2:19 PM",
  },
  {
    id: "email-concepts-9",
    role: "user",
    content:
      "Which receipt details deserve the first screen, and which can sit lower without hurting trust?",
    timestamp: "2:23 PM",
  },
  {
    id: "email-concepts-10",
    role: "assistant",
    variant: "table",
    title: "Receipt hierarchy",
    content:
      "Keep the first screen focused on details customers use to verify the purchase.",
    table: {
      headers: ["Priority", "Details", "Placement"],
      rows: [
        ["Immediate", "Order number, total, delivery estimate", "Directly below status"],
        ["Supporting", "Items, quantities, shipping address", "Receipt section"],
        ["Reference", "Billing method, tax, support policy", "Lower details section"],
      ],
    },
    timestamp: "2:24 PM",
  },
  {
    id: "email-concepts-11",
    role: "user",
    content:
      "Please check accessibility too. The concept uses pale gray type, thin dividers, and a product image with the item name beneath it.",
    timestamp: "2:28 PM",
  },
  {
    id: "email-concepts-12",
    role: "assistant",
    content:
      "Darken secondary copy to maintain contrast, and never rely on dividers alone to define sections. Give the product image meaningful alt text only if it adds information; otherwise use empty alt text because the adjacent item name already identifies it. Keep links descriptive and the reading order linear.",
    timestamp: "2:29 PM",
  },
  {
    id: "email-concepts-13",
    role: "user",
    content:
      "We need versions for shipped, partially shipped, delayed, and pickup-ready orders. Should each status get a different design?",
    timestamp: "2:33 PM",
  },
  {
    id: "email-concepts-14",
    role: "assistant",
    content:
      "Keep one structural system and vary the status module, timing language, and relevant action. Consistency helps customers recognize the message; the delayed version can add a warmer explanation, while partial shipment should split items by shipment with separate tracking.",
    timestamp: "2:34 PM",
  },
  {
    id: "email-concepts-15",
    role: "user",
    content:
      "The body copy sounds too luxurious for a receipt: “Your considered selection is now entering its next chapter.” Can we make it human?",
    timestamp: "2:38 PM",
  },
  {
    id: "email-concepts-16",
    role: "assistant",
    variant: "rewrite",
    title: "Confirmation tone",
    content:
      "Thank you, Emma. We’ve received your order and are preparing it now. We’ll email you again as soon as it ships.",
    timestamp: "2:39 PM",
  },
  {
    id: "email-concepts-17",
    role: "user",
    content:
      "What edge cases should the design survive before we call it finished?",
    timestamp: "2:43 PM",
  },
  {
    id: "email-concepts-18",
    role: "assistant",
    content:
      "Test long product names, multiple quantities, discounts, tax-inclusive totals, gift orders, missing images, international addresses, split fulfillment, refunded items, and unusually long tracking links. Also verify dark mode, blocked images, and plain-text fallback.",
    timestamp: "2:44 PM",
  },
  {
    id: "email-concepts-19",
    role: "user",
    content:
      "Give me the final recommendation. I need a clear direction the team can build without blending all the concepts together.",
    timestamp: "2:48 PM",
  },
  {
    id: "email-concepts-20",
    role: "assistant",
    variant: "steps",
    title: "Recommended direction",
    content:
      "Choose the quiet editorial concept, but anchor it in a strict transactional hierarchy.",
    points: [
      "Open with status, order number, and delivery expectation.",
      "Use a single-column mobile-first receipt with complete totals.",
      "Keep the warm copy brief and secondary to order facts.",
      "Reuse the structure across statuses, then validate accessibility and edge cases.",
    ],
    timestamp: "2:49 PM",
  },
];
