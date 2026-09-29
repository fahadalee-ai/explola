import { createFileRoute } from "@tanstack/react-router";
import { CompareScreen } from "@/screens/Compare";

export const Route = createFileRoute("/compare")({
  component: CompareScreen,
});
