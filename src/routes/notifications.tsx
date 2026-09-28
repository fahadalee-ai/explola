import { createFileRoute } from "@tanstack/react-router";
import { NotificationsScreen } from "@/screens/Inbox";

export const Route = createFileRoute("/notifications")({
  component: NotificationsScreen,
});
