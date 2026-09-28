import { createFileRoute } from "@tanstack/react-router";
import { PlansScreen } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/plans")({
  component: PlansScreen,
});
