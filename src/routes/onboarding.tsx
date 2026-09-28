import { createFileRoute } from "@tanstack/react-router";
import { OnboardingScreen } from "@/screens/Gate";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingScreen,
});
