import { createFileRoute } from "@tanstack/react-router";
import { ListingsScreen } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/listings")({
  component: ListingsScreen,
});
