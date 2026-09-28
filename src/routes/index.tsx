import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "@/screens/Gate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explola — Explore with Confidence" },
      { name: "description", content: "A travel discovery platform for verified African safari and tour operators." },
    ],
  }),
  component: SplashScreen,
});
