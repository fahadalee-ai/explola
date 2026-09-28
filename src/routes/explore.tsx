import { createFileRoute } from "@tanstack/react-router";
import { ExploreScreen } from "@/screens/Explore";

export const Route = createFileRoute("/explore")({
  component: ExploreScreen,
});
