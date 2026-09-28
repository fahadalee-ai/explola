import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/screens/Gate";

export const Route = createFileRoute("/login")({
  component: LoginScreen,
});
