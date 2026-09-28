import { createFileRoute } from "@tanstack/react-router";
import { SettingsScreen } from "@/screens/ProfileScreens";

export const Route = createFileRoute("/settings")({
  component: SettingsScreen,
});
