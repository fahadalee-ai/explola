import { createFileRoute } from "@tanstack/react-router";
import { OperatorInquiries } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/inquiries")({
  component: OperatorInquiries,
});
