import { createFileRoute } from "@tanstack/react-router";
import { ChatHome } from "@/components/chat-home";
export const Route = createFileRoute("/v1")({ component: () => <ChatHome variant="piano" number="01" name="Piano Keys" /> });
