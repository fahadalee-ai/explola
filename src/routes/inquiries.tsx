import { createFileRoute } from "@tanstack/react-router";
import { InquiriesScreen } from "@/screens/Inbox";

export const Route = createFileRoute("/inquiries")({
  component: InquiriesScreen,
});
