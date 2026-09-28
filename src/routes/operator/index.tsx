import { createFileRoute } from "@tanstack/react-router";
import { OperatorDashboard } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/")({
  component: OperatorDashboard,
});
