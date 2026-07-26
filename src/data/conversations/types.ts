export type AttachKind = "file" | "image" | "audio" | "video" | "url" | "text";

export type Attachment = {
  id: string;
  kind: AttachKind;
  name: string;
  meta?: string;
};

export type MessageVariant = "prose" | "steps" | "rewrite" | "code" | "table";

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  variant?: MessageVariant;
  title?: string;
  points?: string[];
  code?: { language: string; value: string };
  table?: { headers: string[]; rows: string[][] };
  streaming?: boolean;
  attachments?: Attachment[];
};
