import { createFileRoute } from "@tanstack/react-router";
import { PreferencesScreen } from "@/screens/Gate";

export const Route = createFileRoute("/preferences")({
  component: PreferencesScreen,
});
