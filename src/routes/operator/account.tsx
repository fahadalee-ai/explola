import { createFileRoute } from "@tanstack/react-router";
import { OperatorAccount } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/account")({
  component: OperatorAccount,
});
