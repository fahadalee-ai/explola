import { createFileRoute } from "@tanstack/react-router";
import { SavedScreen } from "@/screens/Inbox";

export const Route = createFileRoute("/saved")({
  component: SavedScreen,
});
