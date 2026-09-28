import { createFileRoute } from "@tanstack/react-router";
import { ReviewScreen } from "@/screens/Inbox";

export const Route = createFileRoute("/review/$id")({
  validateSearch: (search: Record<string, unknown>): { tour?: string } => ({
    tour: typeof search.tour === "string" ? search.tour : undefined,
  }),
  component: ReviewRoute,
});

function ReviewRoute() {
  const { id } = Route.useParams();
  const { tour } = Route.useSearch();
  return <ReviewScreen operatorId={id} tourId={tour} />;
}
