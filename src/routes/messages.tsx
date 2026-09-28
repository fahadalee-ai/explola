import { createFileRoute } from "@tanstack/react-router";
import { MessagesScreen } from "@/screens/Inbox";

export const Route = createFileRoute("/messages")({
  component: MessagesScreen,
});
