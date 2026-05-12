import { createFileRoute } from "@tanstack/react-router";
import { ChatHome } from "@/components/chat-home";
export const Route = createFileRoute("/v7")({ component: () => <ChatHome variant="dot" number="07" name="Dot Matrix" /> });
