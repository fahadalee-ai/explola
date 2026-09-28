import { createFileRoute } from "@tanstack/react-router";
import { OperatorReviews } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/reviews")({
  component: OperatorReviews,
});
