import { createFileRoute } from "@tanstack/react-router";
import { OperatorOnboarding } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/onboarding")({
  component: OperatorOnboarding,
});
