import { createFileRoute } from "@tanstack/react-router";
import { SignupScreen } from "@/screens/Gate";

export const Route = createFileRoute("/signup")({
  component: SignupScreen,
});
