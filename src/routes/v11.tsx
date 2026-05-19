import { createFileRoute } from "@tanstack/react-router";
import { ChatHome } from "@/components/chat-home";
export const Route = createFileRoute("/v11")({ component: () => <ChatHome variant="clean" number="11" name="Cupertino Clean" /> });
