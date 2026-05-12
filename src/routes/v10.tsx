import { createFileRoute } from "@tanstack/react-router";
import { ChatHome } from "@/components/chat-home";
export const Route = createFileRoute("/v10")({ component: () => <ChatHome variant="stack" number="10" name="Stacked Cards" /> });
