import { createFileRoute } from "@tanstack/react-router";
import { ChatHome } from "@/components/chat-home";
export const Route = createFileRoute("/v4")({ component: () => <ChatHome variant="depth3d" number="04" name="3D Depth" /> });
