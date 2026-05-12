import { createFileRoute } from "@tanstack/react-router";
import { ChatHome } from "@/components/chat-home";
export const Route = createFileRoute("/v2")({ component: () => <ChatHome variant="doc" number="02" name="Document Paper" /> });
