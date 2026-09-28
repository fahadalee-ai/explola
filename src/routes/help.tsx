import { createFileRoute } from "@tanstack/react-router";
import { HelpScreen } from "@/screens/ProfileScreens";

export const Route = createFileRoute("/help")({
  component: HelpScreen,
});
