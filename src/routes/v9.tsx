import { createFileRoute } from "@tanstack/react-router";
import { ChatHome } from "@/components/chat-home";
export const Route = createFileRoute("/v9")({ component: () => <ChatHome variant="etch" number="09" name="Etched Wireframe" /> });
